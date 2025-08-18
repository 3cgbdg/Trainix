import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import NutritionPlan from "../models/NutritionPlan";

export const createNutritionPlan = async (req: Request, res: Response): Promise<void> => {
    const { data } = req.body;
    try {
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() + data.dayNumber - 1);
        console.log(dayDate);
        const obj = { ...data, date: dayDate };
        let nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
        if (nutritionPlan) {

            nutritionPlan.days.push(obj);
            await nutritionPlan.save();
            res.status(200).json({ message: "Successfully added day!" });
            return;
        } else {
            nutritionPlan = await NutritionPlan.create({ userId: (req as AuthRequest).userId, "days": [obj], createdAt: new Date() });
            res.status(201).json({ message: "Nutrition plan created!" });
            return;
        }


    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}


export const getNutritionDay = async (req: Request, res: Response): Promise<void> => {
    try {
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
        if (!nutritionPlan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        const idxOfCurrentDay = Math.floor(
            (new Date().getTime() - new Date(nutritionPlan.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        res.status(200).json(nutritionPlan.days[idxOfCurrentDay]);
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

export const getWeekStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { week } = req.query;
        const weekNumber = Number(week);
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
        if (!nutritionPlan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }

        const days = nutritionPlan.days;
        let data = [];

        for (let i = 7 * weekNumber - 7; i < 7 * weekNumber; i++) {
            data.push({ day: days[i].date.toLocaleDateString("en-US", { weekday: "short" }), calories: days[i].dailyGoals.calories.current, protein: days[i].dailyGoals.protein.current, carbs: days[i].dailyGoals.carbs.current, fats: days[i].dailyGoals.fats.current })


        }

        res.status(200).json(data);
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}
export const updateMealStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { day } = req.params;
        const mealNum = req.body;
        const dayNum = Number(day);
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
        if (!nutritionPlan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        nutritionPlan.days[dayNum].meals[mealNum].status = "eaten";
        await nutritionPlan.save()
        res.status(200).json("Status updated!");
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}


