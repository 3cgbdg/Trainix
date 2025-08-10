import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/authMiddleware";
import FitnessPlan from "../models/FitnessPlan";

export const addReport = async(req:Request,res:Response):Promise<void>=>{
    const data = req.body;
    console.log(data);
    try{
        const report = await FitnessPlan.create({userId:(req as AuthRequest).userId,report:data,createdAt:new Date()});
        res.status(201).json({message:"Report created!"});
        return;
    }catch(err){
        res.status(500).json({message:"Server error!"});
        return;
    }
}

