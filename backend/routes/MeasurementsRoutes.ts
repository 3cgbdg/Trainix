import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { createMeasurement, getMeasurement } from "../controllers/measerementsController";

const measurementsRoute = express.Router();

measurementsRoute.get("/measurements", getMeasurement );
measurementsRoute.post("/measurements", createMeasurement );

export default measurementsRoute;

