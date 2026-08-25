import express, { Request, Response } from "express";
import crypto from "crypto";
import { runDueCronJobs } from "../utils/cron";

const internalRoute = express.Router();

const isAuthorized = (req: Request): boolean => {
    const expected = process.env.CRON_SECRET;
    if (!expected) return false;
    const provided = req.headers["x-cron-secret"];
    if (typeof provided !== "string") return false;
    const expectedBuf = Buffer.from(expected);
    const providedBuf = Buffer.from(provided);
    if (expectedBuf.length !== providedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
};

// meant to be called by an external scheduler (see runDueCronJobs in utils/cron.ts for
// why this exists) - not part of the user-facing API, so it isn't behind authMiddleware
internalRoute.post("/cron", (req: Request, res: Response): void => {
    if (!isAuthorized(req)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    res.status(202).json({ message: "Cron jobs triggered" });
    void runDueCronJobs();
});

export default internalRoute;
