import mongoose, {Document } from "mongoose";

interface Exercise {
  title: string;
  repeats: number | null;
  time: number | null;

}

interface IDayPlan {
  day: string;
  exercises: Exercise[];
  status:"Pending"|'Completed'|"Missed",
  calories:number,
}



interface IBriefAnalysis {
  targetWeight: number;
  fitnessLevel: string;
  primaryFitnessGoal: string;
}

interface IAdvices {
  nutrition: string;
  hydration: string;
  recovery: string;
  progress: string;
}

interface IReportData {
  briefAnalysis: IBriefAnalysis;
  plan:{
    week1Title:string,
    week2Title:string,
    week3Title:string,
    week4Title:string,
    days:IDayPlan[],
  } 
  advices: IAdvices;
  imageUrl: string;
}



interface IFitnessPlan {
userId:mongoose.Types.ObjectId,
report:IReportData,
 createdAt:Date
}

export interface IFitnessPlanDocument extends IFitnessPlan, Document<mongoose.Types.ObjectId> { }
const fitnessPlanSchema = new mongoose.Schema<IFitnessPlan>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  report: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },

})

export default mongoose.model<IFitnessPlan>("FitnessPlan", fitnessPlanSchema);