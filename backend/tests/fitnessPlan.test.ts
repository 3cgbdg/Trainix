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

        // tokens
        accessToken = jwt.sign({ userId: user1._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        invalidToken = jwt.sign({ userId: user2._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    })

    afterAll(async () => {
        await User.deleteMany({});
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
        it("get-workouts 404", async () => {

            const res = await request(app).get("/api/fitness-plan/workouts")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
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
        it("get-numbers 404", async () => {

            const res = await request(app).get("/api/fitness-plan/reports/numbers")
                .query({ date: new Date(), progress: true })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
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
        it("get-analysis 404", async () => {

            const res = await request(app).get("/api/fitness-plan/analysis")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
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
        it("get-analysis 404", async () => {

            const res = await request(app).get("/api/fitness-plan/analysis")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
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
        })

        it("create-fitness-day 200 - adding day", async () => {
            const res = await request(app).post("/api/fitness-plan/days")
                .send({ data: body })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Day created!");
        })

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


    })



    //get-workouts route 
    describe("complete-workout route", () => {
        const body = [{ "completed": true }, { "completed": false }, { "completed": true }];
        it("complete-workout route 404", async () => {

            const res = await request(app).post("/api/fitness-plan/workouts/0/completed")
                .send(body)
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
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