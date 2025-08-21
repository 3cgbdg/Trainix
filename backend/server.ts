import http from "http"
import { app } from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
// api routes
dotenv.config();
const server = http.createServer(app);

// webSockets
const userSocketMap = new Map<string,Socket>();
  const  io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    }); 


    io.on("connection",(socket)=>{
        socket.on("joinNotifications",(userId)=>{
            socket.join(userId);
            userSocketMap.set(userId,socket);
        
        })
        
        socket.on("disconnect",()=>{
            userSocketMap.forEach((value,key)=>{
                if(socket==value){

                userSocketMap.delete(key);
                }

            })
        })
    })

mongoose.connect(process.env.MONGO_URI!).then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

server.listen(process.env.PORT, () => {
    console.log(`server working on port ${process.env.PORT}`);
})



