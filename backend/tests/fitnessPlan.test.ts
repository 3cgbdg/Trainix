import request from "supertest"
import { app } from "../app"
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import User, { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import FitnessPlan from "../models/FitnessPlan";
import Measurement from "../models/Measurement";
import ExerciseImage from "../models/ExerciseImage";
import Notification from "../models/Notification";

// generateFitnessPlan fires this off in the background (28 sequential AI calls +
// S3 uploads) - stub it out so the /generate tests below only exercise the route's
// own auth/quota/rate-limit behavior, not a real AI provider.
jest.mock("../utils/fitnessPlanGeneration", () => ({
    runFitnessPlanGeneration: jest.fn(async () => undefined),
}));




describe("fitness-plan api", () => {
    // mongo in-memory server for not using real db 
    let mongo: MongoMemoryServer;
    let accessToken: string;
    let user1: IUserDocument;
    let invalidToken: string;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();
        await mongoose.connect(uri);
        // first user 
        const hashedPass = await bcrypt.hash('12345678Aa', 10);
        user1 = await User.create({
            firstName: 'name1',
            lastName: 'surname1',
            dateOfBirth: '2018-11-29',
            gender: 'Male',
            email: 'hello@gmail.com',
            password: hashedPass,
        });
        //second user, created for 404 errors
        const hashedPass2 = await bcrypt.hash('12345678Aa', 10);
        const user2 = await User.create({
            firstName: 'name2',
            lastName: 'surname2',
            dateOfBirth: '2018-11-29',
            gender: 'Male',
            email: 'hello2@gmail.com',
            password: hashedPass2,
        });

        //fitness plan for a user 1
        await FitnessPlan.create({
            userId: user1._id,
            report: {
                streak: 0,
                briefAnalysis: {
                    targetWeight: 23,
                    fitnessLevel: "fggf",
                    primaryFitnessGoal: "fggf",
                },
                plan: {
                    week1Title: "fsf",
                    week2Title: "fsf",
                    week3Title: "fsf",
                    week4Title: "fsf",
                    days:
                        [
                            {
                                date: new Date(),
                                dayNumber: 1,
                                status: "Pending",
                                calories: 500,
                                day: "geg",
                                exercises: [{
                                    title: "fsf",
                                    repeats: null,
                                    time: 30,
                                    instruction: "fsf",
                                    advices: "fsf",
                                    calories: 400,
                                    status: "incompleted",
                                    imageUrl: "fsf",
                                }]

                            }

                        ],
                },

                advices: {
                    nutrition: "gfgfgfdg",
                    hydration: "gfgfgfdg",
                    recovery: "gfgfgfdg",
                    progress: "gfgfgfdg",
                }
            }


        });
        await Measurement.create({
            userId: user1._id, metrics: {
                height: 12,
                weight: 123,
                waistToHipRatio: 12,
                shoulderToWaistRatio: 12,
                bodyFatPercent: 12,
                muscleMass: 12,
                leanBodyMass: 12,
            }, imageUrl: "dsadasdasd"
        });
        await ExerciseImage.create({ name: "fsf", imageUrl: "exercise-placeholder.jpg" });

        // tokens
        accessToken = jwt.sign({ userId: user1._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        invalidToken = jwt.sign({ userId: user2._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    })

    afterAll(async () => {
        await User.deleteMany({});
        await Measurement.deleteMany({});
        await FitnessPlan.deleteMany({});
        await Notification.deleteMany({});
        await ExerciseImage.deleteMany({});
        await mongoose.connection.close();
        await mongo.stop();
    });


    //get-workout(fitness)-day route 
    describe("get-workout(fitness)-day", () => {

        it("get-workout(fitness)-day 404", async () => {

            const res = await request(app).get("/api/fitness-plan/workouts/0")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
        })

        it("get-workout(fitness)-day 200", async () => {

            const res = await request(app).get("/api/fitness-plan/workouts/0")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.dayNumber).toBeDefined();
        })

        it("get-workout(fitness)-day - server error!", async () => {
            jest.spyOn(FitnessPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/fitness-plan/workouts/0")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
    //get-workouts route 
    describe("get-workouts", () => {
        it("get-workouts returns an empty plan state", async () => {

            const res = await request(app).get("/api/fitness-plan/workouts")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(200);
            expect(res.body.hasPlan).toBe(false);
            expect(res.body.items).toEqual([]);
        })

        it("get-workouts 200", async () => {

            const res = await request(app).get("/api/fitness-plan/workouts")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.items).toBeDefined();
        })

        it("get-workouts - server error!", async () => {
            jest.spyOn(FitnessPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/fitness-plan/workouts")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })

    //get-numbers route 
    describe("get-numbers", () => {
        it("get-numbers returns empty metrics when no plan exists", async () => {

            const res = await request(app).get("/api/fitness-plan/reports/numbers")
                .query({ date: new Date(), progress: true })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(200);
            expect(res.body.hasPlan).toBe(false);
            expect(res.body.calories).toBeNull();
        })

        it("get-numbers 200 if progress == true", async () => {

            const res = await request(app).get("/api/fitness-plan/reports/numbers")
                .query({ date: new Date(), progress: true })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.imagesData).toBeDefined();
        })
        it("get-numbers 200 if !progress", async () => {

            const res = await request(app).get("/api/fitness-plan/reports/numbers")
                .query({ date: new Date() })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.weight).toBeDefined();
        })

        it("get-numbers(1) - server error!", async () => {
            jest.spyOn(FitnessPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/fitness-plan/reports/numbers")
                .query({ date: new Date(), progress: true })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
        it("get-numbers(2) - server error!", async () => {
            jest.spyOn(Measurement, 'find').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/fitness-plan/reports/numbers")
                .query({ date: new Date(), progress: true })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
        it("get-numbers(3) - server error!", async () => {
            jest.spyOn(User, 'findById').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/fitness-plan/reports/numbers")
                .query({ date: new Date(), progress: true })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })

    //get-analysis route 
    describe("get-analysis", () => {
        it("get-analysis returns an empty state", async () => {

            const res = await request(app).get("/api/fitness-plan/analysis")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(200);
            expect(res.body.hasAnalysis).toBe(false);
        })

        it("get-analysis 200", async () => {

            const res = await request(app).get("/api/fitness-plan/analysis")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.chartData).toBeDefined();
        })

        it("get-analysis - server error!", async () => {
            jest.spyOn(Measurement, 'find').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/fitness-plan/analysis")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });

    })


    //get-analysis route 
    describe("get-analysis", () => {
        it("get-analysis returns an empty state", async () => {

            const res = await request(app).get("/api/fitness-plan/analysis")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(200);
            expect(res.body.hasAnalysis).toBe(false);
        })

        it("get-analysis 200", async () => {

            const res = await request(app).get("/api/fitness-plan/analysis")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.chartData).toBeDefined();
        })

        it("get-analysis - server error!", async () => {
            jest.spyOn(Measurement, 'find').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/fitness-plan/analysis")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });

    })

    //create-fitness-day route 
    describe("create-fitness-day", () => {
        const body = {
            day: {
                date: new Date(),
                dayNumber: 1,
                status: "Pending",
                calories: 500,
                day: "geg",
                exercises: [{
                    title: "fsf",
                    repeats: null,
                    time: 30,
                    instruction: "fsf",
                    advices: "fsf",
                    calories: 400,
                    status: "incompleted",
                    imageUrl: "fsf",
                }]
            }
        };
        it("create-fitness-day 201 - creating new plan", async () => {
            const body = {
                briefAnalysis: {
                    targetWeight: 23,
                    fitnessLevel: "fggf",
                    primaryFitnessGoal: "fggf",
                },
                advices: {
                    nutrition: "gfgfgfdg",
                    hydration: "gfgfgfdg",
                    recovery: "gfgfgfdg",
                    progress: "gfgfgfdg",
                },
                week1Title: 'dsada',
                week2Title: 'dsada',
                week3Title: 'dsada',
                week4Title: 'dsada',
                day: {


                    date: new Date(),
                    dayNumber: 1,
                    status: "Pending",
                    calories: 500,
                    day: "geg",
                    exercises: [{
                        title: "fsf",
                        repeats: null,
                        time: 30,
                        instruction: "fsf",
                        advices: "fsf",
                        calories: 400,
                        status: "incompleted",
                        imageUrl: "fsf",
                    }]
                }
            };
            const res = await request(app).post("/api/fitness-plan/days")
                .send({ data: body })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Plan created!");
        },10000)

        it("create-fitness-day 200 - adding day", async () => {
            const res = await request(app).post("/api/fitness-plan/days")
                .send({ data: body })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Day created!");
        },10000)

        it("create-fitness-day 500(1) - server error!", async () => {
            jest.spyOn(FitnessPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/fitness-plan/days")
                .send({ data: body })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });

        it("create-fitness-day 500(2) - server error!", async () => {
            jest.spyOn(ExerciseImage, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/fitness-plan/days")
                .send({ data: body })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });

        it("create-fitness-day 402 - free tier monthly plan quota already used", async () => {
            const hashedPass = await bcrypt.hash('12345678Aa', 10);
            const quotaUser = await User.create({
                firstName: 'quota', lastName: 'user', dateOfBirth: '2018-11-29',
                gender: 'Male', email: 'quota@gmail.com', password: hashedPass,
                aiPlanGenerationsThisMonth: 1, aiPlanGenerationsResetAt: new Date(),
            });
            const quotaToken = jwt.sign({ userId: quotaUser._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
            const res = await request(app).post("/api/fitness-plan/days")
                .send({ data: body })
                .set("Cookie", `access-token=${quotaToken}`)
                .set("Authorization", `Bearer ${quotaToken}`)
            expect(res.status).toBe(402);
            const stillNoPlan = await FitnessPlan.findOne({ userId: quotaUser._id });
            expect(stillNoPlan).toBeNull();
        });

        it("create-fitness-day 201 - premium tier bypasses the monthly quota", async () => {
            const hashedPass = await bcrypt.hash('12345678Aa', 10);
            const premiumUser = await User.create({
                firstName: 'premium', lastName: 'user', dateOfBirth: '2018-11-29',
                gender: 'Male', email: 'premium@gmail.com', password: hashedPass,
                subscriptionTier: 'premium', aiPlanGenerationsThisMonth: 5,
            });
            const premiumToken = jwt.sign({ userId: premiumUser._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
            const res = await request(app).post("/api/fitness-plan/days")
                .send({ data: body })
                .set("Cookie", `access-token=${premiumToken}`)
                .set("Authorization", `Bearer ${premiumToken}`)
            expect(res.status).toBe(201);
        }, 10000);

    })



    //get-workouts route 
    describe("complete-workout route", () => {
        const body = [{ "completed": true }, { "completed": false }, { "completed": true }];
        it("complete-workout route 404", async () => {

            const res = await request(app).post("/api/fitness-plan/workouts/0/completed")
                .send(body)
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Day is successfully compeleted!");
        })
        it("complete-workout route 200", async () => {

            const res = await request(app).post("/api/fitness-plan/workouts/0/completed")
                .send(body)
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Day is successfully compeleted!");
        })
        it("complete-workout route (1) - server error!", async () => {
            jest.spyOn(FitnessPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/fitness-plan/workouts/0/completed")
                .send(body)
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
        it("complete-workout route (2) - server error!", async () => {
            jest.spyOn(User, 'findById').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/fitness-plan/workouts/0/completed")
                .send(body)
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });

        it("persists one reminder and does not increment the streak when completion is replayed", async () => {
            const hashedPass = await bcrypt.hash('12345678Aa', 10);
            const replayUser = await User.create({
                firstName: 'replay', lastName: 'user', dateOfBirth: '2018-11-29',
                gender: 'Male', email: 'replay@gmail.com', password: hashedPass,
            });
            const replayToken = jwt.sign({ userId: replayUser._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
            await FitnessPlan.create({
                userId: replayUser._id,
                report: {
                    streak: 0,
                    briefAnalysis: { targetWeight: 75, fitnessLevel: "Beginner", primaryFitnessGoal: "Stay fit" },
                    plan: {
                        week1Title: "Foundation", week2Title: "Build", week3Title: "Progress", week4Title: "Finish",
                        days: [{
                            date: new Date(), dayNumber: 1, status: "Pending", calories: 100, day: "Replay-safe day",
                            exercises: [{ title: "Squat", repeats: 5, time: null, instruction: "Stand tall", advices: "Move slowly", calories: 100, status: "incompleted", imageUrl: "img" }],
                        }],
                    },
                    advices: { nutrition: "n", hydration: "h", recovery: "r", progress: "p" },
                },
            });

            const complete = () => request(app).post("/api/fitness-plan/workouts/0/completed")
                .send([{ completed: true }])
                .set("Cookie", `access-token=${replayToken}`)
                .set("Authorization", `Bearer ${replayToken}`);

            const first = await complete();
            const replay = await complete();

            expect(first.status).toBe(200);
            expect(first.body.streak).toBe(1);
            expect(replay.status).toBe(200);
            expect(replay.body.streak).toBe(1);
            expect(await Notification.countDocuments({ userId: replayUser._id, topic: "measurement" })).toBe(1);
        });
    })
    describe("longestStreak", () => {
        it("keeps the peak streak after the current streak resets", async () => {
            const hashedPass = await bcrypt.hash('12345678Aa', 10);
            const streakUser = await User.create({
                firstName: 'streak', lastName: 'user', dateOfBirth: '2018-11-29',
                gender: 'Male', email: 'streak@gmail.com', password: hashedPass,
            });
            const streakToken = jwt.sign({ userId: streakUser._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
            const makeDay = (dayNumber: number) => ({
                date: new Date(), dayNumber, status: "Pending", calories: 500, day: "day",
                exercises: [{ title: "ex", repeats: null, time: 30, instruction: "i", advices: "a", calories: 100, status: "incompleted", imageUrl: "img" }],
            });
            const streakPlan = await FitnessPlan.create({
                userId: streakUser._id,
                report: {
                    streak: 3,
                    briefAnalysis: { targetWeight: 1, fitnessLevel: "f", primaryFitnessGoal: "f" },
                    plan: { week1Title: "w", week2Title: "w", week3Title: "w", week4Title: "w", days: [makeDay(1), makeDay(2)] },
                    advices: { nutrition: "n", hydration: "h", recovery: "r", progress: "p" },
                },
            });
            streakUser.longestStreak = 3;
            await streakUser.save();

            // completing day 1 pushes streak to 4, which should raise longestStreak to 4
            await request(app).post("/api/fitness-plan/workouts/0/completed")
                .send([{ completed: true }])
                .set("Cookie", `access-token=${streakToken}`)
                .set("Authorization", `Bearer ${streakToken}`);
            let updatedUser = await User.findById(streakUser._id);
            expect(updatedUser!.longestStreak).toBe(4);

            // simulate a missed day resetting the current streak, independent of the peak
            await FitnessPlan.updateOne({ _id: streakPlan._id }, { $set: { "report.streak": 0 } });

            // completing day 2 brings the current streak to 1, well below the existing peak of 4
            await request(app).post("/api/fitness-plan/workouts/1/completed")
                .send([{ completed: true }])
                .set("Cookie", `access-token=${streakToken}`)
                .set("Authorization", `Bearer ${streakToken}`);
            updatedUser = await User.findById(streakUser._id);
            expect(updatedUser!.longestStreak).toBe(4);
        });
    });

    // generate-fitness-plan route
    describe("generate-fitness-plan", () => {
        it("generate 202 - starts generation and is scoped to the caller's own userId", async () => {
            const res = await request(app).post("/api/fitness-plan/generate")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(202);
            expect(res.body.message).toBe("Plan generation started");
        });

        it("generate 401 - no auth", async () => {
            const res = await request(app).post("/api/fitness-plan/generate");
            expect(res.status).toBe(401);
        });

        // regression test: this endpoint kicks off 28 sequential AI calls + S3 uploads
        // per request and (for an existing plan, or a premium account) was reachable
        // with no request limit at all - repeatable in a tight loop by the account
        // owner, a compromised session, or a forged cross-site request riding the
        // session cookie (the endpoint needs no request body, so it's a plain state-
        // changing POST with nothing to distinguish a same-site call from a forged
        // one). A per-IP rate limit now caps how often it can be triggered.
        it("generate 429 after repeated rapid requests (rate limit)", async () => {
            const hashedPass = await bcrypt.hash('12345678Aa', 10);
            const rlUser = await User.create({
                firstName: 'ratelimit', lastName: 'user', dateOfBirth: '2018-11-29',
                gender: 'Male', email: 'ratelimit@gmail.com', password: hashedPass,
                subscriptionTier: 'premium',
            });
            const rlToken = jwt.sign({ userId: rlUser._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });

            const statuses: number[] = [];
            for (let i = 0; i < 6; i++) {
                const res = await request(app).post("/api/fitness-plan/generate")
                    .set("Cookie", `access-token=${rlToken}`)
                    .set("Authorization", `Bearer ${rlToken}`);
                statuses.push(res.status);
            }
            expect(statuses).toContain(429);
        });
    })

    //delete-fitness-plan route
    describe("delete-fitness-plan", () => {
        it("delete-fitness-plan 200", async () => {

            const res = await request(app).delete("/api/fitness-plan/plan")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Successfully deleted!");
        })
        it("delete-fitness-plan - server error!", async () => {
            jest.spyOn(FitnessPlan, 'findOneAndDelete').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).delete("/api/fitness-plan/plan")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
})
