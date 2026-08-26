import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import NutritionPlan, { IDayPlanNutrition } from "../models/NutritionPlan";
import { s3ImageUploadingMeal } from "../utils/images";
import MealImage from "../models/MealImage";
import Measurement from "../models/Measurement";
import User from "../models/User";
import { AiServiceError, requestAiReport } from "../utils/aiClient";

// attaches a cached (or freshly uploaded) image to every meal, then appends the day
// to the user's plan - creating the plan if this is their first day. Shared by the
// client-supplied path (createNutritionPlan) and the server-generated one
// (generateNutritionDay) so both produce identically shaped days.
const persistNutritionDay = async (userId: string, data: IDayPlanNutrition): Promise<{ day: IDayPlanNutrition, created: boolean }> => {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() + data.dayNumber - 1);
    let nutritionPlan = await NutritionPlan.findOne({ userId });
    // parallel for optimized using in adding images to each meal
    await Promise.all(
        data.meals.map(async (meal) => {
            const image = await MealImage.findOne({ name: meal.mealTitle });
            if (image) {
                meal.imageUrl = image.imageUrl;
            } else {
                const url = await s3ImageUploadingMeal(meal);
                await MealImage.findOneAndUpdate(
                    { name: meal.mealTitle },
                    { $setOnInsert: { imageUrl: url } },
                    { new: true, upsert: true }
                );
                meal.imageUrl = url;
            }

        }))
    // creating data with a real date of that day
    const obj: IDayPlanNutrition = { ...data, date: dayDate };
    // if plan exists just pushing
    if (nutritionPlan) {
        nutritionPlan.days.push(obj);
        await nutritionPlan.save();
        return { day: obj, created: false };
    }
    // otherwise creating plan with this item
    await NutritionPlan.create({ userId, "days": [obj], createdAt: new Date() });
    return { day: obj, created: true };
}

