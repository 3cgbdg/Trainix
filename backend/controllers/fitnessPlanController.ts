import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";
import FitnessPlan from "../models/FitnessPlan";
import Measurement from "../models/Measurement";
import User from "../models/User";

export const addReport = async (req: Request, res: Response): Promise<void> => {
    const { data, imageUrl } = req.body;
    console.log(data, imageUrl);
    try {
        const fitnessPlan = new FitnessPlan({ userId: (req as AuthRequest).userId, "report.plan": data.plan, "report.advices": data.advices, "report.streak": 0, "report.briefAnalysis.targetWeight": data.briefAnalysis.targetWeight, "report.briefAnalysis.fitnessLevel": data.briefAnalysis.fitnessLevel, "report.briefAnalysis.primaryFitnessGoal": data.briefAnalysis.primaryFitnessGoal, createdAt: new Date() });
        await Measurement.create({ userId: (req as AuthRequest).userId, metrics: data.briefAnalysis.currentMetrics, imageUrl: imageUrl, createdAt: new Date() });
        if (fitnessPlan) {
            for (let i = 0; i < fitnessPlan.report.plan.days.length; i++) {
                const workoutDay = new Date(fitnessPlan.createdAt);
                workoutDay.setDate(workoutDay.getDate() + i);
                fitnessPlan.report.plan.days[i].date = workoutDay;
            }



        }

        await fitnessPlan.save();
        res.status(201).json({ message: "Report created!" });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

export const completeWorkout = async (req: Request, res: Response): Promise<void> => {
    const completedItems = req.body;
    const { day } = req.params;
    try {
        const plan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId });
        const user = await User.findById((req as AuthRequest).userId);
        if (!plan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        if (!user) {
            res.status(404).json({ message: "Not found!" });
            return;
        }

        const currentDay = plan?.report.plan.days[Number(day)];
        for (let [i, exercise] of currentDay.exercises.entries()) {
            if (completedItems[i]?.completed) {
                exercise.status = "completed"
            }

        }
        if (currentDay.exercises.every(exercise => exercise.status === "completed")) {
            currentDay.status = "Completed";
            plan.report.streak += 1;
            if (plan.report.streak > user.longestStreak) {
                user.longestStreak += 1;
            }

        }
        plan.markModified(`report.plan.days.${day}`);
        plan.markModified(`report`);
        await plan.save();
        await user.save();
        console.log(currentDay, plan.report.streak)
        res.status(200).json({ message: "Day is successfully compeleted!", day: currentDay, streak: plan.report.streak });
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

export const getNumbers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.query;
        const measurements = await Measurement.find({ userId: (req as AuthRequest).userId }).sort({ createdAt: 1 });
        const plan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 });
        const user = await User.findById((req as AuthRequest).userId);

        if (!plan || typeof date !== "string") {
            res.status(404).json({ message: "Not found!" });
            return;
        }


        let weightsData = [];
        for (let item of measurements) {
            weightsData.push({ month: item.createdAt.toLocaleDateString("en-US", { month: "short" }), weight: item.metrics.weight });
        }
        console.log(weightsData);
        const currentDay = new Date(date);

        const firstDay = new Date(plan.createdAt);
        const day = Math.round((currentDay.getTime() - firstDay.getTime()) / (1000 * 3600 * 24));
        const currentCalories = plan.report.plan.days[day].exercises.reduce((acc, cur) => {
            return (cur.status == "completed" ? acc + cur.calories : acc);
        }, 0)
        res.status(200).json({
            weight: measurements[measurements.length - 1].metrics.weight,
            lastWeight: measurements[measurements.length - 2] ? measurements[measurements.length - 2].metrics.weight : null,
            bmi: measurements[measurements.length - 1].metrics.weight / (Math.pow(measurements[measurements.length - 1].metrics.height * 0.01, 2)),
            streak: plan.report.streak,
            longestStreak: user?.longestStreak,
            calories: { current: currentCalories, target: plan.report.plan.days[day].calories },
            weightsData: weightsData,
            day: day,
        });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}



