import Notification, { INotification } from "../models/Notification";
import { io, userSocketMap } from "../socket";
import NutritionPlan, { IMeal } from "../models/NutritionPlan";
import FitnessPlan, { IExercise } from "../models/FitnessPlan";
import User from "../models/User";
import Measurement from "../models/Measurement";
import { ObjectId } from "mongoose";
import axios from "axios";
import ExerciseImage from "../models/ExerciseImage";
import { s3ImageUploadingExercise, s3ImageUploadingMeal } from "./images";
import MealImage from "../models/MealImage";

export const regularReminder = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    try {

        const plans = await NutritionPlan.find({
            "days.date": { $gte: startOfDay, $lte: endOfDay }
        }).populate<{ userId: { inAppNotifications: boolean, _id: ObjectId } }>({ path: "userId", select: "inAppNotifications _id" });
        const notifications: INotification[] = [];
        // parallel promises
        await Promise.all(plans.map(async (item) => {
            // checking whether user turned off in-app-notifications
            if (!item.userId.inAppNotifications) return;
            const day = item.days.find(day => new Date(day.date).getDate() === today.getDate());
            if (!day) return;
            // check water
            let notification: INotification | null;
            const socketId = userSocketMap.get(item.userId._id.toString());

            if (day.waterIntake.current < day.waterIntake.target) {
                notification = await Notification.findOne({ userId: item.userId, topic: "water" });
                if (!notification) {
                    notification = new Notification({ userId: item.userId, info: `Reminder: You need to drink ${day.waterIntake.target - day.waterIntake.current} ml of water`, topic: "water" })
                    notifications.push(notification);
                    if (socketId)
                        io.to(socketId).emit("getNotifications", { data: notification });
                }

            }
            // check meals
            for (let meal of day.meals) {
                if (meal.status !== "eaten" && (Number(meal.time.split(":")[0]) - new Date().getHours() <= 2)) {

                    notification = await Notification.findOne({ userId: item.userId, topic: "nutrition" });
                    if (!notification) {
                        notification = new Notification({ userId: item.userId, info: `Reminder: have a ${meal.foodIntake.toLowerCase()}`, topic: "nutrition" })
                        notifications.push(notification);
                        if (socketId)
                            io.to(socketId).emit("getNotifications", { data: notification })
                    }

                }
            }
        }
        ))
        await Notification.insertMany(notifications);
    } catch (err) {
        console.log(err);
    }
};

export const workoutReminder = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    try {

        const plans = await FitnessPlan.find({
            "report.plan.days.date": { $gte: startOfDay, $lte: endOfDay }
        }).populate<{ userId: { inAppNotifications: boolean, _id: ObjectId } }>({ path: "userId", select: "inAppNotifications _id" });
        const notifications: INotification[] = [];
        // parallel promises
        await Promise.all(plans.map(async (item) => {
            // checking whether user turned off in-app-notifications
            if (!item.userId.inAppNotifications) return;
            const day = item.report.plan.days.find(day => new Date(day.date).getDate() === today.getDate());

            if (!day) return;


            const socketId = userSocketMap.get(item.userId._id.toString());
            let notification: INotification | null;


            // check activity
            if (day.status !== "Completed") {
                notification = await Notification.findOne({ userId: item.userId, topic: "sport" });
                if (!notification) {
                    const notification = new Notification({ userId: item.userId, info: `Reminder: Time for workout`, topic: "sport" })
                    notifications.push(notification);
                    if (socketId)
                        io.to(socketId).emit("getNotifications", { data: notification })
                }
            }

        }))
        await Notification.insertMany(notifications);
    } catch (err) {
        console.log(err);
    }

};

export const metricsReminder = async () => {

    try {
        const users = await User.find({});

        const notifications: INotification[] = [];

        for (const user of users) {
            // checking whether user turned off in-app-notifications
            if (!user.inAppNotifications) continue;
            const socketId = userSocketMap.get(String(user._id));
            let notification: INotification | null;



            // check activity
            notification = await Notification.findOne({ userId: user._id, topic: "measurement" });
            if (!notification) {
                const notification = new Notification({ userId: user._id, info: `Reminder: Don't forget to update your metrics`, topic: "measurement" })
                notifications.push(notification);
                if (socketId)
                    io.to(socketId).emit("getNotifications", { data: notification })
            }

        }
        await Notification.insertMany(notifications);
    }
    catch (err) {
        console.log(err);
    }

};
export const createNewMeasurement = async () => {

    try {
        const users = await User.find({});
        for (const user of users) {
            // create new measurement every 2 weeks 
            const lastMeasurement = await Measurement.findOne({ userId: user._id }).sort({ createdAt: -1 });

            if (lastMeasurement) {
                const dayDifference = Math.round((new Date().getTime() - new Date(lastMeasurement.createdAt).getTime()) / (1000 * 3600 * 24));
                if (dayDifference > 14) {
                    await Measurement.create({
                        userId: lastMeasurement.userId,
                        imageUrl: lastMeasurement.imageUrl,
                        "metrics.weight": lastMeasurement.metrics.weight,
                        "metrics.bodyFatPercent": lastMeasurement.metrics.bodyFatPercent,
                        "metrics.muscleMass": lastMeasurement.metrics.muscleMass,
                        "metrics.leanBodyMass": lastMeasurement.metrics.leanBodyMass,
                        "metrics.waistToHipRatio": lastMeasurement.metrics.waistToHipRatio,
                        "metrics.shoulderToWaistRatio": lastMeasurement.metrics.shoulderToWaistRatio,
                        "metrics.height": lastMeasurement.metrics.height
                    });
                }
            }



        }
    }
    catch (err) {
        console.log(err);
    }

}
export const checkMissedDay = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fitnessPlans = await FitnessPlan.find({});
    for (let plan of fitnessPlans) {
        let changed = false;
        for (let day of plan.report.plan.days) {
            if (day.status !== "Completed" && (today > new Date(day.date))) {
                day.status = "Missed";
                changed = true
                plan.report.streak = 0
            }

        }
        if (changed) {
            plan.markModified("report.plan.days");
            plan.markModified("report");
            await plan.save();
        }
        plan.markModified(`report`);
        await plan.save();
    }

}

