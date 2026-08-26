import request from "supertest"
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { app } from "../app";
import User, { IUserDocument } from "../models/User";
import Measurement from "../models/Measurement";
import FitnessPlan from "../models/FitnessPlan";
import NutritionPlan from "../models/NutritionPlan";
import { parseAiReport, AiServiceError } from "../utils/aiClient";

// The AI service is a separate process; these tests exercise our side of the
// boundary (auth, validation, persistence, error mapping) with the transport stubbed.
jest.mock("../utils/aiClient", () => {
    const actual = jest.requireActual("../utils/aiClient");
    return { ...actual, requestPhotoAnalysis: jest.fn() };
});
jest.mock("../utils/aiGeneration", () => {
    const actual = jest.requireActual("../utils/aiGeneration");
    return {
        ...actual,
        generateNutritionPlanDay: jest.fn(),
        generateFitnessDayExercises: jest.fn(),
    };
});
jest.mock("../utils/images", () => ({
    s3ImageUploadingExercise: jest.fn(async () => "https://cdn.test/exercise.jpg"),
    s3ImageUploadingMeal: jest.fn(async () => "https://cdn.test/meal.jpg"),
}));

const { requestPhotoAnalysis } = jest.requireMock("../utils/aiClient");
const { generateNutritionPlanDay, generateFitnessDayExercises } = jest.requireMock("../utils/aiGeneration");

const METRICS = {
    height: 180, weight: 80, waistToHipRatio: 0.9, shoulderToWaistRatio: 1.4,
    bodyFatPercent: 20, muscleMass: 35, leanBodyMass: 64,
};

