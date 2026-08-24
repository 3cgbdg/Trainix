import { spawn } from "node:child_process";
import { createServer as createHttpServer } from "node:http";
import { createRequire } from "node:module";
import { createServer as createNetServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { once } from "node:events";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const backendDir = path.join(repoRoot, "backend");
const frontendDir = path.join(repoRoot, "frontend");
const requireBackend = createRequire(path.join(backendDir, "package.json"));
const { MongoMemoryServer } = requireBackend("mongodb-memory-server");
const mongoose = requireBackend("mongoose");

const webPort = 3100;
const apiPort = 5210;
const providerPort = 5310;
const webURL = `http://127.0.0.1:${webPort}`;
const apiURL = `http://127.0.0.1:${apiPort}`;
const providerURL = `http://127.0.0.1:${providerPort}`;
const children = [];
const logs = new Map();
let mongo;
let provider;
let artifacts;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function assertPortFree(port) {
  const server = createNetServer();
  server.unref();
  server.on("error", (error) => {
    throw new Error(`QA port ${port} is already in use: ${error.message}`);
  });
  server.listen(port, "127.0.0.1");
  await once(server, "listening");
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

function safeEnvironment(overrides) {
  const env = { ...process.env, ...overrides };
  for (const name of [
    "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN", "AWS_S3_BUCKET_NAME", "REGION_NAME",
    "UNSPLASH_ACCESS_KEY", "STRIPE_SECRET_KEY", "STRIPE_PRICE_ID_PREMIUM", "STRIPE_WEBHOOK_SECRET",
    "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM", "SENTRY_DSN", "SENTRY_AUTH_TOKEN",
  ]) delete env[name];
  return env;
}

function startChild(name, args, cwd, env) {
  const child = spawn(process.execPath, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
  const output = [];
  const capture = (chunk) => {
    output.push(chunk.toString());
    if (output.length > 200) output.shift();
  };
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);
  logs.set(name, output);
  children.push({ name, child });
  return child;
}

async function waitForHttp(url, timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      await fetch(url, { redirect: "manual" });
      return;
    } catch (error) {
      lastError = error;
      await delay(200);
    }
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError?.message ?? "no response"}`);
}

function json(response, status, body, origin = webURL) {
  response.writeHead(status, {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Origin": origin,
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function fitnessReport(dayNumber) {
  return {
    briefAnalysis: { targetWeight: 78, fitnessLevel: "Intermediate", primaryFitnessGoal: "Stay fit" },
    advices: {
      nutrition: "QA nutrition guidance",
      hydration: "QA hydration guidance",
      recovery: "QA recovery guidance",
      progress: "QA progress guidance",
    },
    week1Title: "Foundation",
    week2Title: "Build",
    week3Title: "Progress",
    week4Title: "Finish",
    day: {
      day: `QA Strength Day ${dayNumber}`,
      dayNumber,
      calories: 120,
      status: "Pending",
      date: new Date().toISOString(),
      exercises: [{
        imageUrl: "exercise-placeholder.jpg",
        status: "incompleted",
        calories: 120,
        title: "QA Squat",
        repeats: 1,
        time: null,
        instruction: "Stand tall and complete one controlled squat.",
        advices: "Keep your knees tracking over your toes.",
      }],
    },
  };
}

function createProviderServer() {
  const stats = { photoAnalysis: 0, fitnessPlan: 0, fitnessDay: 0, nutritionPlan: 0 };
  const server = createHttpServer(async (request, response) => {
    const url = new URL(request.url ?? "/", providerURL);
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Origin": webURL,
      });
      response.end();
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/ping") return json(response, 200, { ok: true });
    if (request.method === "GET" && url.pathname === "/__qa/stats") return json(response, 200, stats, "*");
    if (request.method !== "POST") return json(response, 404, { message: "Not found" });

    await readBody(request);
    if (url.pathname === "/api/photo-analyze") {
      stats.photoAnalysis += 1;
      return json(response, 200, {
        AIreport: JSON.stringify({
          height: 181, weight: 82, waistToHipRatio: 0.82, shoulderToWaistRatio: 1.42,
          bodyFatPercent: 22, muscleMass: 31, leanBodyMass: 64,
        }),
        imageUrl: "/food-placeholder.jpg",
      });
    }
    if (url.pathname === "/api/fitnessPlan") {
      stats.fitnessPlan += 1;
      const dayNumber = Number(url.searchParams.get("dayNumber"));
      if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 28) return json(response, 400, { detail: "Invalid dayNumber" });
      return json(response, 200, { AIreport: JSON.stringify(fitnessReport(dayNumber)) });
    }
    if (url.pathname === "/api/fitnessPlan/day") {
      stats.fitnessDay += 1;
      return json(response, 200, { AIreport: JSON.stringify(fitnessReport(1)) });
    }
    if (url.pathname === "/api/nutrition") {
      stats.nutritionPlan += 1;
      return json(response, 200, { AIreport: JSON.stringify({
        dayNumber: 1,
        dailyGoals: {
          calories: { current: 0, target: 2100 }, protein: { current: 0, target: 130 },
          carbs: { current: 0, target: 240 }, fats: { current: 0, target: 70 },
        },
        meals: [{
          mealTitle: "QA Breakfast", time: "10 minutes", imageUrl: "food-placeholder.jpg",
          description: "A deterministic meal for isolated QA.", ingredients: ["Oats", "Berries"],
          preparation: "Combine ingredients. Serve immediately.", mealCalories: 450, mealProtein: 25,
          mealCarbs: 60, mealFats: 12, status: "pending", foodIntake: "Breakfast",
        }],
        waterIntake: { current: 0, target: 2000 },
      }) });
    }
    return json(response, 404, { message: "Not found" });
  });
  return { server, stats };
}

async function stopChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), delay(5_000)]);
  if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
}

async function cleanup(success) {
  for (const { child } of [...children].reverse()) await stopChild(child);
  if (provider) await new Promise((resolve) => provider.close(resolve));
  if (mongo) await mongo.stop();
  if (artifacts && success) await rm(artifacts, { recursive: true, force: true });
}

let success = false;
try {
  await Promise.all([assertPortFree(webPort), assertPortFree(apiPort), assertPortFree(providerPort)]);
  artifacts = await mkdtemp(path.join(os.tmpdir(), "trainix-qa-artifacts-"));
  mongo = await MongoMemoryServer.create();
  const mongoURI = mongo.getUri();

  await mongoose.connect(mongoURI);
  await mongoose.connection.db.collection("exerciseimages").insertOne({ name: "QA Squat", imageUrl: "exercise-placeholder.jpg" });
  await mongoose.connection.db.collection("mealimages").insertOne({ name: "QA Breakfast", imageUrl: "food-placeholder.jpg" });
  await mongoose.disconnect();

  const providerFixture = createProviderServer();
  provider = providerFixture.server;
  provider.listen(providerPort, "127.0.0.1");
  await once(provider, "listening");

  startChild("backend", ["-r", path.join(backendDir, "node_modules/ts-node/register/transpile-only"), path.join(backendDir, "server.ts")], backendDir, safeEnvironment({
    NODE_ENV: "test", PORT: String(apiPort), MONGO_URI: mongoURI, JWT_SECRET: "trainix-isolated-qa-secret",
    CORS_ORIGIN: webURL, FRONTEND_URL: webURL, PYTHON_API_URL: providerURL,
  }));
  await waitForHttp(`${apiURL}/api/auth/profile`);

  startChild("frontend", [path.join(frontendDir, "node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", String(webPort)], frontendDir, safeEnvironment({
    NODE_ENV: "development", API_URL: apiURL, NEXT_PUBLIC_API_URL: apiURL, NEXT_PUBLIC_PYTHON_API_URL: providerURL,
    NEXT_TELEMETRY_DISABLED: "1",
  }));
  await waitForHttp(webURL, 60_000);

  const playwright = startChild("playwright", [path.join(frontendDir, "node_modules/@playwright/test/cli.js"), "test", "-c", "playwright.full.config.ts", "--reporter=line"], frontendDir, safeEnvironment({
    QA_WEB_BASE_URL: webURL, QA_PROVIDER_URL: providerURL, QA_ARTIFACT_DIR: artifacts,
  }));
  const [exitCode] = await once(playwright, "exit");
  if (exitCode !== 0) throw new Error(`Full-flow Playwright exited with code ${exitCode}`);
  success = true;
  process.stdout.write(`PASS isolated full flow: AI photo/plan contracts, workout completion, nutrition updates, refresh, socket, and responsive shell.\n`);
} catch (error) {
  console.error(error);
  for (const [name, output] of logs) {
    if (output.length) console.error(`\n--- ${name} (tail) ---\n${output.join("")}`);
  }
  if (artifacts) console.error(`Failure artifacts retained at ${artifacts}`);
  process.exitCode = 1;
} finally {
  await cleanup(success);
}
