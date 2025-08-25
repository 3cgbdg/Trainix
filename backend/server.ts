import http from "http"
import { app } from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { socketInit } from "./socket";
import { cronNotifs } from "./utils/cronNotifs";

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
//cron notifications
cronNotifs();
server.listen(process.env.PORT, () => {
    console.log(`server working on port ${process.env.PORT}`);
})



