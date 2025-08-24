import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";
import FitnessPlan, { IDayPlan } from "../models/FitnessPlan";
import Measurement from "../models/Measurement";
import User from "../models/User";
import ExerciseImage from "../models/ExerciseImage";
import { s3ImageUploadingExercise } from "../utils/images";
import { io, userSocketMap } from "../socket";
import Notification, { INotification } from "../models/Notification";

// adding report-fitnessplan func
export const addReport = async (req: Request, res: Response): Promise<void> => {
    const { data, imageUrl } = req.body;
    try {
        // parallel adding data - adding image to each of the exercises from unsplash api and saving into a s3 ->saving s3-image-url into a mongodb
        await Promise.all(
            data.plan.days.map(async (day: IDayPlan) => {
                await Promise.all(
                    day.exercises.map(async (exercise) => {


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
                    }))
            }))
        const fitnessPlan = new FitnessPlan({ userId: (req as AuthRequest).userId, "report.plan": data.plan, "report.advices": data.advices, "report.streak": 0, "report.briefAnalysis.targetWeight": data.briefAnalysis.targetWeight, "report.briefAnalysis.fitnessLevel": data.briefAnalysis.fitnessLevel, "report.briefAnalysis.primaryFitnessGoal": data.briefAnalysis.primaryFitnessGoal, createdAt: new Date() });
        await Measurement.create({ userId: (req as AuthRequest).userId, metrics: data.briefAnalysis.currentMetrics, imageUrl: imageUrl, createdAt: new Date() });
        //    adding real date for each day - ai doesn`t generate real dates
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
        console.error(err)
        return;
    }
}

// completing workout-day func
export const completeWorkout = async (req: Request, res: Response): Promise<void> => {
    const completedItems = req.body;
    // array of completed ,non-completed exercises
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
        // setting similar status to db 
        const currentDay = plan?.report.plan.days[Number(day)];
        for (let [i, exercise] of currentDay.exercises.entries()) {
            if (completedItems[i]?.completed) {
                exercise.status = "completed"
            }

        }
        // if every exercise`s status is completed than day status is Completed + streak+=1
        if (currentDay.exercises.every(exercise => exercise.status === "completed")) {
            currentDay.status = "Completed";
            plan.report.streak += 1;
            if (plan.report.streak > user.longestStreak) {
                user.longestStreak += 1;
            }
            // updating current metrics (weight + bodyFat with calories release)
            const measurement = await Measurement.findOne({ userId: user._id }).sort({ createdAt: -1 });
            if (measurement) {
                measurement.metrics.weight = +(measurement.metrics.weight - currentDay.calories / 7700).toFixed(2);
                const fatMass = Math.max(measurement.metrics.weight - measurement.metrics.leanBodyMass, 0);
                if (!fatMass)
                    measurement.metrics.leanBodyMass = measurement.metrics.weight;
                measurement.metrics.bodyFatPercent = (fatMass / measurement.metrics.weight) * 100;
                measurement.markModified(`metrics`);
                await measurement.save();
            }
            const socketId = userSocketMap.get(String(user._id));
            let notification: INotification | null;
            notification = await Notification.findOne({ userId: user._id, topic: "measurement" });
            if (!notification) {
                const notification = new Notification({ userId: user._id, info: `Reminder:  Want to update your metrics ?`, topic: "measurement" })

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
        const measurements = await Measurement.find({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 }).limit(12).sort({ createdAt: 1 });
        const plan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId });
        const user = await User.findById((req as AuthRequest).userId);

        if (!plan || typeof date !== "string") {
            res.status(404).json({ message: "Not found!" });
            return;
        }

        // getting info for charts (example {month:"Aug",weight:74}[])



        let weightsData: { month: string, weight: number }[] = [];
        let imagesData: { date: string, imageUrl: string }[] = [];
        let bodyFatData: { month: string, bodyFat: number }[] = [];
        let bmiData: { month: string, bmi: number }[] = [];

        // for getting only one  measurement per month 
        let unavailableMonth: string[] = [];
        for (let item of measurements) {
            // for 6 month
            if (weightsData.length > 6) break;
            const month = item.createdAt.toLocaleDateString("en-US", { month: "short" });
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

        const firstDay = new Date(plan.createdAt);
        const day = Math.round((currentDay.getTime() - firstDay.getTime()) / (1000 * 3600 * 24));
        const currentCalories = plan.report.plan.days[day].exercises.reduce((acc, cur) => {
            return (cur.status == "completed" ? acc + cur.calories : acc);
        }, 0)
        res.status(200).json({
            weight: measurements[measurements.length - 1].metrics.weight,
            lastWeight: measurements[measurements.length - 2] ? measurements[measurements.length - 2].metrics.weight : null,
            bmi: +(measurements[measurements.length - 1].metrics.weight / (Math.pow(measurements[measurements.length - 1].metrics.height * 0.01, 2))).toFixed(2),
            bodyFat: measurements[measurements.length - 1].metrics.bodyFatPercent,
            streak: plan.report.streak,
            longestStreak: user?.longestStreak,
            calories: { current: currentCalories, target: plan.report.plan.days[day].calories },
            weightsData: weightsData,
            fatsData: bodyFatData ?? null,
            bmiData: bmiData ?? null,
            imagesData: imagesData ?? null,
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
        let chartData: { month: string, bodyFat: number }[] = [];
        // data for chart (body-fat difference)
        let unavailableMonth: string[] = [];
        for (let item of measurements) {
            // for 6 month
            if (chartData.length > 6) break;
            const month = item.createdAt.toLocaleDateString("en-US", { month: "short" });
            if (!unavailableMonth.includes(month)) {
                unavailableMonth.push(month);
                chartData.push({ month: month, bodyFat: +item.metrics.bodyFatPercent.toFixed(2) });

            }
        }
        const weightDifference = measurements[1] ? measurements[0].metrics.weight - measurements[1].metrics.weight : 0;

        const currentBMI = measurements[0].metrics.weight / (Math.pow(measurements[0].metrics.height * 0.01, 2));
        const currentPlan = await FitnessPlan.findOne({ userId: (req as AuthRequest).userId }).sort({ createdAt: -1 });
        const lastBMI = measurements[1] ? measurements[1].metrics.weight / (Math.pow(measurements[1].metrics.height * 0.01, 2)) : 0;
        res.status(200).json({
            weight: { data: measurements[0].metrics.weight, difference: !measurements[1] ? null : +weightDifference.toFixed(2) },
            leanBodyMass: { data: measurements[0].metrics.leanBodyMass, difference: !measurements[1] ? null : measurements[0].metrics.leanBodyMass - measurements[1].metrics.leanBodyMass },
            bodyFatPercent: { data: measurements[0].metrics.bodyFatPercent, difference: !measurements[1] ? null : measurements[0].metrics.bodyFatPercent - measurements[1].metrics.bodyFatPercent },
            MuscleMass: { data: measurements[0].metrics.muscleMass, difference: !measurements[1] ? null : measurements[0].metrics.muscleMass - measurements[1].metrics.muscleMass },
            bmi: { data: currentBMI.toFixed(1), difference: !measurements[1] ? null : +(currentBMI - lastBMI).toFixed(2) },
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
        let todayWorkoutNumber = null;
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