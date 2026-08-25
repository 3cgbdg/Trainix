import { Request, Response } from "express";
import crypto from "crypto";
import User, { IUser } from "../models/User";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/authMiddleware";
import FitnessPlan from "../models/FitnessPlan";
import NutritionPlan from "../models/NutritionPlan";
import Measurement from "../models/Measurement";
import Notification from "../models/Notification";
import { sendPasswordResetEmail } from "../utils/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const hashResetToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

// signup func
export const signUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        if (!data.email || !data.password || !data.name || !data.surname || !data.gender) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        // email/password must be plain strings before they're allowed anywhere near a
        // Mongoose filter - otherwise a client can send e.g. { "$gt": "" } or a $regex
        // object as "email" and use it as a NoSQL query operator instead of a value
        if (typeof data.email !== "string" || typeof data.password !== "string") {
            res.status(400).json({ message: "Invalid request." });
            return;
        }
        const user = await User.findOne({ email: data.email });
        if (user) {
            res.status(409).json({ message: "User with such an email exists" });
            return;
        }
        // hashing and saving password into db
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = await User.create({ firstName: data.name, lastName: data.surname, password: hashedPassword, email: data.email, dateOfBirth: data.dateOfBirth, gender: data.gender })
        const refreshToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        //   creating jwt, saving it into a cookie
        // sameSite: "lax" (not "none") - the frontend only ever talks to this API
        // through its own same-origin Next.js rewrite proxy (see frontend's
        // axiosInstance.ts), so the browser treats these as first-party cookies
        // regardless; "lax" additionally stops the cookie from riding along on a
        // cross-site POST/PATCH/DELETE forged against a logged-in user (CSRF), while
        // still allowing it on a top-level cross-site GET redirect (e.g. Stripe
        // checkout bouncing back to /profile). The direct cross-origin Socket.IO
        // handshake doesn't rely on this cookie at all - it fetches its own
        // short-lived token via /api/auth/socket-token instead (see socket.ts).
        res.cookie("access-token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
            path: "/"
        })
        // refresh token system
        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000 * 24 * 7,
            path: "/"
        });
        res.json({ message: "User signed in!" });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });

        return;
    }
}

// post info of  onboadrding section
export const onBoarding = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        const user = await User.findByIdAndUpdate((req as AuthRequest).userId, { $set: { "metrics.weight": data.weight, "metrics.height": data.height, targetWeight: data.targetWeight, primaryFitnessGoal: data.primaryFitnessGoal, fitnessLevel: data.fitnessLevel } }, { runValidators: true });
        if (!user) {
            res.status(404).json({ message: "User was not found!" })
            return;
        }
        res.json({ message: "User info updated!" });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });

        return;
    }
}

export const logIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        if (!data.email || !data.password) {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }
        // same NoSQL-operator-injection guard as signUp: without this, an object like
        // { "$regex": "^a" } as "email" turns the DB lookup into a query operator and
        // lets an attacker use the 404-vs-403 response difference as a boolean oracle
        // to enumerate every registered email address, bypassing the anti-enumeration
        // design used by forgot-password.
        if (typeof data.email !== "string" || typeof data.password !== "string") {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }
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
        // refresh token system
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        res.cookie("access-token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
            path: "/"
        })
        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000 * 24 * 7,
            path: "/"
        });
        const { password, ...userWithoutPassword } = user.toObject();
        res.json({ message: "User logged in!", user: userWithoutPassword });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// refresh every time using protected-middleware api
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
                    secure: true,
                    sameSite: "lax",
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
        res.status(500).json({ message: "Server error!" });

        return;
    }
}

