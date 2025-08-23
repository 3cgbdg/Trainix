import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
// route import
import authRoute from "./routes/authRoutes"
import fitnessPlanRoute from "./routes/fitnessPlanRoutes";
import nodeCron from "node-cron";
import FitnessPlan from "./models/FitnessPlan";
import nutritionPlanRoute from "./routes/nutritionPlanRoutes";
import MeasurementsRoute from "./routes/MeasurementsRoutes";
import { sendEmail } from "./utils/email";
import notificationRoute from "./routes/notificationRoutes";
import { cronNotifs } from "./utils/cronNotifs";
// dotenv config
dotenv.config();
export const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));


cronNotifs();

// routing
app.use("/api/auth", authRoute);
app.use("/api/fitness-plan", fitnessPlanRoute);
app.use("/api/nutrition-plan", nutritionPlanRoute);
app.use("/api/measurement", MeasurementsRoute);
app.use("/api/notification", notificationRoute);

//route for testing auth middleware
// app.get("/api/protected",authMiddleware, async (req: Request, res: Response) => {
//     return res.status(200).json("Route is protected");
// })