describe("AI proxy endpoints", () => {
    let mongo: MongoMemoryServer;
    let user: IUserDocument;
    let accessToken: string;

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        user = await User.create({
            firstName: "name", lastName: "surname", dateOfBirth: "2000-01-01",
            gender: "Male", email: "ai@gmail.com", password: await bcrypt.hash("12345678Aa", 10),
            metrics: { height: 180, weight: 80 }, targetWeight: 75,
            fitnessLevel: "Beginner", primaryFitnessGoal: "Lose weight",
        });
        accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongo.stop();
    });

    beforeEach(() => jest.clearAllMocks());

    const auth = (req: request.Test) => req.set("Cookie", `access-token=${accessToken}`);

    describe("parseAiReport", () => {
        // the four previous call sites each had their own regex; one required exactly
        // one whitespace char after the fence, so a harmless formatting change from
        // the model broke some paths and not others
        it.each([
            ['```json\n{"a":1}```', "fenced with json tag"],
            ['```json   {"a":1}```', "fenced with extra whitespace"],
            ['```JSON\n{"a":1}```', "uppercase tag"],
            ['```\n{"a":1}```', "bare fence"],
            ['{"a":1}', "no fence at all"],
            ['Here you go:\n```json\n{"a":1}\n```\nHope that helps!', "fence surrounded by prose"],
        ])("extracts JSON from %s (%s)", (report) => {
            expect(parseAiReport(report)).toEqual({ a: 1 });
        });

        it("passes through an already-parsed object", () => {
            expect(parseAiReport({ a: 1 })).toEqual({ a: 1 });
        });

        it("throws a typed error on malformed JSON", () => {
            expect(() => parseAiReport("```json\nnot json```")).toThrow(AiServiceError);
        });

        it("throws a typed error when the report is missing", () => {
            expect(() => parseAiReport(undefined)).toThrow(AiServiceError);
        });
    });

    describe("POST /api/measurement/analyze", () => {
        it("401s without auth", async () => {
            const res = await request(app).post("/api/measurement/analyze")
                .attach("image", Buffer.from("x"), { filename: "a.png", contentType: "image/png" });
            expect(res.status).toBe(401);
        });

        it("400s when no file is attached", async () => {
            const res = await auth(request(app).post("/api/measurement/analyze"));
            expect(res.status).toBe(400);
            expect(requestPhotoAnalysis).not.toHaveBeenCalled();
        });

        // this validation previously existed only in the dropzone widget, which a raw
        // multipart request straight at the AI service bypassed entirely
        it("rejects a non-image file type server-side", async () => {
            const res = await auth(request(app).post("/api/measurement/analyze")
                .attach("image", Buffer.from("MZ"), { filename: "evil.exe", contentType: "application/octet-stream" }));
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/JPG and PNG/i);
            expect(requestPhotoAnalysis).not.toHaveBeenCalled();
        });

        it("rejects a file over the 10 MB limit server-side", async () => {
            const res = await auth(request(app).post("/api/measurement/analyze")
                .attach("image", Buffer.alloc(11 * 1024 * 1024), { filename: "big.png", contentType: "image/png" }));
            expect(res.status).toBe(400);
            expect(requestPhotoAnalysis).not.toHaveBeenCalled();
        });

        it("persists the measurement returned by the AI service", async () => {
            requestPhotoAnalysis.mockResolvedValue({ metrics: METRICS, imageUrl: "https://cdn.test/body.jpg" });
            const res = await auth(request(app).post("/api/measurement/analyze")
                .attach("image", Buffer.from("fake-png"), { filename: "body.png", contentType: "image/png" }));

            expect(res.status).toBe(201);
            expect(res.body.measurement.metrics.bodyFatPercent).toBe(20);
            const saved = await Measurement.findOne({ userId: user._id }).sort({ createdAt: -1 });
            expect(saved!.imageUrl).toBe("https://cdn.test/body.jpg");
        });

        it("maps an AI service failure to 502 rather than a generic 500", async () => {
            requestPhotoAnalysis.mockRejectedValue(new AiServiceError("Could not read that photo."));
            const res = await auth(request(app).post("/api/measurement/analyze")
                .attach("image", Buffer.from("fake-png"), { filename: "body.png", contentType: "image/png" }));
            expect(res.status).toBe(502);
            expect(res.body.message).toBe("Could not read that photo.");
        });
    });

    describe("POST /api/nutrition-plan/nutrition-plans/generate", () => {
        const DAY = {
            dayNumber: 1,
            dailyGoals: { calories: { current: 0, target: 2000 }, protein: { current: 0, target: 150 }, carbs: { current: 0, target: 200 }, fats: { current: 0, target: 60 } },
            waterIntake: { current: 0, target: 2500 },
            meals: [{ mealTitle: "Oats", time: "08:00", foodIntake: "Breakfast", status: "pending", mealCalories: 400, mealProtein: 20, mealCarbs: 50, mealFats: 10, description: "", ingredients: [], preparation: "", imageUrl: "" }],
        };

        it("401s without auth", async () => {
            const res = await request(app).post("/api/nutrition-plan/nutrition-plans/generate?dayNumber=1");
            expect(res.status).toBe(401);
        });

        it("rejects an out-of-range day number before calling the AI service", async () => {
            const res = await auth(request(app).post("/api/nutrition-plan/nutrition-plans/generate?dayNumber=99"));
            expect(res.status).toBe(400);
            expect(generateNutritionPlanDay).not.toHaveBeenCalled();
        });

        it("generates and persists a day scoped to the caller", async () => {
            generateNutritionPlanDay.mockResolvedValue(DAY);
            const res = await auth(request(app).post("/api/nutrition-plan/nutrition-plans/generate?dayNumber=1"));

            expect(res.status).toBe(201);
            expect(res.body.day.meals[0].imageUrl).toBe("https://cdn.test/meal.jpg");
            const plan = await NutritionPlan.findOne({ userId: user._id });
            expect(plan!.days).toHaveLength(1);
        });

        it("502s when the AI service returns an unusable plan", async () => {
            generateNutritionPlanDay.mockResolvedValue({ nonsense: true });
            const res = await auth(request(app).post("/api/nutrition-plan/nutrition-plans/generate?dayNumber=2"));
            expect(res.status).toBe(502);
        });
    });

    describe("POST /api/fitness-plan/workouts/:day/generate", () => {
        beforeEach(async () => {
            await FitnessPlan.deleteMany({});
        });

        const seedPlan = () => FitnessPlan.create({
            userId: user._id,
            report: {
                streak: 0, briefAnalysis: {}, advices: {},
                plan: {
                    week1Title: "w1", week2Title: "w2", week3Title: "w3", week4Title: "w4",
                    days: [{ dayNumber: 1, day: "Day 1", status: "Pending", date: new Date(), exercises: [] }],
                },
            },
        });

        it("401s without auth", async () => {
            const res = await request(app).post("/api/fitness-plan/workouts/0/generate");
            expect(res.status).toBe(401);
        });

        it("404s when the day is not in the caller's plan", async () => {
            await seedPlan();
            const res = await auth(request(app).post("/api/fitness-plan/workouts/9/generate"));
            expect(res.status).toBe(404);
        });

        it("replaces the day in place and keeps its original date/dayNumber", async () => {
            const plan = await seedPlan();
            const originalDate = plan.report.plan.days[0].date;
            generateFitnessDayExercises.mockResolvedValue({
                day: {
                    dayNumber: 99, day: "Regenerated", status: "Pending",
                    date: "1999-01-01",
                    exercises: [{ title: "Squat", repeats: 10, time: null, instruction: "", advices: "", calories: 50, status: "incompleted", imageUrl: "" }],
                },
            });

            const res = await auth(request(app).post("/api/fitness-plan/workouts/0/generate"));
            expect(res.status).toBe(200);
            expect(res.body.day.exercises[0].imageUrl).toBe("https://cdn.test/exercise.jpg");

            const updated = await FitnessPlan.findById(plan._id);
            expect(updated!.report.plan.days).toHaveLength(1);
            // the model's own date/dayNumber are not authoritative - the slot wins
            expect(updated!.report.plan.days[0].dayNumber).toBe(1);
            expect(new Date(updated!.report.plan.days[0].date).getTime()).toBe(new Date(originalDate).getTime());
        });

        it("502s when the AI service returns a day with no exercises array", async () => {
            await seedPlan();
            generateFitnessDayExercises.mockResolvedValue({ day: { dayNumber: 1 } });
            const res = await auth(request(app).post("/api/fitness-plan/workouts/0/generate"));
            expect(res.status).toBe(502);
        });
    });
});
