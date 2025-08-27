import jwt from "jsonwebtoken";

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest"
import User, { IUserDocument } from "../models/User";
import { app } from "../app";
import bcrypt from "bcrypt"

let mongo: MongoMemoryServer;
beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    mongoose.connect(uri);
})

afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
});

// using protected route for testing middlewares
describe("middlewares for backend", () => {
    let user1: IUserDocument;
    let validToken: string;
    beforeAll(async () => {
        const hashedPass = await bcrypt.hash('12345678Aa', 10);
        user1 = await User.create({
            firstName: 'name1',
            lastName: 'surname1',
            dateOfBirth: '2018-11-29',
            gender: 'Male',
            email: 'hello@gmail.com',
            password: hashedPass,
        });
        validToken = await jwt.sign({ userId: user1._id, role: "user" }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    })
    afterAll(async () => {
        await User.deleteMany({});
    })
    describe("auth middleware", () => {
        it("Protected", async () => {
            const res = await request(app).get("/api/protected")
                .set("Cookie", `token=${validToken}`)
                .set("Authorization", `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toBe("Route is protected");
        })
        it("401 not authorized", async () => {
            const res = await request(app).get("/api/protected");

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Not authorized!");
        })
        it("403 invalid token", async () => {
            const res = await request(app).get("/api/protected")
                .set("Cookie", `token=dsaddasd}`)
                .set("Authorization", `Bearer dsadasd`);

            expect(res.status).toBe(403);
            expect(res.body.message).toBe("Access denied! Invalid token.");
        })
    })
})