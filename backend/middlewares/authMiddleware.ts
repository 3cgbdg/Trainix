import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId: string,
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.["access-token"] || req.headers['authorization']?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Not authorized!" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        (req as AuthRequest).userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({ message: "Access denied! Invalid token." });
        return;
    }

}