import mongoose, { Document } from "mongoose";

interface IMetrics {
  height: number,
  weight: number,
  waistToHipRatio: number,
  shoulderToWaistRatio: number,
  bodyFatPercent: number,
  muscleMass: number,
  leanBodyMass: number,
}

interface IMeasurements {
  userId: mongoose.Types.ObjectId,
  metrics: IMetrics,
  createdAt: Date
  imageUrl: string,

}

export interface IMeasurementsDocument extends IMeasurements, Document<mongoose.Types.ObjectId> { }
const measurementsSchema = new mongoose.Schema<IMeasurements>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metrics: { type: Object, required: true },
  imageUrl: { type: String, required: true },
 
  createdAt: { type: Date, default: Date.now },


})

export default mongoose.model<IMeasurements>("Measurements", measurementsSchema);