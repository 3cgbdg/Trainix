import { defineConfig } from '@playwright/test';

const qaPort = Number(process.env.QA_WEB_PORT || 3100);
const qaBaseURL = process.env.QA_WEB_BASE_URL || `http://localhost:${qaPort}`;

export default defineConfig({
    timeout: 120_000,
    testDir: './tests/e2e',
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    use: {
        baseURL: qaBaseURL,
        headless: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    webServer: {
        command: `npm run dev -- --port ${qaPort}`,
        url: qaBaseURL,
        reuseExistingServer: !process.env.CI,
    },
});