// generating each day full info for workout of the day
export const generateNewDayFitnessContent = async () => {
    try {
        const plans = await FitnessPlan.find({});
        // TODO ADD BATCHES
        await Promise.all(plans.map(async (plan) => {
            const day = plan.report.plan.days.find(day => day.exercises !== undefined && day.date.getDate() == new Date().getDate());
            if (day) {
                // getting user and measurements for sending proper metrics to ai to analyze
                const [user, measurements] = await Promise.all([
                    User.findById(plan.userId),
                    Measurement.findOne({ userId: plan.userId }).sort({ createdAt: -1 }),
                ]);
                // requesting ai generating day
                const res = await axios.post(`http://127.0.0.1:8000/api/fitnessPlan/day`, {
                    userInfo: {
                        height: user?.metrics.height,
                        weight: user?.metrics.weight,
                        targetWeight: user?.targetWeight,
                        primaryFitnessGoal: user?.primaryFitnessGoal,
                        fitnessLevel: user?.fitnessLevel,
                        gender: user?.gender,
                        waistToHipRatio: measurements?.metrics.waistToHipRatio,
                        shoulderToWaistRatio: measurements?.metrics.shoulderToWaistRatio,
                        bodyFatPercent: measurements?.metrics.bodyFatPercent,
                        muscleMass: measurements?.metrics.muscleMass,
                        leanBodyMass: measurements?.metrics.leanBodyMass,
                    },
                    day: {
                        dayNumber: day.dayNumber,
                        day: day.day,
                        date: day.date
                    }

                }
                );
                const data = res.data;
                // validating info
                const regex = /```json\s([\s\S]+?)```/;
                let match;
                try {
                    // adding to db
                    match = data.AIreport.match(regex);
                    const info = match ? JSON.parse(match[1]) : JSON.parse(data.AIreport);
                    await Promise.all(
                        info.day.exercises!.map(async (exercise: IExercise) => {

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
                    info.day.date = new Date(info.day.date);
                    plan.report.plan.days[info.day.dayNumber - 1] = info.day;
                    plan.markModified("report.plan.days");
                    await plan.save();
                } catch (err) {
                    console.error(err);
                }


            } else {
                return;
            }
        }))
    } catch (err) {
        console.error(err);
    }
}

// generating each day full info for workout of the day
export const generateNewDayNutritionContent = async () => {
    try {
        const plans = await NutritionPlan.find({});
        // TODO ADD BATCHES
        await Promise.all(plans.map(async (plan) => {
            const dayNumber = plan.days[plan.days.length - 1].dayNumber;
            // getting user and measurements for sending proper metrics to ai to analyze
            const [user, measurements] = await Promise.all([
                User.findById(plan.userId),
                Measurement.findOne({ userId: plan.userId }).sort({ createdAt: -1 }),
            ]);
            // requesting ai generating day
            const res = await axios.post(`http://127.0.0.1:8000/api/nutrition?dayNumber=${dayNumber + 1}`, {

                height: user?.metrics.height,
                weight: user?.metrics.weight,
                targetWeight: user?.targetWeight,
                primaryFitnessGoal: user?.primaryFitnessGoal,
                fitnessLevel: user?.fitnessLevel,
                gender: user?.gender,
                waistToHipRatio: measurements?.metrics.waistToHipRatio,
                shoulderToWaistRatio: measurements?.metrics.shoulderToWaistRatio,
                bodyFatPercent: measurements?.metrics.bodyFatPercent,
                muscleMass: measurements?.metrics.muscleMass,
                leanBodyMass: measurements?.metrics.leanBodyMass,

            }
            );
            const data = res.data;
            // validating info
            const regex = /```json\s([\s\S]+?)```/;
            let match;
            try {
                // adding to db
                match = data.AIreport.match(regex);
                const info = match ? JSON.parse(match[1]) : JSON.parse(data.AIreport);
                await Promise.all(
                    info.meals.map(async (meal: IMeal) => {
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
                plan.days.push(info);
                await plan.save();
            } catch (err) {
                console.error(err);
            }

        }))
    } catch (err) {
        console.error(err);
    }
}

