import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Measurement from "../models/Measurement";
import User from "../models/User";
import { AiServiceError, requestPhotoAnalysis } from "../utils/aiClient";

// getting measurement func
export const getMeasurement = async (req: Request, res: Response): Promise<void> => {
    try {
        const measurement = await Measurement.findOne({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 }).lean();
        if (!measurement) {
            res.status(200).json({ hasMeasurement: false, measurement: null });
            return;
        }
        res.status(200).json(measurement);
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}
export const createMeasurement = async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    try {
        const measurement = await Measurement.create({ userId: (req as AuthRequest).userId, metrics: body.metrics, imageUrl: body.imageUrl });
        res.status(200).json({ message: "Successfully created!", measurement });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// Body-scan entry point. The browser used to POST the photo straight to the Python
// CV service (credentialed, cross-origin, with file validation living only in the
// dropzone widget). It now goes through here instead, so the upload is validated
// server-side, the AI service needs no public ingress, and the resulting
// measurement is persisted in the same request the user is already waiting on.
export const analyzeMeasurementPhoto = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = (req as Request & { file?: Express.Multer.File }).file;
        if (!file) {
            res.status(400).json({ message: "A photo is required." });
            return;
        }
        const user = await User.findById((req as AuthRequest).userId).lean();
        if (!user) {
            res.status(404).json({ message: "User was not found!" });
            return;
        }

        const { metrics, imageUrl } = await requestPhotoAnalysis(file, {
            height: user.metrics?.height,
            weight: user.metrics?.weight,
            targetWeight: user.targetWeight,
            primaryFitnessGoal: user.primaryFitnessGoal,
            fitnessLevel: user.fitnessLevel,
            gender: user.gender,
        });
        if (!imageUrl) {
            res.status(502).json({ message: "The analysis service returned no image." });
            return;
        }

        const measurement = await Measurement.create({
            userId: (req as AuthRequest).userId,
            metrics,
            imageUrl,
        });
        res.status(201).json({ message: "Successfully created!", measurement });
        return;
    } catch (err) {
        if (err instanceof AiServiceError) {
            res.status(502).json({ message: err.message });
            return;
        }
        console.error("Photo analysis failed", err);
        res.status(500).json({ message: "Server error!" });
        return;
    }
}
