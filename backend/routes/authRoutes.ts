import express from "express"
import { deleteProfile, getProfile, logIn, logOut, onBoarding,  refresh, signUp, updateProfile } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const authRoute = express.Router();

authRoute.post("/login", logIn);
authRoute.post("/signup", signUp);
authRoute.post("/onboarding", authMiddleware, onBoarding);
authRoute.post("/refresh", refresh);
authRoute.get("/profile", authMiddleware, getProfile);
authRoute.delete("/profile", authMiddleware, deleteProfile);
authRoute.patch("/profile", authMiddleware, updateProfile);
authRoute.delete("/logout", logOut);
export default authRoute;

