import mongoose, { Schema, Document } from "mongoose";


interface IUser {
    fullName: string,
    password: string,
    email: string,
    dateOfBirth: Date,
    gender: string,
    metrics: {
        weight: number,
        height: number,
        waistToHipRatio:number,
        shoulerToWaistRatio:number,
        percentOfLegsLength:number,
        shoulderAsymmetricLine:number,
        shoulderAngle:number

    },
    targetWeight: number,
    fitnessLevel: "Beginner" | "Intermediate" | "Advanced",
    primaryFitnessGoal: "Lose weight" | "Gain muscle" | "Stay fit" | "Improve endurance",
}

export interface IUserDocument extends IUser, Document<mongoose.Types.ObjectId> { }
const userSchema = new mongoose.Schema<IUser>({
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female"], required: true },
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