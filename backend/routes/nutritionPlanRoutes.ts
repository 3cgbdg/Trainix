import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { createNutritionPlan, getNutritionDay } from "../controllers/nutritionPlanController";

const nutritionPlanRoute = express.Router();


nutritionPlanRoute.post("/nutrition-plans/days", authMiddleware,createNutritionPlan );
nutritionPlanRoute.get("/nutrition-plans", authMiddleware,getNutritionDay );

export default nutritionPlanRoute;

