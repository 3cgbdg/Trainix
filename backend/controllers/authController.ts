import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/authMiddleware";
export const signUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        console.log(data);
        const user = await User.findOne({ email: data.email });
        if (user) {
            res.status(409).json({ message: "User with such an email exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = await User.create({ fullName: data.name + " " + data.surname, password: hashedPassword, email: data.email, dateOfBirth: data.dateOfBirth, gender: data.gender })
        const refreshToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        res.cookie("access-token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production",
            sameSite: "none",
            maxAge: 15 * 60 * 1000,
            path: "/"
        })
        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production",
            sameSite: "none",
            maxAge: 60 * 60 * 1000 * 24 * 7,
            path: "/"
        });
        res.json({ message: "User signed in!" });
        return;
    } catch (err) {
        res.json({ message: "Server error!" });

        return;
    }
}

export const onBoarding = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        const user = await User.findByIdAndUpdate((req as AuthRequest).userId, { $set: { "metrics.weight": data.weight, "metrics.height": data.height, targetWeight: data.targetWeight, primaryFitnessGoal: data.primaryFitnessGoal, fitnessLevel: data.fitnessLevel } });
        if (!user) {
            res.status(404).json({ message: "User was not found!" })
            return;
        }
        res.json({ message: "User info updated!" });
        return;
    } catch (err) {
        res.json({ message: "Server error!" });

        return;
    }
}

export const logIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        const user = await User.findOne({ email: data.email });
        if (!user) {
            res.status(404).json({ message: "User was not found!" })
            return;
        }
        const isValidPassword = await bcrypt.compare(data.password, user.password);
        if (!isValidPassword) {
            res.status(403).json({ message: "Wrong password!" });
            return;
        }
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        res.cookie("access-token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production",
            sameSite: "none",
            maxAge: 15 * 60 * 1000,
            path: "/"
        })
        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production",
            sameSite: "none",
            maxAge: 60 * 60 * 1000 * 24 * 7,
            path: "/"
        });
        res.json({ message: "User logged in!", user: user });
        return;
    } catch (err) {
        res.json({ message: "Server error!" });
        return;
    }
}

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies?.["refresh-token"];
        if (!refreshToken) {
            res.status(401).json({ message: "Not authorized!" });
            return;
        } else {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { userId: string };
                const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
                res.cookie("access-token", accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== "production",
                    sameSite: "none",
                    maxAge: 15 * 60 * 1000,
                    path: "/"
                })
                res.status(200).json({ message: "Token successfully created." });
                return;
            } catch (error) {
                res.status(403).json({ message: "Access denied! Invalid token." });
                return;
            }
        }
    } catch (err) {
        res.json({ message: "Server error!" });

        return;
    }
}

export const logOut = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("refresh-token", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production",
            sameSite: "none",
            path: "/",
        })
        res.clearCookie("access-token", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production",
            sameSite: "none",
            path: "/",
        })
        res.status(200).json({ message: "Logged out successfully" });
        return;
    } catch (err) {
        res.json({ message: "Server error!" });
        return;
    }
}


export const profile = async (req: Request, res: Response): Promise<void> => {
    try {
        const profile = await User.findById((req as AuthRequest).userId);
        res.json({user:profile});
        return;
    } catch (err) {
        res.json({ message: "Server error!" });
        return;
    }
}

