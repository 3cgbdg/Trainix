import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";
import FitnessPlan, { IAdvices, IBriefAnalysis, IDayPlan, IExercise } from "../models/FitnessPlan";
import Measurement from "../models/Measurement";
import User from "../models/User";
import ExerciseImage from "../models/ExerciseImage";
import { s3ImageUploadingExercise } from "../utils/images";
import { io, userSocketMap } from "../socket";
import Notification from "../models/Notification";
import { IUserDocument } from "../models/User";

const FREE_TIER_MONTHLY_PLAN_LIMIT = 1;

// a full plan generation (photo analysis + 28 days of AI content) is the most
// expensive thing a user can trigger, so free-tier usage is metered per
// calendar month; premium is unlimited
function consumeFreeTierPlanQuota(user: IUserDocument): boolean {
    if (user.subscriptionTier === "premium") return true;
    const now = new Date();
    const resetAt = user.aiPlanGenerationsResetAt;
    const isNewMonth = !resetAt || resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear();
    if (isNewMonth) {
        user.aiPlanGenerationsThisMonth = 0;
        user.aiPlanGenerationsResetAt = now;
    }
    if (user.aiPlanGenerationsThisMonth >= FREE_TIER_MONTHLY_PLAN_LIMIT) return false;
    user.aiPlanGenerationsThisMonth += 1;
    return true;
}

// adding report-fitnessplan day  func with iterations
export const addFitnessDay = async (req: Request, res: Response): Promise<void> => {
    const { method } = req.query;
    const { data } = req.body;
    try {
        const fitnessPlan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId });
        // parallel adding data - adding image to each of the exercises from unsplash api and saving into a s3 ->saving s3-image-url into a mongodb
        if (data.day.exercises !== undefined) {
            await Promise.all(
                data.day.exercises!.map(async (exercise: IExercise) => {

                    const image = await ExerciseImage.findOne({ name: exercise.title });
                    if (image) {
                        exercise.imageUrl = image.imageUrl;
                    } else {
                        const url = await s3ImageUploadingExercise(exercise);
                        // if exists continue otherwise adding new doc
                        await ExerciseImage.findOneAndUpdate(
                            { name: exercise.title },
                            { $setOnInsert: { imageUrl: url } },
                            { new: true, upsert: true }
                        );
                        exercise.imageUrl = url;
                    }
                })

            )
        }
        //adding real date for each day - ai doesn`t generate real dates
        if (fitnessPlan) {

            if (method == "container") {

                const workoutDay = new Date(fitnessPlan.createdAt);
                workoutDay.setDate(workoutDay.getDate() + data.day.dayNumber - 1);
                data.day.date = workoutDay;
                await FitnessPlan.updateOne(
                    { _id: fitnessPlan._id },
                    { $push: { "report.plan.days": { $each: [data.day], $sort: { dayNumber: 1 } } } }
                );
                res.status(200).json({ message: "Day created!", day: data });
                return;
            } else {

                data.day.date = new Date(data.day.date);
                fitnessPlan.report.plan.days[data.day.dayNumber - 1] = data.day;
            }
            fitnessPlan.markModified("report.plan.days");
            await fitnessPlan.save();

            res.status(200).json({ message: "Day created!", day: data });
            return;
        } else {
            const user = await User.findById((req as AuthRequest).userId);
            if (!user) {
                res.status(404).json({ message: "User was not found!" });
                return;
            }
            if (!consumeFreeTierPlanQuota(user)) {
                res.status(402).json({ message: `Free plan includes ${FREE_TIER_MONTHLY_PLAN_LIMIT} new AI-generated plan per month. Upgrade to Premium for unlimited plans.` });
                return;
            }
            await user.save();
            const workoutDay = new Date();
            data.day.date = workoutDay;
            const fitnessPlan = new FitnessPlan({ userId: (req as AuthRequest).userId, "report.plan.week3Title": data.week3Title, "report.plan.week4Title": data.week4Title, "report.plan.week2Title": data.week2Title, "report.plan.week1Title": data.week1Title, "report.plan.days": [data.day], "report.advices": data.advices, "report.streak": 0, "report.briefAnalysis": data.briefAnalysis });
            await fitnessPlan.save();
            res.status(201).json({ message: "Plan created!" });
            return;
        }
    }
    catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// completing workout-day func
