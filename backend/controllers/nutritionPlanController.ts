import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import NutritionPlan from "../models/NutritionPlan";

export const createNutritionPlan = async (req: Request, res: Response): Promise<void> => {
    const  data  = req.body;
    console.log(data);
    try {
        const nutritionPlan = new NutritionPlan({ userId: (req as AuthRequest).userId, days: data, createdAt: new Date() });
        if (nutritionPlan) {
        }
        await nutritionPlan.save();
        res.status(201).json({ message: "Nutrition plan created!" });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

