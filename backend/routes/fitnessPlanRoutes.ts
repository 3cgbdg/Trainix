import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { addReport, completeWorkout, deleteFitnessPlan, getAnalysis, getNumbers, getWorkout, getWorkouts } from "../controllers/fitnessPlanController";

const fitnessPlanRoute = express.Router();

fitnessPlanRoute.get("/reports/numbers",  getNumbers);
fitnessPlanRoute.get("/workouts",  getWorkouts);
fitnessPlanRoute.post("/reports",  addReport);
fitnessPlanRoute.get("/analysis",  getAnalysis);
fitnessPlanRoute.delete("/plan",  deleteFitnessPlan);
fitnessPlanRoute.post("/workouts/:day/completed",  completeWorkout);
fitnessPlanRoute.get("/workouts/:day",  getWorkout);

export default fitnessPlanRoute;

