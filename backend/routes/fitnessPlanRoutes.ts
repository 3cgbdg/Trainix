import express from "express"
import rateLimit from "express-rate-limit";
import { addFitnessDay, completeWorkout, deleteFitnessPlan, generateFitnessDay, generateFitnessPlan, getAnalysis, getNumbers, getWorkout, getWorkouts } from "../controllers/fitnessPlanController";

const fitnessPlanRoute = express.Router();

// this kicks off 28 sequential AI calls (+ S3/image uploads) in the background per
// request. It's already metered per-calendar-month for free-tier *new* plans via
// consumeFreeTierPlanQuota, but regenerating an existing plan is intentionally not
// quota-limited, and premium accounts have no quota at all - so without a request
// rate limit here, this endpoint can be hit in a tight loop (by the account owner,
// a compromised session, or a forged cross-site request riding the session cookie)
// to spin up unbounded concurrent AI-generation jobs and burn AI/S3 spend.
const generatePlanLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many plan generation requests. Please try again later." },
});

// regenerating one day is a single AI call rather than 28, so it gets a looser cap
const generateDayLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many workout generation requests. Please try again later." },
});

fitnessPlanRoute.get("/reports/numbers", getNumbers);
fitnessPlanRoute.get("/workouts", getWorkouts);
fitnessPlanRoute.post("/generate", generatePlanLimiter, generateFitnessPlan);
fitnessPlanRoute.post("/days", addFitnessDay);
fitnessPlanRoute.get("/analysis", getAnalysis);
fitnessPlanRoute.delete("/plan", deleteFitnessPlan);
fitnessPlanRoute.post("/workouts/:day/completed", completeWorkout);
fitnessPlanRoute.post("/workouts/:day/generate", generateDayLimiter, generateFitnessDay);
fitnessPlanRoute.get("/workouts/:day", getWorkout);

export default fitnessPlanRoute;

