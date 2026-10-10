import express from "express"
import rateLimit from "express-rate-limit";
import { analyzeMeasurementPhoto, createMeasurement, getMeasurement } from "../controllers/measerementsController";
import { uploadSinglePhoto } from "../middlewares/uploadMiddleware";

const measurementsRoute = express.Router();

// each scan is an image upload plus a CV/vision model run, so it's both the
// slowest and the most expensive thing a single user can trigger repeatedly
const analyzeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many body scans. Please try again later." },
});

measurementsRoute.get("/measurements", getMeasurement );
measurementsRoute.post("/measurements", createMeasurement );
measurementsRoute.post("/analyze", analyzeLimiter, uploadSinglePhoto("image"), analyzeMeasurementPhoto);

export default measurementsRoute;

