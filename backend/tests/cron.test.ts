import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import User, { IUserDocument } from "../models/User";
import bcrypt from "bcrypt"
import { checkMissedDay, createNewMeasurement, metricsReminder, regularReminder, workoutReminder } from '../utils/cronsLogicFuncs';
import Notification from '../models/Notification';
import { configDotenv } from 'dotenv';
// mocking socket module
jest.mock('../socket', () => ({
    io: { to: jest.fn().mockReturnThis(), emit: jest.fn() },
    userSocketMap: new Map()
}));
import { io, userSocketMap } from '../socket';
import FitnessPlan from '../models/FitnessPlan';
import Measurement from '../models/Measurement';
import NutritionPlan from '../models/NutritionPlan';

//loading dotenv for process.env
configDotenv()


describe("cron inner-logic funcs", () => {
    // mongo in-memory server for not using real db 
    let mongo: MongoMemoryServer;
    let user1: IUserDocument;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();
        await mongoose.connect(uri);
        const hashedPass = await bcrypt.hash('12345678Aa', 10);
        user1 = await User.create({
            firstName: 'name1',
            lastName: 'surname1',
            dateOfBirth: '2018-11-29',
            gender: 'Male',
            email: 'hello@gmail.com',
            password: hashedPass,
            inAppNotifications: true,
        });
        userSocketMap.set(String(user1._id), "socket1Id")
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
        //measurement for create-meaurement-func logic
        await Measurement.create({
            userId: user1._id,
            metrics: {
                weight: 70,
                bodyFatPercent: 20,
                muscleMass: 30,
                leanBodyMass: 50,
                waistToHipRatio: 0.8,
                shoulderToWaistRatio: 1.5,
                height: 180
            },
            imageUrl: "dasd"
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
    })

    afterAll(async () => {
        await User.deleteMany({});
        await Measurement.deleteMany({});
        await FitnessPlan.deleteMany({});
        await NutritionPlan.deleteMany({});
        await mongoose.connection.close();
        await mongo.stop();
        userSocketMap.clear();
    });
    afterEach(async () => {
        await Notification.deleteMany({});
    })
    it("regular-reminder", async () => {
        // spy socket

        await regularReminder();
        expect(io.to).toHaveBeenCalledWith("socket1Id");
        expect(io.emit).toHaveBeenCalledWith("getNotifications",
            expect.objectContaining({
                data: expect.objectContaining({
                    topic: "water"
                })
            })
        );
        const notifications = await Notification.find({});
        expect(notifications.length).toBe(1);

        jest.restoreAllMocks();
    })

    it("workout-reminder", async () => {
        // spy socket

        await workoutReminder();
        expect(io.to).toHaveBeenCalledWith("socket1Id");
        expect(io.emit).toHaveBeenCalledWith("getNotifications",
            expect.objectContaining({
                data: expect.objectContaining({
                    topic: "sport"
                })
            })
        );
        const notifications = await Notification.find({});
        expect(notifications.length).toBe(1);

        jest.restoreAllMocks();
    })

    it("metrics-reminder", async () => {
        // spy socket

        await metricsReminder();
        expect(io.to).toHaveBeenCalledWith("socket1Id");
        expect(io.emit).toHaveBeenCalledWith("getNotifications",
            expect.objectContaining({
                data: expect.objectContaining({
                    topic: "measurement"
                })
            })
        );
        const notifications = await Notification.find({});
        expect(notifications.length).toBe(1);

        jest.restoreAllMocks();
    })
    it("create-new-measurement", async () => {
        await createNewMeasurement();
        const measurements = await Measurement.find({});
        expect(measurements.length).toBe(1);

    })
    it("check-missed-workout-day", async () => {
        const realDate = global.Date;
        // creating fake Date
        const fakeToday = new Date("2025-08-29T12:00:00Z");
        global.Date = class extends realDate {
            constructor(...args: unknown[]) {
                if (args.length === 0) {
                    super(fakeToday);
                } else {
                    // @ts-ignore
                    super(...args);
                }
            }
        } as any;
        await checkMissedDay();
        const plans = await FitnessPlan.find({});
        expect(plans[0].report.plan.days[0].status).toBe("Missed");
        global.Date = realDate;
    })


})