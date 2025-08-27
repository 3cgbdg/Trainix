import mongoose, { Document } from "mongoose";

export interface IExercise {
  title: string,
  repeats: number | null,
  time: number | null,
  instruction: string,
  advices: string,
  calories: number,
  status: "incompleted" | 'completed',
  imageUrl: string,
}
export interface IDayPlan {
  dayNumber:number,
  day: string,
  exercises: IExercise[],
  status: "Pending" | 'Completed' | "Missed",
  calories: number,
  date: Date,

}



export interface IBriefAnalysis {
  targetWeight: number;
  fitnessLevel: string;
  primaryFitnessGoal: string;
}

export interface IAdvices {
  nutrition: string;
  hydration: string;
  recovery: string;
  progress: string;
}

interface IReportData {
  streak: number,
  briefAnalysis: IBriefAnalysis;
  plan: {
    week1Title: string,
    week2Title: string,
    week3Title: string,
    week4Title: string,
    days: IDayPlan[],
  }
  advices: IAdvices;
 
}



interface IFitnessPlan {
  userId: mongoose.Types.ObjectId,
  report: IReportData,
  createdAt: Date
}


export interface IFitnessPlanDocument extends IFitnessPlan, Document<mongoose.Types.ObjectId> { }
const fitnessPlanSchema = new mongoose.Schema<IFitnessPlan>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  report: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },

})

export default mongoose.model<IFitnessPlan>("FitnessPlan", fitnessPlanSchema);