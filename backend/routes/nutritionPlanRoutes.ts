import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { createNutritionPlan } from "../controllers/nutritionPlanController";

const nutritionPlanRoute = express.Router();


nutritionPlanRoute.post("/nutrition-plans", authMiddleware,createNutritionPlan );
export default nutritionPlanRoute;

