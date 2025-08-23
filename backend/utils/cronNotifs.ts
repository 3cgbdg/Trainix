
import nodeCron from "node-cron";
import Notification, { INotification } from "../models/Notification";
import { io, userSocketMap } from "../server";
import NutritionPlan from "../models/NutritionPlan";
import FitnessPlan from "../models/FitnessPlan";
import User from "../models/User";
import Measurement from "../models/Measurement";


export const cronNotifs = () => {
    // cron for socket notifications (waterIntake + nutrition plan ) --every 2 hours
    nodeCron.schedule("0 */3 * * *", async () => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        try {

            const plans = await NutritionPlan.find({
                "days.date": { $gte: startOfDay, $lte: endOfDay }
            }).populate<{ userId: { inAppNotifications: boolean } }>("userId", "inAppNotifications");
            const notifications: INotification[] = [];
            // parallel promises
            await Promise.all(plans.map(async (item) => {
                // checking whether user turned off in-app-notifications
                if (!item.userId.inAppNotifications) return;
                const day = item.days.find(day => new Date(day.date).getDate() === today.getDate());
                if (!day) return;
                // check water
                let notification: INotification | null;
                const socketId = userSocketMap.get(String(item.userId));

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
    })
    // cron every 14:00 for checking completing fitness day exercises
    nodeCron.schedule("00 14 * * *", async () => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        try {

            const plans = await FitnessPlan.find({
                "report.plan.days.date": { $gte: startOfDay, $lte: endOfDay }
            }).populate<{ userId: { inAppNotifications: boolean } }>("userId", "inAppNotifications");
            const notifications: INotification[] = [];
            // parallel promises
            await Promise.all(plans.map(async (item) => {
                // checking whether user turned off in-app-notifications
                if (!item.userId.inAppNotifications) return;
                const day = item.report.plan.days.find(day => new Date(day.date).getDate() === today.getDate());

                if (!day) return;


                const socketId = userSocketMap.get(String(item.userId));
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

    })
    // cron for every 2 weeks (14 days) metrics reminder
    nodeCron.schedule("0 8 */14 * *", async () => {

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

    })
    // checking every day for 14 days difference between measurement docs for creating a new one
    nodeCron.schedule("0 8 * * *", async () => {

        try {
            const users = await User.find({});

            const notifications: INotification[] = [];

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

    })
    //cron for every day checking missed workout days
    nodeCron.schedule("0 0 * * * *", async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fitnessPlans = await FitnessPlan.find({});
        for (let plan of fitnessPlans) {
            let changed = false;
            for (let day of plan.report.plan.days) {
                if (day.status == "Pending") break;
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

    })

}


