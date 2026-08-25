import express from "express"
import rateLimit from "express-rate-limit";
import { deleteProfile, forgotPassword, getProfile, getSocketToken, logIn, logOut, onBoarding,  refresh, resetPassword, signUp, updateProfile } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const authRoute = express.Router();

// forgot-password sends a real email per request, so it needs its own limit
// beyond what a bare route would have (there is no rate limiting elsewhere yet)
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." },
});

// throttles password-guessing against a known email; generous enough not to lock
// out a real user who mistypes their password a few times
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again later." },
});

// caps scripted mass account creation from a single IP; generous enough for a
// household/office sharing an address to sign up without tripping it
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many signup attempts. Please try again later." },
});

// the reset token itself is a 256-bit random value (brute-forcing it isn't
// practical), but this still runs a bcrypt hash per request, so it's worth
// capping against sheer request-volume abuse
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." },
});

authRoute.post("/login", loginLimiter, logIn);
authRoute.post("/signup", signupLimiter, signUp);
authRoute.post("/onboarding", authMiddleware, onBoarding);
authRoute.post("/refresh", refresh);
authRoute.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
authRoute.post("/reset-password", resetPasswordLimiter, resetPassword);
authRoute.get("/profile", authMiddleware, getProfile);
authRoute.get("/socket-token", authMiddleware, getSocketToken);
authRoute.delete("/profile", authMiddleware, deleteProfile);
authRoute.patch("/profile", authMiddleware, updateProfile);
authRoute.delete("/logout", logOut);
export default authRoute;

