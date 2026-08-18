// imported as the very first line of server.ts, before anything else (including
// ./app) — dotenv has to run before any module-scope `process.env.*` read, and
// Sentry has to init before the modules it instruments are loaded
import dotenv from "dotenv";
dotenv.config();

import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 0.1,
        environment: process.env.NODE_ENV || "development",
    });
} else {
    console.warn("SENTRY_DSN not set; error monitoring is disabled.");
}
