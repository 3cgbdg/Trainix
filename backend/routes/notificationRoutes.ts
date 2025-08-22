import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware";
import { deleteNotification, getNotifications } from "../controllers/notificationsController";

const notificationRoute = express.Router();


notificationRoute.delete("/notifications/:id", authMiddleware,deleteNotification);
notificationRoute.get("/notifications/", authMiddleware,getNotifications );

export default notificationRoute;

