import process from "node:process";

if (process.env.TRAINIX_LIVE_TEST !== "1") {
  throw new Error("Refusing to contact live providers without TRAINIX_LIVE_TEST=1");
}

const apiBase = process.env.TRAINIX_API_URL;
const aiBase = process.env.TRAINIX_AI_URL;
if (!apiBase || !aiBase) {
  throw new Error("TRAINIX_API_URL and TRAINIX_AI_URL are required");
}

const runId = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const email = `qa.live.${runId}@example.com`;
const password = `Qa-${crypto.randomUUID()}!`;
const cookieJar = new Map();
let accountCreated = false;

function updateCookies(response) {
  for (const cookie of response.headers.getSetCookie?.() ?? []) {
    const pair = cookie.split(";", 1)[0];
    const separator = pair.indexOf("=");
    if (separator > 0) cookieJar.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
}

async function request(name, url, options = {}, expected = [200]) {
  const headers = new Headers(options.headers);
  if (cookieJar.size) {
    headers.set("cookie", [...cookieJar].map(([key, value]) => `${key}=${value}`).join("; "));
  }
  const startedAt = Date.now();
  const response = await fetch(url, { ...options, headers, redirect: "manual" });
  updateCookies(response);
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!expected.includes(response.status)) {
    throw new Error(`${name} returned ${response.status}: ${typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body).slice(0, 300)}`);
  }
  process.stdout.write(`${JSON.stringify({ name, status: response.status, ms: Date.now() - startedAt })}\n`);
  return { response, body };
}

function jsonBody(value) {
  return { headers: { "content-type": "application/json" }, body: JSON.stringify(value) };
}

function parseAiReport(value) {
  if (typeof value !== "string") return value;
  const fenced = value.match(/```json\s*([\s\S]+?)```/i);
  return JSON.parse(fenced ? fenced[1] : value);
}

function imageResult(url) {
  return {
    kind: typeof url === "string" && url.startsWith("https://") ? "remote" : "placeholder",
    host: typeof url === "string" && url.startsWith("https://") ? new URL(url).host : null,
  };
}

const profile = {
  height: 180,
  weight: 80,
  targetWeight: 75,
  primaryFitnessGoal: "Gain muscle",
  fitnessLevel: "Intermediate",
  gender: "Male",
  waistToHipRatio: 0.85,
  shoulderToWaistRatio: 1.35,
  bodyFatPercent: 20,
  muscleMass: 32,
  leanBodyMass: 64,
};

const results = {};
try {
  await request("signup", `${apiBase}/api/auth/signup`, { method: "POST", ...jsonBody({
    email, password, name: "QA", surname: "Provider", gender: "Male", dateOfBirth: "1990-01-01",
  }) });
  accountCreated = true;
  await request("onboarding", `${apiBase}/api/auth/onboarding`, { method: "POST", ...jsonBody(profile) });

  const webhook = await request("stripe-webhook-signature", `${apiBase}/api/billing/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": "t=0,v1=invalid" },
    body: "{}",
  }, [400]);
  results.stripeWebhookConfigured = webhook.body?.message === "Invalid signature";

  const checkout = await request("stripe-checkout", `${apiBase}/api/billing/checkout`, { method: "POST" }, [200, 503]);
  const checkoutUrl = String(checkout.body?.url ?? "");
  results.stripe = checkout.response.status === 503 ? { configured: false } : {
    configured: true,
    host: checkoutUrl ? new URL(checkoutUrl).host : null,
    mode: checkoutUrl.includes("cs_test_") ? "test" : checkoutUrl.includes("cs_live_") ? "live" : "unknown",
  };

  await request("smtp-password-reset", `${apiBase}/api/auth/forgot-password`, {
    method: "POST",
    ...jsonBody({ email }),
  });

  const fitnessAi = await request("ai-fitness-plan", `${aiBase}/api/fitnessPlan?dayNumber=1`, {
    method: "POST", ...jsonBody(profile),
  });
  const fitness = parseAiReport(fitnessAi.body?.AIreport);
  if (!fitness?.day?.exercises?.length) throw new Error("AI fitness response has no exercises");
  fitness.day.exercises = fitness.day.exercises.slice(0, 1);
  fitness.day.exercises[0].title = `QA Live Squat ${runId}`;
  const savedFitness = await request("save-fitness-with-image", `${apiBase}/api/fitness-plan/days`, {
    method: "POST", ...jsonBody({ data: fitness }),
  }, [200, 201]);
  const storedFitness = await request("read-saved-fitness", `${apiBase}/api/fitness-plan/workouts`);
  const exerciseUrl = storedFitness.body?.items?.[0]?.exercises?.[0]?.imageUrl;
  results.exerciseImage = imageResult(exerciseUrl);

  const nutritionAi = await request("ai-nutrition", `${aiBase}/api/nutrition?dayNumber=1`, {
    method: "POST", ...jsonBody(profile),
  });
  const nutrition = parseAiReport(nutritionAi.body?.AIreport);
  if (!nutrition?.meals?.length) throw new Error("AI nutrition response has no meals");
  nutrition.meals = nutrition.meals.slice(0, 1);
  nutrition.meals[0].mealTitle = `Oatmeal Breakfast 2026 ${runId}`;
  const savedNutrition = await request("save-nutrition-with-image", `${apiBase}/api/nutrition-plan/nutrition-plans/days`, {
    method: "POST", ...jsonBody({ data: nutrition }),
  }, [200, 201]);
  const mealUrl = savedNutrition.body?.day?.meals?.[0]?.imageUrl;
  results.mealImage = imageResult(mealUrl);

  for (const [name, image, url] of [
    ["exercise-image", results.exerciseImage, exerciseUrl],
    ["meal-image", results.mealImage, mealUrl],
  ]) {
    if (image.kind !== "remote" || !url) continue;
    await request(name, url, { method: "GET" });
  }

  process.stdout.write(`RESULT ${JSON.stringify(results)}\n`);
} finally {
  if (accountCreated) {
    try {
      await request("cleanup-account", `${apiBase}/api/auth/profile`, { method: "DELETE" });
    } catch (error) {
      process.stderr.write(`CLEANUP_FAILED ${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
