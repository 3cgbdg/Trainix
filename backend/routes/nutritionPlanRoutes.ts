import express from "express"
import rateLimit from "express-rate-limit";
import { createNutritionPlan, generateNutritionDay, getNutritionDay, getWeekStatistics, updateMealStatus, updateWaterCurrent } from "../controllers/nutritionPlanController";

const nutritionPlanRoute = express.Router();

// one AI call plus image uploads per request
const generateDayLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many meal plan requests. Please try again later." },
});

nutritionPlanRoute.post("/nutrition-plans/generate", generateDayLimiter, generateNutritionDay);
nutritionPlanRoute.post("/nutrition-plans/days", createNutritionPlan);
nutritionPlanRoute.get("/nutrition-plans", getNutritionDay);
nutritionPlanRoute.get("/statistics", getWeekStatistics);
nutritionPlanRoute.patch("/nutrition-plans/days/:day/meal/status", updateMealStatus);
nutritionPlanRoute.patch("/nutrition-plans/days/:day/water", updateWaterCurrent);

export default nutritionPlanRoute;

