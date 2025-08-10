import http from "http"
import { app } from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
// api routes
dotenv.config();
const server = http.createServer(app);


mongoose.connect(process.env.MONGO_URI!).then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

server.listen(process.env.PORT, () => {
    console.log(`server working on port ${process.env.PORT}`);
})



