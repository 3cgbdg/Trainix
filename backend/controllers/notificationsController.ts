import { Request, Response } from "express";
import Notification from "../models/Notification";
import { AuthRequest } from "../middlewares/authMiddleware";

// delete notifications from the db ater reading it and pressing ok
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
    const {id}= req.params;
    try {
        await Notification.findByIdAndDelete(id);
        res.status(200).json({message:"Deleted Successfully!"})
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// getting available notifs 
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const notifications =await Notification.find({userId:(req as AuthRequest).userId});
        if(!notifications){
            res.status(404).json({message:"Not found!"})
            return;
        }
        res.status(200).json(notifications);
        return;
    } catch {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}
