import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
// route import
import authRoute from "./routes/authRoutes"
import fitnessPlanRoute from "./routes/fitnessPlanRoutes";
// dotenv config
dotenv.config();

export const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// routing
app.use("/api/auth",authRoute);
app.use("/api/fitness-plan",fitnessPlanRoute);

//route for testing auth middleware
// app.get("/api/protected",authMiddleware, async (req: Request, res: Response) => {
//     return res.status(200).json("Route is protected");
// })


