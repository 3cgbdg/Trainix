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
// dotenv config
dotenv.config();

export const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
nodeCron.schedule("0 0 * * * *", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fitnessPlans = await FitnessPlan.find({});
    for (let plan of fitnessPlans) {
        let changed = false;
        for (let day of plan.report.plan.days) {
            if (day.status == "Pending") break;
            if (day.status !== "Completed" && (today > new Date(day.date))) {
                day.status = "Missed";
                changed = true
                plan.report.streak = 0
            }

        }
        if (changed) {
            plan.markModified("report.plan.days");
            plan.markModified("report");
            await plan.save();
        }
        plan.markModified(`report`);
        await plan.save();
    }

})
nodeCron.schedule("0 0 * * * *", async () => {
    console.log("hello")
    await sendEmail("bogdantytysh5@gmail.com", "Welcome to Trainix 🎉",
        "<h1>Привіт!</h1><p>Дякуємо за реєстрацію 🚀</p>")

})
// routing
app.use("/api/auth", authRoute);
app.use("/api/fitness-plan", fitnessPlanRoute);
app.use("/api/nutrition-plan", nutritionPlanRoute);
app.use("/api/measurement", MeasurementsRoute);

//route for testing auth middleware
// app.get("/api/protected",authMiddleware, async (req: Request, res: Response) => {
//     return res.status(200).json("Route is protected");
// })


