import mongoose, { Document } from "mongoose";




const ImageSchema = new mongoose.Schema({
name:{type:String,unique:true,required:true},
imageUrl:{type:String,required:true},
})

export default mongoose.model("Image", ImageSchema);