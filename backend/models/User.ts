import mongoose, { Document } from "mongoose";


export interface IUser {
    firstName: string,
    lastName: string,
    password: string,
    email: string,
    dateOfBirth: Date,
    gender: string,
    longestStreak: number,
    inAppNotifications: boolean,
    metrics: {
        weight: number,
        height: number,
        waistToHipRatio: number,
        shoulerToWaistRatio: number,
        percentOfLegsLength: number,
        shoulderAsymmetricLine: number,
        shoulderAngle: number

    },
    targetWeight: number,
    fitnessLevel: "Beginner" | "Intermediate" | "Advanced",
    primaryFitnessGoal: "Lose weight" | "Gain muscle" | "Stay fit" | "Improve endurance",
}

export interface IUserDocument extends IUser, Document<mongoose.Types.ObjectId> { }
const userSchema = new mongoose.Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true },
    inAppNotifications: { type: Boolean, default:true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    longestStreak: { type: Number, default: 0 },
    metrics: {
        height: { type: Number },
        weight: { type: Number },
        shoulderToWaistRatio: { type: Number },
        waistToHipRatio: { type: Number },
        percentOfLegsLength: { type: Number },
        shoulderAsymmetricLine: { type: Number },
        shoulderAngle: { type: Number },
    },
    targetWeight: { type: Number },
    fitnessLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
    primaryFitnessGoal: { type: String, enum: ["Lose weight", "Gain muscle", "Stay fit", "Improve endurance"] },
})

export default mongoose.model<IUser>("User", userSchema);