// requesting a password-reset email. Always responds with the same generic
// message regardless of whether the email is registered, so this endpoint
// can't be used to enumerate which emails have accounts.
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const genericResponse = { message: "If an account exists for that email, a reset link has been sent." };
        // reject non-string email (e.g. a $regex/$ne operator object) before it reaches
        // the query - same class of NoSQL-injection guard as signUp/logIn
        if (!email || typeof email !== "string") {
            res.status(200).json(genericResponse);
            return;
        }
        const user = await User.findOne({ email });
        if (user) {
            const rawToken = crypto.randomBytes(32).toString("hex");
            user.resetPasswordTokenHash = hashResetToken(rawToken);
            user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
            await user.save();
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            const resetLink = `${frontendUrl.replace(/\/$/, "")}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
            await sendPasswordResetEmail(email, resetLink);
        }
        res.status(200).json(genericResponse);
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// completing a password reset with the token emailed by forgotPassword
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        // reject non-string email/token before they reach the query/hash comparison -
        // same class of NoSQL-injection guard as signUp/logIn/forgotPassword
        if (typeof email !== "string" || typeof token !== "string") {
            res.status(400).json({ message: "This reset link is invalid or has expired." });
            return;
        }
        if (typeof newPassword !== "string" || newPassword.length < 8) {
            res.status(400).json({ message: "Password must be at least 8 characters." });
            return;
        }
        const user = await User.findOne({ email }).select("+resetPasswordTokenHash +resetPasswordExpires");
        if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
            res.status(400).json({ message: "This reset link is invalid or has expired." });
            return;
        }
        const providedHash = hashResetToken(token);
        const tokensMatch = crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(user.resetPasswordTokenHash));
        if (!tokensMatch) {
            res.status(400).json({ message: "This reset link is invalid or has expired." });
            return;
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordTokenHash = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Password updated. You can now log in." });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// log-out func
export const logOut = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("refresh-token", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        })
        res.clearCookie("access-token", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        })
        res.status(200).json({ message: "Logged out successfully" });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// short-lived token for the direct cross-origin Socket.IO handshake, which can't
// rely on the httpOnly access-token cookie: the frontend and backend are on
// different origins in production, and the cookie is scoped to whichever origin
// the browser believes served it — the frontend's, via the Next.js rewrite proxy —
// so it never reaches a direct connection to the backend origin. This endpoint is
// reached through that same proxy, so the httpOnly cookie DOES work here.
export const getSocketToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = jwt.sign({ userId: (req as AuthRequest).userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        res.json({ token });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// profile getting
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const profile = await User.findById((req as AuthRequest).userId).select("-password");
        if (!profile) {
            // the JWT is still valid but the account it points to is gone (e.g.
            // deleted); a 200 with a null user left callers stuck treating this
            // as a signed-in session with no data instead of a signed-out one
            res.status(404).json({ message: "User was not found!" });
            return;
        }
        res.json({ user: profile });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// deleting profile func
export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).userId;
        await Promise.all([
            User.findByIdAndDelete(userId),
            FitnessPlan.deleteMany({ userId }),
            NutritionPlan.deleteMany({ userId }),
            Measurement.deleteMany({ userId }),
            Notification.deleteMany({ userId }),
        ]);
        res.clearCookie("refresh-token", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        });
        res.clearCookie("access-token", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        });
        res.json({ message: "Successfully deleted!" });
        return;
    } catch (err) {
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// updating info in user document
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // payload-Partial-IUser( including pass-changing )
        const payload = req.body;
        const profile = await User.findById((req as AuthRequest).userId);
        if (!profile) {
            res.status(404).json({ message: "User was not found!" });
            return;
        }
        // pass check (fields-newPassword - newPasswordAgain -password)
        if (payload.password) {
            const isGood = await bcrypt.compare(payload.password, profile.password);
            if (!isGood) {
                res.status(403).json({ message: "Password is incorrect!" });
                return;
            }

            if (payload.newPassword && payload.newPassword === payload.newPasswordAgain) {
                const hashedPass = await bcrypt.hash(payload.newPassword, 10);
                profile.password = hashedPass;

            } else if (payload.newPassword || payload.newPasswordAgain) {
                res.status(400).json({ message: "Passwords do not match!" });
                return;
            }
        }
        // updating metrics expect pass
        const editableFields: (keyof IUser | keyof IUser["metrics"])[] = ["firstName", "lastName", "email", "gender", "dateOfBirth", "weight", "height", "targetWeight", "fitnessLevel", "primaryFitnessGoal", "inAppNotifications"];
        Object.entries(payload).forEach(([key, value]) => {
            if (!(editableFields as string[]).includes(key)) return;
            if (value !== undefined) {
                // height,weight have different location
                if (["height", "weight"].includes(key)) {
                    profile.set(`metrics.${key}`, value);

                } else {
                    profile.set(key, value);
                }
            }

        });
        profile.markModified(`metrics`);
        await profile.save();
        const { password, ...newObj } = profile.toObject();
        res.json({ user: newObj });
        return;
    } catch (err) {
        if (err && typeof err === "object" && "code" in err && err.code === 11000) {
            res.status(409).json({ message: "User with such an email exists" });
            return;
        }
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

