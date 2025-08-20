import mongoose from "mongoose";
const MealImageSchema = new mongoose.Schema({
name:{type:String,unique:true,required:true},
imageUrl:{type:String,required:true},
})

export default mongoose.model("MealImage", MealImageSchema);