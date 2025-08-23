import { Server } from "socket.io";

export const userSocketMap = new Map<string, string>();

export let io: Server;

export const socketInit = (server: any) => {
    // webSockets
    io = new Server(server, {
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
}