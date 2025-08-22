import http from "http"
import { app } from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
import nodeCron from "node-cron";
import User from "./models/User";
import NutritionPlan from "./models/NutritionPlan";
// api routes
dotenv.config();
const server = http.createServer(app);

// webSockets
const userSocketMap = new Map<string, string>();
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
});
io.on("connection", (socket) => {
    socket.on("joinNotifications", (userId) => {
        socket.join(userId);
        userSocketMap.set(String(userId), socket.id);
    })
    socket.on("disconnect", () => {
        userSocketMap.forEach((value, key) => {
            if (socket.id == value) {
                userSocketMap.delete(key);
            }

        })
    })
})

nodeCron.schedule("*/10 * * * * *", async () => {
    try {
        const plans = await NutritionPlan.find({});
        for (let item of plans) {
            for (let day of item.days) {
                if (new Date(day.date).getDate() == new Date().getDate()) {
                    if (day.waterIntake.current !== day.waterIntake.target) {

                        const socketId = userSocketMap.get(String(item.userId));
                        if (socketId)
                            io.to(socketId).emit("getNotifications", { data: day.waterIntake.target - day.waterIntake.current })
                    }

                    break;
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
})
mongoose.connect(process.env.MONGO_URI!).then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

server.listen(process.env.PORT, () => {
    console.log(`server working on port ${process.env.PORT}`);
})



