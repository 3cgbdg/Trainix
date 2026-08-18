import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
// route import
import authRoute from "./routes/authRoutes"
import fitnessPlanRoute from "./routes/fitnessPlanRoutes";
import nutritionPlanRoute from "./routes/nutritionPlanRoutes";
import notificationRoute from "./routes/notificationRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";
import measurementsRoute from "./routes/measurementsRoutes";
// dotenv config
dotenv.config();
export const app = express();
app.use(compression());
app.use(cookieParser());
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

