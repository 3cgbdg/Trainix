import request from "supertest"
import { app } from "../app"
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import User, { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import Notification, {  INotificationDocument } from "../models/Notification";


describe("notifications api", () => {
    // mongo in-memory server for not using real db 
    let mongo: MongoMemoryServer;
    let accessToken: string;
    let user: IUserDocument;
    let notification: INotificationDocument;
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
        notification = await Notification.create({
            userId: user._id,
            topic: "water",
            info: "water 2000ml",
        });
        accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        invalidToken = jwt.sign({ userId: user2._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    })

    afterAll(async () => {
        await User.deleteMany({});
        await Notification.deleteMany({});
        await mongoose.connection.close();
        await mongo.stop();
    });

    //get-notifications route 
    describe("get-notifications", () => {
  
        it("get-notifications 200", async () => {
            const res = await request(app).get("/api/notification/notifications")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body[0]).toHaveProperty("_id");
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
    //delete-notification route
    describe("delete-notifications", () => {

        it("delete-notifications 200", async () => {
            const res = await request(app).delete(`/api/notification/notifications/${notification._id}`)
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Deleted Successfully!");
        })

        it("delete-notifications - server error!", async () => {
            jest.spyOn(Notification, 'findByIdAndDelete').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).delete(`/api/notification/notifications/${notification._id}`)
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
})