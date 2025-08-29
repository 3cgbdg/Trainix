import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import NutritionPlan, { IDayPlanNutrition } from "../models/NutritionPlan";
import { s3ImageUploadingMeal } from "../utils/images";
import MealImage from "../models/MealImage";

// func for looping use - adding day to nutrition plan -- creating plan
export const createNutritionPlan = async (req: Request, res: Response): Promise<void> => {
    const { data } = req.body as { data: IDayPlanNutrition }; 
    try {
        const dayDate = new Date();
        let obj: IDayPlanNutrition;
        dayDate.setDate(dayDate.getDate() + data.dayNumber - 1);
        console.log(dayDate);
        let nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
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
        obj = { ...data, date: dayDate };
        // if plan exists just pushing
        if (nutritionPlan) {
            nutritionPlan.days.push(obj);
            await nutritionPlan.save();
            res.status(200).json({ message: "Successfully added day!" });
            return;
        }
        // otherwise creating plan with this item
        else {
            nutritionPlan = await NutritionPlan.create({ userId: (req as AuthRequest).userId, "days": [obj], createdAt: new Date() });
            res.status(201).json({ message: "Nutrition plan created!",day:obj });
            return;
        }
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// func for getting nutr. day
export const getNutritionDay = async (req: Request, res: Response): Promise<void> => {
    try {
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
        if (!nutritionPlan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        // idx of the array item -- day
        const idxOfCurrentDay = Math.round(
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

// getting week statistics for food intake 
export const getWeekStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { week } = req.query;
        const weekNumber = Number(week);
        // finding week number forlater loop idx using
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
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
        // getting parsed to num idx of the day
        const dayNum = Number(day);
        const nutritionPlan = await NutritionPlan.findOne({ userId: (req as AuthRequest).userId });
        if (!nutritionPlan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        // adding numbers to current waterIntake
        nutritionPlan.days[dayNum].waterIntake.current += amount;

        nutritionPlan.markModified(`days.${dayNum}.waterIntake`);
        await nutritionPlan.save();
        res.status(200).json({message:"Status updated!"});
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }

}
