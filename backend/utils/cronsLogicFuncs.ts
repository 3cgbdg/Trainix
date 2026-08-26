import Notification, { INotification } from "../models/Notification";
import { io, userSocketMap } from "../socket";
import NutritionPlan, { IMeal } from "../models/NutritionPlan";
import FitnessPlan, { IExercise } from "../models/FitnessPlan";
import User from "../models/User";
import Measurement from "../models/Measurement";
import { ObjectId } from "mongoose";
import ExerciseImage from "../models/ExerciseImage";
import { s3ImageUploadingExercise, s3ImageUploadingMeal } from "./images";
import { requestAiReport } from "./aiClient";
import { isGenerationInFlight, runFitnessPlanGeneration, TOTAL_DAYS } from "./fitnessPlanGeneration";
import MealImage from "../models/MealImage";

export const regularReminder = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    try {
        let lastId = null;
        const batchSize = 1000;
        while (true) {
            const query: any = {}
            if (lastId) query._id = { $gt: lastId }
            const plans = await NutritionPlan.find({
                ...query,
                "days.date": { $gte: startOfDay, $lte: endOfDay }
            }).sort({ _id: 1 }).populate<{ userId: { inAppNotifications: boolean, _id: ObjectId } }>({ path: "userId", select: "inAppNotifications _id" }).limit(batchSize);
            if (plans.length == 0) break;
            lastId = plans[plans.length - 1]._id;
            const notifications: INotification[] = [];
            // parallel promises
            await Promise.all(plans.map(async (item) => {
                // checking whether user turned off in-app-notifications
                if (!item.userId.inAppNotifications) return;
                const day = item.days.find(day => new Date(day.date).toDateString() === today.toDateString());
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
        }
    } catch (err) {
        console.log(err);
    }
};

export const workoutReminder = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    try {
        let lastId = null;
        const batchSize = 1000;
        while (true) {
            const query: any = {}
            if (lastId) query._id = { $gt: lastId }
            const plans = await FitnessPlan.find({
                ...query,
                "report.plan.days.date": { $gte: startOfDay, $lte: endOfDay }
            }).sort({ _id: 1 }).populate<{ userId: { inAppNotifications: boolean, _id: ObjectId } }>({ path: "userId", select: "inAppNotifications _id" }).limit(batchSize);
            if (plans.length == 0) break;
            lastId = plans[plans.length - 1]._id;
            const notifications: INotification[] = [];
            // parallel promises
            await Promise.all(plans.map(async (item) => {
                // checking whether user turned off in-app-notifications
                if (!item.userId.inAppNotifications) return;
                const day = item.report.plan.days.find(day => new Date(day.date).toDateString() === today.toDateString());

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
        }

    } catch (err) {
        console.log(err);
    }

};

export const metricsReminder = async () => {

    try {
        const batchSize = 1000;
        let lastId = null;

        while (true) {
            const query: any = {};
            if (lastId) query._id = { $gt: lastId };
            const users = await User.find(query).sort({ _id: 1 }).limit(batchSize);
            if (users.length == 0) break;
            lastId = users[users.length - 1]._id;
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
    }
    catch (err) {
        console.log(err);
    }

};
export const createNewMeasurement = async () => {

    try {
        let lastId = null;
        const batchSize = 1000;
        while (true) {
            const query: any = {}
            if (lastId) query._id = { $gt: lastId }
            const users = await User.find(query).sort({ _id: 1 }).limit(batchSize);
            if (users.length == 0) break;
            lastId = users[users.length - 1]._id;
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
    }
    catch (err) {
        console.log(err);
    }

}
export const checkMissedDay = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let lastId = null;
    const batchSize = 1000;
    while (true) {
        const query: any = {}
        if (lastId) query._id = { $gt: lastId }
        const fitnessPlans = await FitnessPlan.find(query).sort({ _id: 1 }).limit(batchSize);
        if (fitnessPlans.length == 0) break;
        lastId = fitnessPlans[fitnessPlans.length - 1]._id;
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
        }
    }

}

// Plan generation is a background job that makes ~28 sequential AI calls. If the
// process is restarted or the free-tier dyno spins down partway through, the run
// dies silently and the user is left with a permanently half-built plan - nothing
// else in the system ever completes it. This finds those and resumes them
// (runFitnessPlanGeneration skips days that already exist, so a resume only pays
// for what's missing).
const STALLED_GENERATION_AFTER_MS = 10 * 60 * 1000;

export const resumeIncompletePlans = async () => {
    try {
        const stalledBefore = new Date(Date.now() - STALLED_GENERATION_AFTER_MS);
        let lastId = null;
        const batchSize = 100;
        while (true) {
            const query: any = { createdAt: { $lt: stalledBefore } };
            if (lastId) query._id = { $gt: lastId };
            const plans = await FitnessPlan.find(query).sort({ _id: 1 }).limit(batchSize);
            if (plans.length == 0) break;
            lastId = plans[plans.length - 1]._id;
            for (const plan of plans) {
                const dayCount = plan.report?.plan?.days?.length ?? 0;
                if (dayCount === 0 || dayCount >= TOTAL_DAYS) continue;
                const userId = String(plan.userId);
                // don't race a run that's already going
                if (isGenerationInFlight(userId)) continue;
                console.warn(`Resuming stalled plan generation for user ${userId} (${dayCount}/${TOTAL_DAYS} days)`);
                // awaited so one batch doesn't fan out into many concurrent
                // multi-minute AI jobs at once
                await runFitnessPlanGeneration(userId);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

export const checkingStatusOfPlan = async () => {
    try {
        let lastId = null;
        const batchSize = 1000;
        while (true) {
            const query: any = {}
            if (lastId) query._id = { $gt: lastId }
            const fitnessPlans = await FitnessPlan.find(query).sort({ _id: 1 }).limit(batchSize);
            if (fitnessPlans.length == 0) break;
            lastId = fitnessPlans[fitnessPlans.length - 1]._id;
            const expiredIds = [];
            for (let plan of fitnessPlans) {
                try {
                    const amountOfDays = plan.report.plan.days.length;
                    if (amountOfDays === 0) continue;
                    if (new Date(plan.report.plan.days[amountOfDays - 1].date).getTime() < new Date().getTime()) {
                        expiredIds.push(plan._id);
                    }
                } catch (err) {
                    // one malformed plan shouldn't stop the rest of this batch from being checked
                    console.error(err);
                }
            }
            if (expiredIds.length > 0) {
                await FitnessPlan.deleteMany({ _id: { $in: expiredIds } });
            }
        }
    } catch (err) {
        console.error(err);
    }
}



// generating each day full info for workout of the day
export const generateNewDayFitnessContent = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let lastId = null;
        const batchSize = 1000;
        while (true) {
            const query: any = {}
            if (lastId) query._id = { $gt: lastId }
            const plans = await FitnessPlan.find(query).sort({ _id: 1 }).limit(batchSize);
            if (plans.length == 0) break;
            lastId = plans[plans.length - 1]._id;
            await Promise.all(plans.map(async (plan) => {
                try {
                    const day = plan.report.plan.days.find(day => new Date(day.date).toDateString() == today.toDateString());
                    // skip days that don't exist yet, and days that already have generated exercises -
                    // the whole 28-day plan is normally generated upfront by the client, so re-running
                    // this for an already-populated day would silently wipe the user's completed workout
                    if (!day || (day.exercises && day.exercises.length > 0)) return;
                    // getting user and measurements for sending proper metrics to ai to analyze
                    const [user, measurements] = await Promise.all([
                        User.findById(plan.userId),
                        Measurement.findOne({ userId: plan.userId }).sort({ createdAt: -1 }),
                    ]);
                    // requesting ai generating day
                    const info = await requestAiReport("/api/fitnessPlan/day", {
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

                    });
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
                    // one user's AI/network failure shouldn't stop the rest of tonight's batch
                    // from generating - previously this was unguarded and rejected the whole
                    // Promise.all, so a single flaky request could skip everyone after it
                    console.error(err);
                }
            }))
        }
    } catch (err) {
        console.error(err);
    }
}

// generating each day full info for workout of the day
export const generateNewDayNutritionContent = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const batchSize = 1000;
        let lastId = null;
        while (true) {
            const query: any = {};
            if (lastId) query._id = { $gt: lastId };
            const plans = await NutritionPlan.find(query).sort({ _id: 1 }).limit(batchSize);
            if (plans.length == 0) break;
            lastId = plans[plans.length - 1]._id;
            await Promise.all(plans.map(async (plan) => {
                try {
                    if (plan.days.length === 0) return;
                    const lastDay = plan.days[plan.days.length - 1];
                    const dayNumber = lastDay.dayNumber;
                    // skip plans that already have a day scheduled for today or later -
                    // without this the cron would push a duplicate day if it ever ran twice
                    // for the same plan (e.g. after a restart)
                    if (new Date(lastDay.date).getTime() >= today.getTime()) return;
                    // getting user and measurements for sending proper metrics to ai to analyze
                    const [user, measurements] = await Promise.all([
                        User.findById(plan.userId),
                        Measurement.findOne({ userId: plan.userId }).sort({ createdAt: -1 }),
                    ]);
                    // requesting ai generating day
                    const info = await requestAiReport("/api/nutrition", {

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

                    }, { query: { dayNumber: dayNumber + 1 } });
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
                    // the AI doesn't know the plan's real calendar - assign the next sequential
                    // date ourselves (same anchor createNutritionPlan uses), otherwise this day
                    // is saved with whatever date the AI hallucinated, which breaks date-based
                    // views like the weekly statistics chart
                    const nextDate = new Date(plan.createdAt);
                    nextDate.setDate(nextDate.getDate() + dayNumber);
                    info.date = nextDate;
                    info.dayNumber = dayNumber + 1;
                    plan.days.push(info);
                    await plan.save();
                } catch (err) {
                    // one user's AI/network failure shouldn't stop the rest of tonight's batch
                    // from generating - previously this was unguarded and rejected the whole
                    // Promise.all, so a single flaky request could skip everyone after it
                    console.error(err);
                }

            }))

        }
    } catch (err) {
        console.error(err);
    }
}
