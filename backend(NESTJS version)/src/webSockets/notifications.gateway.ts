import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import * as cookie from "cookie"
import { JwtService } from "@nestjs/jwt";
import { ForbiddenException, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { PrismaService } from "prisma/prisma.service";
import { Notification } from "generated/prisma/browser";

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true
    }
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly jwtService: JwtService, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, private readonly prisma: PrismaService) { };
    @WebSocketServer()
    server: Server

    async handleConnection(client: Socket) {
        const cookies = client.handshake.headers.cookie;

        if (cookies) {
            const parsed = cookie.parse(cookies);
            const token = parsed['access_token'];
            try {
                const payload = this.jwtService.verify(token as string) as { userId: string };
                await this.cacheManager.set(payload.userId, client.id, 3600);
                client.data.userId = payload.userId;
            }
            catch {
                client.disconnect();
            }
        }
    }

    async handleDisconnect(client: Socket) {

        const userId = client.data.userId;
        if (!userId)
            throw new ForbiddenException("No access");
        await this.cacheManager.del(userId);
    }

    async notifyUserAfterWorkout(myId: string) {
        const socketId = await this.cacheManager.get(myId) as string | undefined;
        let notification: Notification | null;
        notification = await this.prisma.notification.findFirst({ where: { userId: myId, topic: "MEASUREMENT" } });
        if (!notification) {
            const notification = this.prisma.notification.create({ data: { userId: myId, info: `Reminder:  Want to update your metrics ?`, topic: "MEASUREMENT" } });
            if (socketId)
                this.server.to(socketId).emit("getNotifications", { data: notification })
        }
    }







}