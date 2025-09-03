import http from "http"
import { app } from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { socketInit } from "./socket";
import { initCron } from "./utils/cron";

// api routes
dotenv.config();
const server = http.createServer(app);

// initializing io sockets server
socketInit(server);

mongoose.connect(process.env.MONGO_URI!).then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
//cron notifications + other logic
initCron();
const PORT = process.env.PORT || 5200;
server.listen(PORT, () => {
    console.log(`server working on port ${process.env.PORT}`);
})