// func for looping use - adding day to nutrition plan -- creating plan
export const createNutritionPlan = async (req: Request, res: Response): Promise<void> => {
    const { data } = req.body as { data: IDayPlanNutrition };
    try {
        const { day, created } = await persistNutritionDay((req as AuthRequest).userId, data);
        if (created) {
            res.status(201).json({ message: "Nutrition plan created!", day });
            return;
        }
        res.status(200).json({ message: "Successfully added day!", day });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// Generates a nutrition day server-side. Previously the browser called the Python
// service itself, parsed the model's fenced JSON on the client, then POSTed the
// result back here to be saved - which meant two round trips, the AI service being
// publicly reachable, and the client being trusted to send back whatever it liked.
export const generateNutritionDay = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).userId;
        const requestedDay = Number(req.query.dayNumber ?? 1);
        if (!Number.isInteger(requestedDay) || requestedDay < 1 || requestedDay > 28) {
            res.status(400).json({ message: "A valid day number is required." });
            return;
        }
        const [user, measurement] = await Promise.all([
            User.findById(userId).lean(),
            Measurement.findOne({ userId }).sort({ createdAt: -1 }).lean(),
        ]);
        if (!user) {
            res.status(404).json({ message: "User was not found!" });
            return;
        }

        const info = await requestAiReport<IDayPlanNutrition>("/api/nutrition", {
            height: user.metrics?.height,
            weight: user.metrics?.weight,
            targetWeight: user.targetWeight,
            primaryFitnessGoal: user.primaryFitnessGoal,
            fitnessLevel: user.fitnessLevel,
            gender: user.gender,
            waistToHipRatio: measurement?.metrics.waistToHipRatio,
            shoulderToWaistRatio: measurement?.metrics.shoulderToWaistRatio,
            bodyFatPercent: measurement?.metrics.bodyFatPercent,
            muscleMass: measurement?.metrics.muscleMass,
            leanBodyMass: measurement?.metrics.leanBodyMass,
        }, { query: { dayNumber: requestedDay } });

        if (!Array.isArray(info?.meals) || !info?.dailyGoals) {
            res.status(502).json({ message: "The nutrition service returned an invalid meal plan." });
            return;
        }
        // the model doesn't know the plan's real calendar - persistNutritionDay
        // assigns the actual date from dayNumber
        const { day, created } = await persistNutritionDay(userId, { ...info, dayNumber: requestedDay });
        res.status(created ? 201 : 200).json({ message: "Successfully added day!", day });
        return;
    } catch (err) {
        if (err instanceof AiServiceError) {
            res.status(502).json({ message: err.message });
            return;
        }
        console.error("Nutrition day generation failed", err);
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// func for getting nutr. day
export const getNutritionDay = async (req: Request, res: Response): Promise<void> => {
    try {
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId }).lean();
        if (!nutritionPlan) {
            res.status(200).json({ hasPlan: false, hasCurrentDay: false });
            return;
        }
        // idx of the array item -- day
        const idxOfCurrentDay = Math.round(
            (new Date().getTime() - new Date(nutritionPlan.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const currentDay = nutritionPlan.days[idxOfCurrentDay];
        if (!currentDay) {
            res.status(200).json({ hasPlan: true, hasCurrentDay: false });
            return;
        }
        res.status(200).json(currentDay);
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// getting week statistics for food intake 
export const getWeekStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { week } = req.query;
        const weekNumber = Number(week);
        // finding week number forlater loop idx using
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId }).lean();
        if (!nutritionPlan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        const days = nutritionPlan.days;
        let data = [];
        // loop for 7 days
        for (let i = 7 * weekNumber - 7; i < 7 * weekNumber; i++) {
            if (!days[i]) break;
            data.push({ day: days[i].date.toLocaleDateString("en-US", { weekday: "short" }), calories: days[i].dailyGoals.calories.current, protein: days[i].dailyGoals.protein.current, carbs: days[i].dailyGoals.carbs.current, fats: days[i].dailyGoals.fats.current })


        }

        res.status(200).json(data);
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}
// updating status to eaten
export const updateMealStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { day } = req.params;
        const { index } = req.body;


        const dayNum = Number(day);
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
        if (!nutritionPlan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        const currentDay = nutritionPlan.days[dayNum];
        if (!currentDay || !currentDay.meals[index]) {
            res.status(400).json({ message: "Invalid day or meal index!" });
            return;
        }
        currentDay.meals[index].status = "eaten";
        //adding fresh numbers to dailyGoals - calories,fats,carbs,protein.
        currentDay.dailyGoals.calories.current += currentDay.meals[index].mealCalories;
        currentDay.dailyGoals.carbs.current += currentDay.meals[index].mealCarbs;
        currentDay.dailyGoals.fats.current += currentDay.meals[index].mealFats;
        currentDay.dailyGoals.protein.current += currentDay.meals[index].mealProtein;
        nutritionPlan.markModified(`days.${dayNum}.meals.${index}`);
        nutritionPlan.markModified(`days.${dayNum}.dailyGoals`);
        await nutritionPlan.save();
        res.status(200).json({message:"Status updated!"});
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// updating water intake numbers
export const updateWaterCurrent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { day } = req.params;
        const { amount } = req.body;
        if (typeof amount !== "number" || !Number.isFinite(amount)) {
            res.status(400).json({ message: "A valid amount is required!" });
            return;
        }
        // getting parsed to num idx of the day
        const dayNum = Number(day);
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
        if (!nutritionPlan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        // adding numbers to current waterIntake
        const currentDay = nutritionPlan.days[dayNum];
        if (!currentDay) {
            res.status(400).json({ message: "Invalid day index!" });
            return;
        }
        currentDay.waterIntake.current = Math.max(0, currentDay.waterIntake.current + amount);

        nutritionPlan.markModified(`days.${dayNum}.waterIntake`);
        await nutritionPlan.save();
        res.status(200).json({message:"Status updated!"});
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }

}
