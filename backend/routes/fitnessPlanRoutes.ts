import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { addReport, completeWorkout, deleteFitnessPlan, getAnalysis, getNumbers, getWorkout, getWorkouts } from "../controllers/fitnessPlanController";

const fitnessPlanRoute = express.Router();

fitnessPlanRoute.get("/reports/numbers", authMiddleware, getNumbers);
fitnessPlanRoute.get("/workouts", authMiddleware, getWorkouts);
fitnessPlanRoute.post("/reports", authMiddleware, addReport);
fitnessPlanRoute.get("/analysis", authMiddleware, getAnalysis);
fitnessPlanRoute.delete("/plan", authMiddleware, deleteFitnessPlan);
fitnessPlanRoute.post("/workouts/:day/completed", authMiddleware, completeWorkout);
fitnessPlanRoute.get("/workouts/:day", authMiddleware, getWorkout);

export default fitnessPlanRoute;

