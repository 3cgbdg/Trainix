import request from "supertest"
import { app } from "../app"
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import User, { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import Measurement from "../models/Measurement";


describe("measurements api", () => {
    // mongo in-memory server for not using real db 
    let mongo: MongoMemoryServer;
    let accessToken: string;
    let user: IUserDocument;
    let invalidToken: string;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        const uri = mongo.getUri();
        await mongoose.connect(uri);
        const hashedPass = await bcrypt.hash('12345678Aa', 10);
        user = await User.create({
            firstName: 'name1',
            lastName: 'surname1',
            dateOfBirth: '2018-11-29',
            gender: 'Male',
            email: 'hello@gmail.com',
            password: hashedPass,
        });
        const hashedPass2 = await bcrypt.hash('12345678Aa', 10);
        const user2 = await User.create({
            firstName: 'name2',
            lastName: 'surname2',
            dateOfBirth: '2018-11-29',
            gender: 'Male',
            email: 'hello2@gmail.com',
            password: hashedPass2,
        });
        await Measurement.create({
            userId: user._id, metrics: {
                height: 12,
                weight: 123,
                waistToHipRatio: 12,
                shoulderToWaistRatio: 12,
                bodyFatPercent: 12,
                muscleMass: 12,
                leanBodyMass: 12,
            }, imageUrl: "dsadasdasd"
        });
        accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        invalidToken = jwt.sign({ userId: user2._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    })

    afterAll(async () => {
        await User.deleteMany({});
        await Measurement.deleteMany({});
        await mongoose.connection.close();
        await mongo.stop();
    });

    //get-measurement route 
    describe("get-measurement", () => {
        it("get-measurement 404", async () => {

            const res = await request(app).get("/api/measurement/measurements")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
        })
        it("get-measurement 200", async () => {

            const res = await request(app).get("/api/measurement/measurements")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id");
        })

        it("get-measurement - server error!", async () => {
            jest.spyOn(Measurement, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/measurement/measurements")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
    //create-measurement route 
    describe("create-measurement", () => {
        const body = {
            imageUrl: "sdadasdasd",
            metrics: {
                height: 12,
                weight: 123,
                waistToHipRatio: 12,
                shoulderToWaistRatio: 12,
                bodyFatPercent: 12,
                muscleMass: 12,
                leanBodyMass: 12,
            }
        }
        it("create-measurement 200", async () => {

            const res = await request(app).post("/api/measurement/measurements")
                .send(body)
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Successfully created!");
        })

        it("create-measurement - server error!", async () => {
            jest.spyOn(Measurement, 'create').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/measurement/measurements")
                .send(body)
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })

})