export const completeWorkout = async (req: Request, res: Response): Promise<void> => {
    const completedItems = req.body;
    // array of completed ,non-completed exercises
    const { day } = req.params;
    try {
        const [plan, user] = await Promise.all([
            FitnessPlan.findOne({ userId: (req as AuthRequest).userId }),
            User.findById((req as AuthRequest).userId),
        ]);
        if (!plan) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        if (!user) {
            res.status(404).json({ message: "Not found!" });
            return;
        }
        // setting similar status to db 
        const currentDay = plan?.report.plan.days[Number(day)];
        if (!currentDay) {
            res.status(404).json({ message: "Workout day was not found!" });
            return;
        }
        const wasCompleted = currentDay.status === "Completed";
        for (let [i, exercise] of currentDay.exercises!.entries()) {
            if (completedItems[i]?.completed) {
                exercise.status = "completed"
            }

        }
        // if every exercise`s status is completed than day status is Completed + streak+=1
        if (!wasCompleted && currentDay.exercises!.every(exercise => exercise.status === "completed")) {
            currentDay.status = "Completed";
            plan.report.streak += 1;
            user.longestStreak = Math.max(user.longestStreak, plan.report.streak);
            // updating current metrics (weight + bodyFat with calories release)
            const measurement = await Measurement.findOne({ userId: user._id }).sort({ createdAt: -1 });
            if (measurement) {
                measurement.metrics.weight = +(measurement.metrics.weight - currentDay.calories! / 7700).toFixed(2);
                const fatMass = Math.max(measurement.metrics.weight - measurement.metrics.leanBodyMass, 0);
                if (!fatMass)
                    measurement.metrics.leanBodyMass = measurement.metrics.weight;
                measurement.metrics.bodyFatPercent = (fatMass / measurement.metrics.weight) * 100;
                measurement.markModified(`metrics`);
                await measurement.save();
            }
            const socketId = userSocketMap.get(String(user._id));
            let notification = await Notification.findOne({ userId: user._id, topic: "measurement" });
            if (!notification) {
                notification = await Notification.create({ userId: user._id, info: "Reminder: Want to update your metrics?", topic: "measurement" });

                if (socketId)
                    io.to(socketId).emit("getNotifications", { data: notification })
            }

        }


        plan.markModified(`report.plan.days.${day}`);
        plan.markModified(`report`);
        await plan.save();
        await user.save();
        res.status(200).json({ message: "Day is successfully compeleted!", day: currentDay, streak: plan.report.streak });
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}
// getting numbers of statistics for dashboard and progress pages using query filter
export const getNumbers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, progress } = req.query; //progress-filter,date-for current day numbers
        if (typeof date !== "string" || Number.isNaN(new Date(date).getTime())) {
            res.status(400).json({ message: "A valid date is required." });
            return;
        }

        const [measurementsDescending, plan, user] = await Promise.all([
            Measurement.find({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 }).limit(12).lean(),
            FitnessPlan.findOne({ userId: (req as AuthRequest).userId }).lean(),
            User.findById((req as AuthRequest).userId).lean(),
        ]);
        const measurements = [...measurementsDescending].reverse();

        // getting info for charts (example {month:"Aug",weight:74}[])



        let weightsData: { month: string, weight: number }[] = [];
        let imagesData: { date: string, imageUrl: string }[] = [];
        let bodyFatData: { month: string, bodyFat: number }[] = [];
        let bmiData: { month: string, bmi: number }[] = [];

        // for getting only one  measurement per month 
        let unavailableMonth: string[] = [];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (let item of measurements) {
            // for 6 month
            if (weightsData.length >= 6) break;
            const month = months[item.createdAt.getMonth()];
            if (!unavailableMonth.includes(month)) {

                weightsData.push({ month: month, weight: item.metrics.weight });
                if (progress) {
                    const date = item.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });;

                    imagesData.push({ date: date, imageUrl: item.imageUrl });
                    bodyFatData.push({ month: month, bodyFat: +item.metrics.bodyFatPercent.toFixed(2) });
                    bmiData.push({ month: month, bmi: +((item.metrics.weight / (item.metrics.height * item.metrics.height / 10000)).toFixed(2)) });
                }
                unavailableMonth.push(month);
            }
            else continue;
        }
        const currentDay = new Date(date);
        const firstDay = plan ? new Date(plan.createdAt) : null;
        const day = firstDay ? Math.round((currentDay.getTime() - firstDay.getTime()) / (1000 * 3600 * 24)) : null;
        const activePlanDay = day !== null && day >= 0 ? plan?.report.plan.days[day] : undefined;
        const currentCalories = activePlanDay?.exercises?.reduce((acc, cur) => {
            return cur.status === "completed" ? acc + cur.calories : acc;
        }, 0) ?? 0;
        const latestMeasurement = measurements[measurements.length - 1];
        const previousMeasurement = measurements[measurements.length - 2];

        res.status(200).json({
            hasPlan: Boolean(plan),
            hasActiveDay: Boolean(activePlanDay),
            weight: latestMeasurement?.metrics.weight ?? null,
            lastWeight: previousMeasurement?.metrics.weight ?? null,
            bmi: latestMeasurement ? +(latestMeasurement.metrics.weight / (Math.pow(latestMeasurement.metrics.height * 0.01, 2))).toFixed(2) : null,
            bodyFat: latestMeasurement?.metrics.bodyFatPercent ?? null,
            streak: plan?.report.streak ?? 0,
            longestStreak: user?.longestStreak ?? 0,
            calories: activePlanDay ? { current: currentCalories, target: activePlanDay.calories ?? null } : null,
            weightsData: weightsData,
            fatsData: bodyFatData,
            bmiData: bmiData,
            imagesData: imagesData,
            day: day,
        });
        return;
    } catch (err) {
        console.error("Failed to load fitness report numbers", err);
        res.status(500).json({ message: "Server error!" });
        return;
    }
}



