import { defineConfig } from "@playwright/test";

const baseURL = process.env.QA_WEB_BASE_URL;

if (!baseURL) throw new Error("QA_WEB_BASE_URL is required for the isolated full-flow suite");

export default defineConfig({
  testDir: "./tests/full-e2e",
  outputDir: process.env.QA_ARTIFACT_DIR,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  forbidOnly: true,
  use: {
    baseURL,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
