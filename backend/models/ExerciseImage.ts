import mongoose from "mongoose";
import { IImage } from "../types/types";

const ExerciseImageSchema = new mongoose.Schema<IImage>({
    name: { type: String, unique: true, required: true },
    imageUrl: { type: String, required: true },
})

export default mongoose.model<IImage>("ExerciseImage", ExerciseImageSchema);