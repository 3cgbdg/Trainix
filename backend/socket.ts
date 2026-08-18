import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "./middlewares/authMiddleware";

export const userSocketMap = new Map<string, string>();

export let io: Server;

// deriving the userId from the verified access-token instead of trusting a
// client-supplied id prevents one client from hijacking another user's notifications
function getUserIdFromSocket(socket: Socket): string | null {
    let token = socket.handshake.auth?.token as string | undefined;
    const cookieHeader = socket.handshake.headers.cookie;
    if (!token && cookieHeader) {
        const match = cookieHeader.split(";").map(c => c.trim()).find(c => c.startsWith("access-token="));
        if (match) token = decodeURIComponent(match.split("=")[1]);
    }
    if (!token) return null;
    return verifyAccessToken(token);
}

export const socketInit = (server: any) => {
    // webSockets
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const userId = getUserIdFromSocket(socket);
        if (!userId) {
            next(new Error("Unauthorized"));
            return;
        }
        socket.data.userId = userId;
        next();
    });
    io.on("connection", (socket) => {
        const userId = socket.data.userId as string;
        userSocketMap.set(userId, socket.id);
        socket.on("disconnect", () => {
            if (userSocketMap.get(userId) === socket.id) {
                userSocketMap.delete(userId);
            }
        })
    })
}