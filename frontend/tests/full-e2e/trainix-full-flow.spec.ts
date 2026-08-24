import { expect, test } from "@playwright/test";

const providerURL = process.env.QA_PROVIDER_URL;

if (!providerURL) throw new Error("QA_PROVIDER_URL is required for the isolated full-flow suite");

test("new user completes the Trainix measurement, workout, nutrition, refresh, and responsive flow", async ({ page, context, request }) => {
  const requestFailures: string[] = [];
  const unexpectedResponses: string[] = [];
  const consoleErrors: string[] = [];
  let observeRefresh = false;
  let refreshResponses = 0;
  let expiredSessionResponses = 0;
  let backendSocketOpened = false;

  page.on("requestfailed", (failed) => {
    const errorText = failed.failure()?.errorText ?? "failed";
    const controlledCancellation = [
      "/api/fitness-plan/reports/numbers",
      "/api/fitness-plan/analysis",
      "/api/measurement/measurements",
    ].some((path) => failed.url().includes(path));
    if (failed.method() === "GET" && errorText.includes("ERR_ABORTED") && controlledCancellation) return;
    requestFailures.push(`${failed.method()} ${failed.url()}: ${errorText}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("401 (Unauthorized)")) consoleErrors.push(message.text());
  });
  page.on("websocket", (socket) => {
    if (socket.url().includes("127.0.0.1:5210")) backendSocketOpened = true;
  });
  page.on("response", (response) => {
    const url = response.url();
    if (observeRefresh && response.status() === 401) expiredSessionResponses += 1;
    if (observeRefresh && url.includes("/api/auth/refresh") && response.status() === 200) refreshResponses += 1;
    if (response.status() >= 400 && !(observeRefresh && response.status() === 401)) {
      unexpectedResponses.push(`${response.status()} ${response.request().method()} ${url}`);
    }
  });

  await page.goto("/auth/signup");
  await expect(page.getByRole("dialog", { name: "Cookie notice" })).toBeVisible();
  await page.getByRole("button", { name: "Accept" }).click();
  await page.getByLabel("Name", { exact: true }).fill("QA");
  await page.getByLabel("Surname").fill("Fullflow");
  await page.getByLabel("Date of birth").fill("1994-05-12");
  await page.getByLabel("Gender").selectOption("Female");
  await page.getByLabel("Email").fill("qa.fullflow@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Trainix123A");
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByLabel("Current Weight (kg)").fill("82");
  await page.getByLabel("Current Height (cm)").fill("181");
  await page.getByLabel("Target Weight (kg) - Optional").fill("78");
  await page.getByLabel("Your Fitness Level").selectOption("Intermediate");
  await page.getByLabel("Your Primary Fitness Goal").selectOption("Stay fit");
  const emptyMeasurementResponse = page.waitForResponse((response) => response.url().includes("/api/measurement/measurements") && response.request().method() === "GET");
  await page.getByRole("button", { name: "Continue to Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const emptyMeasurement = await emptyMeasurementResponse;
  expect(emptyMeasurement.status()).toBe(200);
  expect(await emptyMeasurement.json()).toEqual({ hasMeasurement: false, measurement: null });
  await expect(page.getByRole("navigation", { name: "Primary" }).first()).toBeVisible();

  await page.goto("/ai-analysis");
  await page.getByLabel("input").setInputFiles("tests/images/test-body-image.jpg");
  await page.getByRole("button", { name: "btn" }).click();
  await expect(page.getByRole("heading", { name: "Your analysis" })).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText("QA hydration guidance")).toBeVisible();

  const measurementState = await page.evaluate(async () => {
    const response = await fetch("/api/measurement/measurements");
    return { status: response.status, body: await response.json() };
  });
  expect(measurementState.status).toBe(200);
  expect(measurementState.body.metrics).toMatchObject({ weight: 82, height: 181, bodyFatPercent: 22, muscleMass: 31 });

  await page.goto("/workout-plan");
  await expect(page.getByRole("heading", { name: "Workout plan" })).toBeVisible();
  await expect(page.getByText("0 of 28")).toBeVisible();
  await page.getByRole("link", { name: "Start workout" }).click();
  await page.getByRole("button", { name: "Start workout" }).click();
  await page.getByRole("button", { name: "Complete reps" }).click();
  await expect(page.getByRole("heading", { name: "Nice work—you showed up." })).toBeVisible();
  await expect(page.getByText("1", { exact: true }).last()).toBeVisible();

  const completedWorkout = await page.evaluate(async () => {
    const response = await fetch("/api/fitness-plan/workouts");
    return response.json();
  });
  expect(completedWorkout.streak).toBe(1);
  expect(completedWorkout.items[0].status).toBe("Completed");
  const replayCompletion = await page.evaluate(async () => {
    const response = await fetch("/api/fitness-plan/workouts/0/completed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ completed: true }]),
    });
    return response.json();
  });
  expect(replayCompletion.streak).toBe(1);

  await page.goto("/nutrition-plan");
  await page.getByRole("button", { name: "Generate meal plan" }).click();
  await expect(page.getByRole("heading", { name: "Today’s nutrition" })).toBeVisible();
  await page.getByRole("button", { name: "Mark as eaten" }).click();
  await expect(page.getByText("Eaten", { exact: true })).toBeVisible();
  await page.getByLabel("Add water").fill("250");
  await page.getByRole("button", { name: "Log" }).click();
  await expect(page.getByText(/250\s*\/\s*2,000 ml/)).toBeVisible();

  const nutritionState = await page.evaluate(async () => {
    const response = await fetch("/api/nutrition-plan/nutrition-plans");
    return response.json();
  });
  expect(nutritionState.meals[0].status).toBe("eaten");
  expect(nutritionState.waterIntake.current).toBe(250);

  const cookies = await context.cookies();
  const accessCookie = cookies.find((cookie) => cookie.name === "access-token");
  expect(accessCookie).toBeDefined();
  await context.clearCookies({ name: "access-token" });
  observeRefresh = true;
  const refreshCompleted = page.waitForResponse((response) => response.url().includes("/api/auth/refresh") && response.status() === 200);
  await page.goto("/dashboard");
  await refreshCompleted;
  await expect(page.getByRole("heading", { name: "Good to see you, QA" })).toBeVisible();
  observeRefresh = false;
  expect(expiredSessionResponses).toBe(1);
  expect(refreshResponses).toBe(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  await page.getByLabel("Email").fill("qa.fullflow@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Trainix123A");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  const persistedReminder = await page.evaluate(async () => {
    const response = await fetch("/api/notification/notifications");
    return response.json();
  });
  expect(persistedReminder).toHaveLength(1);
  expect(persistedReminder[0]).toMatchObject({ topic: "measurement", info: "Reminder: Want to update your metrics?" });

  await page.goto("/profile");
  await page.getByRole("button", { name: "Delete account" }).click();
  await page.getByRole("button", { name: "Yes, delete permanently" }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  const cookiesAfterDeletion = await context.cookies();
  expect(cookiesAfterDeletion.some((cookie) => cookie.name === "access-token" || cookie.name === "refresh-token")).toBe(false);

  const providerStatsResponse = await request.get(`${providerURL}/__qa/stats`);
  expect(providerStatsResponse.ok()).toBe(true);
  expect(await providerStatsResponse.json()).toMatchObject({ photoAnalysis: 1, fitnessPlan: 28, nutritionPlan: 1 });
  expect(backendSocketOpened).toBe(true);
  expect(requestFailures).toEqual([]);
  expect(unexpectedResponses).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
