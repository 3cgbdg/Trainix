import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { addReport } from "../controllers/fitnessPlanController";

const fitnessPlanRoute = express.Router();

fitnessPlanRoute.post("/reports", authMiddleware, addReport);
export default fitnessPlanRoute;

