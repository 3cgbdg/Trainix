import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { getMeasurement } from "../controllers/measerementsController";

const MeasurementsRoute = express.Router();

MeasurementsRoute.get("/measurements", authMiddleware,getMeasurement );

export default MeasurementsRoute;

