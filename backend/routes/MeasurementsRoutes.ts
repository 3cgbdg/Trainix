import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { getMeasurement } from "../controllers/measerementsController";

const measurementsRoute = express.Router();

measurementsRoute.get("/measurements", getMeasurement );

export default measurementsRoute;

