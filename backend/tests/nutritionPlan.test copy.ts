import request from "supertest"
import { app } from "../app"
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import User, { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import Notification from "../models/Notification";



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

        // tokens
        accessToken = jwt.sign({ userId: user1._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        invalidToken = jwt.sign({ userId: user2._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    })

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
        await mongo.stop();
    });

    //get-notifications route 
    describe("get-notifications", () => {

        it("get-notifications 404", async () => {

            const res = await request(app).get("/api/notification/notifications")
                .set("Cookie", `access-token=${invalidToken}`)
                .set("Authorization", `Bearer ${invalidToken}`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Not found!");
        })

        it("get-notifications 200", async () => {

            const res = await request(app).get("/api/notification/notifications")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
        })

        it("get-notifications - server error!", async () => {
            jest.spyOn(Notification, 'find').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/notification/notifications")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })

  



})