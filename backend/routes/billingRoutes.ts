import express from "express"
import { createCheckoutSession, createPortalSession } from "../controllers/billingController";

const billingRoute = express.Router();

billingRoute.post("/checkout", createCheckoutSession);
billingRoute.post("/portal", createPortalSession);

export default billingRoute;
