import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { createNutritionPlan, getNutritionDay, getWeekStatistics, updateMealStatus, updateWaterCurrent } from "../controllers/nutritionPlanController";

const nutritionPlanRoute = express.Router();


nutritionPlanRoute.post("/nutrition-plans/days", createNutritionPlan);
nutritionPlanRoute.get("/nutrition-plans", getNutritionDay);
nutritionPlanRoute.get("/statistics", getWeekStatistics);
nutritionPlanRoute.patch("/nutrition-plans/days/:day/meal/status", updateMealStatus);
nutritionPlanRoute.patch("/nutrition-plans/days/:day/water", updateWaterCurrent);

export default nutritionPlanRoute;