// full analysis of the body from measurements of the last image uploading
export const getAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
        const measurements = await Measurement.find({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 }).limit(12).lean();
        if (measurements.length === 0) {
            res.status(200).json({ hasAnalysis: false });
            return;
        }
        let chartData: { month: string, bodyFat: number }[] = [];
        // data for chart (body-fat difference)
        let unavailableMonth: string[] = [];
        for (let item of measurements) {
            // for 6 month
            if (chartData.length >= 6) break;
            const month = item.createdAt.toLocaleDateString("en-US", { month: "short" });
            if (!unavailableMonth.includes(month)) {
                unavailableMonth.push(month);
                chartData.push({ month: month, bodyFat: +item.metrics.bodyFatPercent.toFixed(2) });

            }
        }


        const currentPlan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 }).lean();
        if (!currentPlan?.report.advices) {
            res.status(200).json({ hasAnalysis: false });
            return;
        }
        const weightDifference = measurements[1] ? measurements[0].metrics.weight - measurements[1].metrics.weight : 0;
        const currentBMI = measurements[0].metrics.weight / (Math.pow(measurements[0].metrics.height * 0.01, 2));
        const lastBMI = measurements[1] ? measurements[1].metrics.weight / (Math.pow(measurements[1].metrics.height * 0.01, 2)) : 0;
        res.status(200).json({
            weight: { data: measurements[0].metrics.weight, difference: !measurements[1] ? 0 : +weightDifference.toFixed(2) },
            leanBodyMass: { data: measurements[0].metrics.leanBodyMass, difference: !measurements[1] ? 0 : measurements[0].metrics.leanBodyMass - measurements[1].metrics.leanBodyMass },
            bodyFatPercent: { data: measurements[0].metrics.bodyFatPercent, difference: !measurements[1] ? 0 : measurements[0].metrics.bodyFatPercent - measurements[1].metrics.bodyFatPercent },
            MuscleMass: { data: measurements[0].metrics.muscleMass, difference: !measurements[1] ? 0 : measurements[0].metrics.muscleMass - measurements[1].metrics.muscleMass },
            bmi: { data: currentBMI.toFixed(1), difference: !measurements[1] ? 0 : +(currentBMI - lastBMI).toFixed(2) },
            imageUrlCurrent: measurements[0].imageUrl,
            imageUrlLast: measurements[1]?.imageUrl ?? null,
            waistToHipRatio: { data: measurements[0].metrics.waistToHipRatio, difference: !measurements[1] ? 0 : measurements[0].metrics.waistToHipRatio - measurements[1].metrics.waistToHipRatio },
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
        const fitnessPlan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 }).lean();
        if (!fitnessPlan) {
            res.status(200).json({
                hasPlan: false,
                items: [],
                dates: [],
                todayWorkoutNumber: null,
                currentWeekTitle: null,
                streak: 0,
            });
            return;
        }
        // variable for getting array idx of current day item of
        const today = new Date();
        const dates = []
        let todayWorkoutNumber = null;
        let currentWeekTitle;
        for (let [i, item] of fitnessPlan.report.plan.days.entries()) {
            const itemDate = new Date(item.date);
            // pushing day
            dates.push({ weekDay: item.date.toLocaleDateString("en-US", { weekday: "long" }), monthAndDate: `${item.date.getDate()} ${item.date.toLocaleDateString("en-US", { month: "long" })}` });
            // if date == today - current day idx
            if (itemDate.getDate() === today.getDate() && itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear()) {
                todayWorkoutNumber = i;
            }
        }
        // getting current week title from current day idx example:(0-6)1 week
        if (todayWorkoutNumber !== null) {
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
            hasAnalysis: true,
            hasPlan: true,
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
        const fitnessPlan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 }).lean();
        if (!fitnessPlan) {
            res.status(404).json({ message: "Not found!" })
            return;
        }
        const workout = fitnessPlan.report.plan.days[Number(day)];
        if (!workout) {
            res.status(404).json({ message: "Workout day was not found!" });
            return;
        }
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
        res.status(200).json({ message: "Successfully deleted!" });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}
