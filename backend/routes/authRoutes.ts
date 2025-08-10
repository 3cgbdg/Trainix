import express from "express"
import { logIn, logOut, onBoarding, profile, refresh, signUp } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const authRoute = express.Router();

authRoute.post("/login", logIn);
authRoute.post("/signup", signUp);
authRoute.post("/onboarding", authMiddleware, onBoarding);
authRoute.post("/refresh", refresh);
authRoute.get("/profile", authMiddleware, profile);
authRoute.delete("/logout", logOut);
export default authRoute;

