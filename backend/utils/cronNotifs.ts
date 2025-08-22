
import nodeCron from "node-cron";
import Notification, { INotification } from "../models/Notification";
import { io, userSocketMap } from "../server";
import NutritionPlan from "../models/NutritionPlan";
import FitnessPlan from "../models/FitnessPlan";


export const cronNotifs = () => {
    // cron for socket notifications (waterIntake + nutrition plan ) --every 2 hours
    nodeCron.schedule("0 */2 * * *", async () => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        try {

            const plans = await NutritionPlan.find({
                "days.date": { $gte: startOfDay, $lte: endOfDay }
            });
            const notifications: INotification[] = [];
            await Promise.all(plans.map(async (item) => {
                const day = item.days.find(day => new Date(day.date).getDate() === today.getDate());
                if (!day) return;
                const socketId = userSocketMap.get(String(item.userId));
                if (socketId) {
                    // check water
                    let notification: INotification | null;

                    if (day.waterIntake.current < day.waterIntake.target) {
                        notification = await Notification.findOne({ userId: item.userId, topic: "water" });
                        if (!notification) {
                            notification = new Notification({ userId: item.userId, info: `Reminder: You need to drink ${day.waterIntake.target - day.waterIntake.current} ml of water`, topic: "water" })
                            io.to(socketId).emit("getNotifications", { data: notification })
                            notifications.push(notification);
                        }
                    }
                    // check meals
                    for (let meal of day.meals) {
                        if (meal.status !== "eaten" && (Number(meal.time.split(":")[0]) - new Date().getHours() <= 2)) {

                            notification = await Notification.findOne({ userId: item.userId, topic: "nutrition" });
                            if (!notification) {
                                notification = new Notification({ userId: item.userId, info: `Reminder: have a ${meal.foodIntake.toLowerCase()}`, topic: "nutrition" })
                                notifications.push(notification);
                                io.to(socketId).emit("getNotifications", { data: notification })
                            }

                        }
                    }
                }
            }))
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
            });
            const notifications: INotification[] = [];
            await Promise.all(plans.map(async (item) => {
                console.log("niger1");
                const day = item.report.plan.days.find(day => new Date(day.date).getDate() === today.getDate());
                if (!day) return;
                console.log("niger2");

                const socketId = userSocketMap.get(String(item.userId));
                if (socketId) {
                    let notification: INotification | null;

                    // check activity
                    if (day.status !== "Completed") {
                        notification = await Notification.findOne({ userId: item.userId, topic: "sport" });
                        if (!notification) {
                            const notification = new Notification({ userId: item.userId, info: `Reminder: Time for your workout`, topic: "sport" })
                            notifications.push(notification);
                            io.to(socketId).emit("getNotifications", { data: notification })
                        }
                    }
                    console.log("niger3");
                }
            }))
            await Notification.insertMany(notifications);
        } catch (err) {
            console.log(err);
        }

    })
    //
}