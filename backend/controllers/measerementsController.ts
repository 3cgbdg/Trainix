import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Measurement from "../models/Measurement";

// getting measurement func
export const getMeasurement = async (req: Request, res: Response): Promise<void> => {
    try {
        const measurement = await Measurement.findOne({userId:(req as AuthRequest).userId}).sort({ createdAt: -1 });
        if (!measurement) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        res.json(measurement);
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

