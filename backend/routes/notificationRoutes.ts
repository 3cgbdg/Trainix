import express from "express"
import { deleteNotification, getNotifications } from "../controllers/notificationsController";

const notificationRoute = express.Router();


notificationRoute.delete("/notifications/:id",deleteNotification);
notificationRoute.get("/notifications/",getNotifications );

export default notificationRoute;

