import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { createNutritionPlan, getNutritionDay, getWeekStatistics, updateMealStatus, updateWaterCurrent } from "../controllers/nutritionPlanController";

const nutritionPlanRoute = express.Router();


nutritionPlanRoute.post("/nutrition-plans/days", authMiddleware,createNutritionPlan );
nutritionPlanRoute.get("/nutrition-plans", authMiddleware,getNutritionDay );
nutritionPlanRoute.get("/statistics", authMiddleware,getWeekStatistics );
nutritionPlanRoute.patch("/nutrition-plans/days/:day/meal/status", authMiddleware,updateMealStatus );
nutritionPlanRoute.patch("/nutrition-plans/days/:day/water", authMiddleware,updateWaterCurrent );

export default nutritionPlanRoute;

