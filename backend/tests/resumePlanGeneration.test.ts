import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User, { IUserDocument } from "../models/User";
import FitnessPlan from "../models/FitnessPlan";

jest.mock("../socket", () => ({
    io: { to: jest.fn().mockReturnThis(), emit: jest.fn() },
    userSocketMap: new Map(),
}));
jest.mock("../utils/images", () => ({
    s3ImageUploadingExercise: jest.fn(async () => "https://cdn.test/exercise.jpg"),
    s3ImageUploadingMeal: jest.fn(async () => "https://cdn.test/meal.jpg"),
}));
jest.mock("../utils/aiClient", () => {
    const actual = jest.requireActual("../utils/aiClient");
    return { ...actual, requestAiReport: jest.fn() };
});

const { requestAiReport } = jest.requireMock("../utils/aiClient");
import { resumeIncompletePlans } from "../utils/cronsLogicFuncs";
import { TOTAL_DAYS } from "../utils/fitnessPlanGeneration";

// A plan generation is ~28 sequential AI calls in a detached background promise. A
// process restart or free-tier dyno spin-down partway through used to leave the user
// with a permanently half-built plan that nothing in the system ever completed.
describe("resuming stalled plan generation", () => {
    let mongo: MongoMemoryServer;
    let user: IUserDocument;

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        user = await User.create({
            firstName: "name", lastName: "surname", dateOfBirth: "2000-01-01",
            gender: "Male", email: "resume@gmail.com", password: await bcrypt.hash("12345678Aa", 10),
            metrics: { height: 180, weight: 80 }, targetWeight: 75,
            fitnessLevel: "Beginner", primaryFitnessGoal: "Lose weight",
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongo.stop();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await FitnessPlan.deleteMany({});
        requestAiReport.mockImplementation(async (_path: string, _body: unknown, opts: any) => ({
            day: { dayNumber: opts.query.dayNumber, day: "Full Body & Core", status: "Pending", date: new Date() },
        }));
    });

    const seedPlan = (dayCount: number, createdAt: Date) => FitnessPlan.create({
        userId: user._id,
        createdAt,
        report: {
            streak: 0, briefAnalysis: {}, advices: {},
            plan: {
                week1Title: "w1", week2Title: "w2", week3Title: "w3", week4Title: "w4",
                days: Array.from({ length: dayCount }, (_, i) => ({
                    dayNumber: i + 1, day: "Day", status: "Pending", date: new Date(), exercises: [],
                })),
            },
        },
    });

    const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

    it("finishes a plan that stalled partway through", async () => {
        const plan = await seedPlan(12, hoursAgo(1));

        await resumeIncompletePlans();

        const updated = await FitnessPlan.findById(plan._id);
        expect(updated!.report.plan.days).toHaveLength(TOTAL_DAYS);
        // only the 16 missing days should have cost an AI call
        expect(requestAiReport).toHaveBeenCalledTimes(TOTAL_DAYS - 12);
    });

    it("does not re-generate days that were already stored", async () => {
        const plan = await seedPlan(12, hoursAgo(1));

        await resumeIncompletePlans();

        const requestedDays = requestAiReport.mock.calls.map((call: any[]) => call[2].query.dayNumber);
        expect(Math.min(...requestedDays)).toBe(13);
        const updated = await FitnessPlan.findById(plan._id);
        // no duplicate dayNumbers introduced by the resume
        const dayNumbers = updated!.report.plan.days.map((d) => d.dayNumber);
        expect(new Set(dayNumbers).size).toBe(TOTAL_DAYS);
    });

    it("leaves a complete plan alone", async () => {
        await seedPlan(TOTAL_DAYS, hoursAgo(1));

        await resumeIncompletePlans();

        expect(requestAiReport).not.toHaveBeenCalled();
    });

    // a plan created moments ago is probably still generating right now - resuming it
    // would race the in-flight run
    it("leaves a freshly created plan alone", async () => {
        await seedPlan(3, new Date());

        await resumeIncompletePlans();

        expect(requestAiReport).not.toHaveBeenCalled();
    });

    it("keeps going when one user's resume fails", async () => {
        const otherUser = await User.create({
            firstName: "other", lastName: "user", dateOfBirth: "2000-01-01",
            gender: "Male", email: "resume2@gmail.com", password: await bcrypt.hash("12345678Aa", 10),
            metrics: { height: 175, weight: 70 }, targetWeight: 68,
            fitnessLevel: "Beginner", primaryFitnessGoal: "Stay fit",
        });
        await seedPlan(10, hoursAgo(1));
        await FitnessPlan.create({
            userId: otherUser._id,
            createdAt: hoursAgo(1),
            report: {
                streak: 0, briefAnalysis: {}, advices: {},
                plan: {
                    week1Title: "w1", week2Title: "w2", week3Title: "w3", week4Title: "w4",
                    days: [{ dayNumber: 1, day: "Day", status: "Pending", date: new Date(), exercises: [] }],
                },
            },
        });

        let calls = 0;
        requestAiReport.mockImplementation(async (_path: string, _body: unknown, opts: any) => {
            calls += 1;
            if (calls === 1) throw new Error("AI service exploded");
            return { day: { dayNumber: opts.query.dayNumber, day: "Full Body & Core", status: "Pending", date: new Date() } };
        });

        await expect(resumeIncompletePlans()).resolves.not.toThrow();
        // the failure aborted one plan's run but the sweep continued to the other
        expect(calls).toBeGreaterThan(1);
    });
});
