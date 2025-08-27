import request from "supertest"
import { app } from "../app"
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import User, { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

import NutritionPlan from "../models/NutritionPlan";
import MealImage from "../models/MealImage";


describe("nutrition-plan api", () => {
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
        //nutrition plan for a user 1
        await NutritionPlan.create({
            userId: user1._id,
            days:
                [
                    {
                        date: new Date(),
                        dayNumber: 1,
                        dailyGoals: {
                            calories: {
                                current: 0,
                                target: 500
                            },
                            protein: { current: 0, target: 600 },
                            carbs: { current: 0, target: 220 },
                            fats: { current: 0, target: 550 },
                        },
                        meals: [
                            {
                                mealTitle: "fsfsf",
                                time: "gregergregr",
                                imageUrl: "gregergregr",
                                description: "gregergregr",
                                ingredients: ["frefegeg", "fewfwefwef"],
                                preparation: "gregregre",
                                mealCalories: 12,
                                mealProtein: 12,
                                mealCarbs: 12,
                                mealFats: 12,
                                status: "pending",
                                foodIntake: "Snack",
                            }
                        ],
                        waterIntake: {
                            current: 200,
                            target: 700
                        },
                    }

                ]

        });
        // tokens
        accessToken = jwt.sign({ userId: user1._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        invalidToken = jwt.sign({ userId: user2._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    })

    afterAll(async () => {
        await NutritionPlan.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
        await mongo.stop();
    });

    //get-nutrition-day route 
    describe("get-nutrition-day", () => {

        it("get-nutrition-day 404", async () => {

            const res = await request(app).get("/api/nutrition-plan/nutrition-plans")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
        })

        it("get-nutrition-day 200", async () => {

            const res = await request(app).get("/api/nutrition-plan/nutrition-plans")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.dayNumber).toBeDefined();
        })

        it("get-nutrition-day - server error!", async () => {
            jest.spyOn(NutritionPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/nutrition-plan/nutrition-plans")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })

    //get-week-statistics route 
    describe("get-week-statistics", () => {

        it("get-week-statistics 404", async () => {

            const res = await request(app).get("/api/nutrition-plan/statistics")
                .query({ week: 1 })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
        })

        it("get-week-statistics 200", async () => {

            const res = await request(app).get("/api/nutrition-plan/statistics")
                .query({ week: 1 })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body[0].day).toBeDefined();
        })

        it("get-week-statistics - server error!", async () => {
            jest.spyOn(NutritionPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/nutrition-plan/statistics")
                .query({ week: 1 })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })

    //update-meal-status route 
    describe("update-meal-status", () => {

        it("update-meal-status 404", async () => {

            const res = await request(app).patch("/api/nutrition-plan/nutrition-plans/days/0/meal/status")
                .send({ index: 0 })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
        })

        it("update-meal-status 200", async () => {

            const res = await request(app).patch("/api/nutrition-plan/nutrition-plans/days/0/meal/status")
                .send({ index: 0 })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Status updated!");
        })

        it("update-meal-status - server error!", async () => {
            jest.spyOn(NutritionPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).patch("/api/nutrition-plan/nutrition-plans/days/0/meal/status")
                .send({ index: 0 })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })

    //update-water-intake route 
    describe("update-water-intake", () => {

        it("update-water-intake 404", async () => {

            const res = await request(app).patch("/api/nutrition-plan/nutrition-plans/days/0/water")
                .send({ amount: 110 })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
        })

        it("update-water-intake 200", async () => {

            const res = await request(app).patch("/api/nutrition-plan/nutrition-plans/days/0/water")
                .send({ amount: 230 })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Status updated!");

        })

        it("update-water-intake - server error!", async () => {
            jest.spyOn(NutritionPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).patch("/api/nutrition-plan/nutrition-plans/days/0/water")
                .send({ amount: 450 })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })

    //create-nutrition-day route 
    describe("create-nutrition-day", () => {
        const body = {
            date: new Date(),
            dayNumber: 1,
            dailyGoals: {
                calories: {
                    current: 0,
                    target: 500
                },
                protein: { current: 0, target: 600 },
                carbs: { current: 0, target: 220 },
                fats: { current: 0, target: 550 },
            },
            meals: [
                {
                    mealTitle: "fsfsf",
                    time: "gregergregr",
                    imageUrl: "gregergregr",
                    description: "gregergregr",
                    ingredients: ["frefegeg", "fewfwefwef"],
                    preparation: "gregregre",
                    mealCalories: 12,
                    mealProtein: 12,
                    mealCarbs: 12,
                    mealFats: 12,
                    status: "pending",
                    foodIntake: "Snack",
                }
            ],
            waterIntake: {
                current: 200,
                target: 700
            },
        }
        it("create-nutrition-day 201 - creating new plan", async () => {

            const res = await request(app).post("/api/nutrition-plan/nutrition-plans/days")
                .send({ data: body })
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(201);
            expect(res.body.message).toBe("Nutrition plan created!");
        })

        it("create-nutrition-day 200 - adding day", async () => {

            const res = await request(app).post("/api/nutrition-plan/nutrition-plans/days")
                .send({ data: body })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Successfully added day!");
        })

        it("create-nutrition-day 500(1) - server error!", async () => {
            jest.spyOn(NutritionPlan, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/nutrition-plan/nutrition-plans/days")
                .send({ data: body })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });

        it("create-nutrition-day 500(2) - server error!", async () => {
            jest.spyOn(MealImage, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/nutrition-plan/nutrition-plans/days")
                .send({ data: body })
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });


    })

})