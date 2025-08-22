import mongoose, { Document } from "mongoose";




export interface INotification {
  userId: mongoose.Types.ObjectId,
  topic: "water" | "sport" | "nutrition";
  info: string,
  createdAt: Date,
}


const notificationSchema = new mongoose.Schema<INotification>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, enum: ["water", "sport", "nutrition"], required: true },
  info: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 7200 }, //document expires in 2 hours
})

export default mongoose.model<INotification>("Notification", notificationSchema);