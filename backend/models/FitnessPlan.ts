import mongoose, { Schema, Document } from "mongoose";


interface IFitnessPlan {
userId:mongoose.Types.ObjectId,
report:Object,
 createdAt:Date
}

export interface IUserDocument extends IFitnessPlan, Document<mongoose.Types.ObjectId> { }
const fitnessPlanSchema = new mongoose.Schema<IFitnessPlan>({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  report: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<IFitnessPlan>("FitnessPlan", fitnessPlanSchema);