import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
// middleware returns a cookie value  -  user id
export interface AuthRequest extends Request {
    userId: string,
}

// shared with socket.ts so there's a single place that decides what a valid access token is
export const verifyAccessToken = (token: string): string | null => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId;
    } catch {
        return null;
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    //access-token ?? return 401
    const token = req.cookies?.["access-token"] || req.headers['authorization']?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Not authorized!" });
        return;
    }

    const userId = verifyAccessToken(token);
    if (!userId) {
        res.status(403).json({ message: "Access denied! Invalid token." });
        return;
    }
    (req as AuthRequest).userId = userId;
    next();
}