// full analysis of the body from measurements of the last image uploading
export const getAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
        const measurements = await Measurement.find({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 }).limit(12);
        if (measurements.length === 0) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        let chartData = [];
        // data for chart (body-fat difference)
        for (let item of measurements) {
            chartData.push({ month: item.createdAt.toLocaleDateString("en-US", { month: "short" }), bodyFatPercent: item.metrics.bodyFatPercent });
        }


        const weightDifference = measurements[1] ? measurements[0].metrics.weight - measurements[1].metrics.weight : 0;

        const currentBMI = measurements[0].metrics.weight / (Math.pow(measurements[0].metrics.height * 0.01, 2));
        const currentPlan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 });
        const lastBMI = measurements[1] ? measurements[1].metrics.weight / (Math.pow(measurements[1].metrics.height * 0.01, 2)) : 0;
        res.status(200).json({
            weight: { data: measurements[0].metrics.weight, difference: !measurements[1] ? null : weightDifference.toFixed(2) },
            leanBodyMass: { data: measurements[0].metrics.leanBodyMass, difference: !measurements[1] ? null : measurements[0].metrics.leanBodyMass - measurements[1].metrics.leanBodyMass },
            bodyFatPercent: { data: measurements[0].metrics.bodyFatPercent, difference: !measurements[1] ? null : measurements[0].metrics.bodyFatPercent - measurements[1].metrics.bodyFatPercent },
            MuscleMass: { data: measurements[0].metrics.muscleMass, difference: !measurements[1] ? null : measurements[0].metrics.muscleMass - measurements[1].metrics.muscleMass },
            bmi: { data: currentBMI.toFixed(1), difference: !measurements[1] ? null : (currentBMI - lastBMI).toFixed(2) },
            imageUrlCurrent: measurements[0].imageUrl,
            imageUrlLast: measurements[1]?.imageUrl ?? null,
            waistToHipRatio: { data: measurements[0].metrics.waistToHipRatio, difference: !measurements[1] ? null : measurements[0].metrics.waistToHipRatio - measurements[1].metrics.waistToHipRatio },
            advices: currentPlan?.report.advices,
            chartData: chartData,
        });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}


// getting info about the personal workout days for redux state
export const getWorkouts = async (req: Request, res: Response): Promise<void> => {
    try {
        const fitnessPlan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 });
        if (!fitnessPlan) {
            res.status(404).json({ message: "Not found!" })
            return;
        }
        // variable for getting array idx of current day item of
        const today = new Date();
        const dates = []
        let todayWorkoutNumber;
        let currentWeekTitle;
        for (let [i, item] of fitnessPlan.report.plan.days.entries()) {
            const itemDate = new Date(item.date);
            // pushing day
            dates.push({ weekDay: item.date.toLocaleDateString("en-US", { weekday: "long" }), monthAndDate: `${item.date.getDate()} ${item.date.toLocaleDateString("en-US", { month: "long" })}` });
            // if date == today - current day idx
            if (itemDate.getDate() === today.getDate() && itemDate.getMonth() === today.getMonth()) {
                todayWorkoutNumber = i;
            }
        }
        // getting current week title from current day idx example:(0-6)1 week
        if (todayWorkoutNumber) {
            currentWeekTitle = todayWorkoutNumber < 7
                ? fitnessPlan.report.plan.week1Title
                : todayWorkoutNumber < 14
                    ? fitnessPlan.report.plan.week2Title
                    : todayWorkoutNumber < 21
                        ? fitnessPlan.report.plan.week3Title
                        : fitnessPlan.report.plan.week4Title;
        }

        const workouts = fitnessPlan.report.plan.days;
        res.status(200).json({
            items: workouts,
            dates: dates,
            todayWorkoutNumber: todayWorkoutNumber,
            currentWeekTitle: currentWeekTitle,
            streak: fitnessPlan.report.streak,
        })
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}


export const getWorkout = async (req: Request, res: Response): Promise<void> => {
    const { day } = req.params;
    try {
        const fitnessPlan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 });
        if (!fitnessPlan) {
            res.status(404).json({ message: "Not found!" })
            return;
        }
        const workout = fitnessPlan.report.plan.days[Number(day)];
        res.status(200).json(
            workout
        );
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

export const deleteFitnessPlan = async (req: Request, res: Response): Promise<void> => {
    try {
        await FitnessPlan.findOneAndDelete({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 });
        res.json({ message: "Successfully deleted!" });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}