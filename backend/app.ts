import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
// route import
import authRoute from "./routes/authRoutes"
import fitnessPlanRoute from "./routes/fitnessPlanRoutes";
import nutritionPlanRoute from "./routes/nutritionPlanRoutes";
import notificationRoute from "./routes/notificationRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";
import measurementsRoute from "./routes/measurementsRoutes";
import billingRoute from "./routes/billingRoutes";
import { handleWebhook } from "./controllers/billingController";
// dotenv config
dotenv.config();
export const app = express();
// Render terminates TLS at its proxy. Trust exactly that first hop so
// express-rate-limit keys clients by their forwarded address in production.
app.set("trust proxy", 1);
app.use(compression());
app.use(cookieParser());

// Stripe verifies this endpoint's signature against the raw request body, so
// it has to be registered (with a raw, not JSON, body parser) before the
// global express.json() below would otherwise consume and reserialize it
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));



// routing
app.use("/api/auth", authRoute);
app.use("/api/fitness-plan", authMiddleware, fitnessPlanRoute);
app.use("/api/nutrition-plan", authMiddleware, nutritionPlanRoute);
app.use("/api/measurement", authMiddleware, measurementsRoute);
app.use("/api/notification", authMiddleware, notificationRoute);
app.use("/api/billing", authMiddleware, billingRoute);

// reports unhandled errors to Sentry (no-op if SENTRY_DSN was never set, e.g.
// in tests, which import this app module directly without going through
// server.ts/instrument.ts) before they reach the catch-all handler below
if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}

// catch-all error handler — must be registered last, and must keep all four
// params so Express recognizes it as an error handler instead of regular middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    if (res.headersSent) {
        next(err);
        return;
    }
    res.status(500).json({ message: "Server error!" });
});

