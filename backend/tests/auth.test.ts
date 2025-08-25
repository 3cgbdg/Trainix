import request from "supertest"
import { app } from "../app"
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import User, { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import { logOut } from "../controllers/authController";
import bcrypt from "bcrypt"

// not fully juust primitive interface for update profile api test
interface IPayload {
    password?: string,
    newPassword?: string,
    newPasswordAgain?: string,
    firstName?: string,
    lastName?: string,
}
describe("auth api", () => {
    // mongo in-memory server for not using real db 
    let mongo: MongoMemoryServer;
    let refreshToken: string;
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
        refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
        accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        invalidToken = jwt.sign({ userId: "fghrerhrhr43t45fbgf" }, process.env.JWT_SECRET!, { expiresIn: "15m" });
    })

    afterAll(async () => {
        await mongoose.connection.close();
        await mongo.stop();
    });

    // signup route
    describe("signup", () => {
        it("signup 200", async () => {
            const res = await request(app).post("/api/auth/signup")
                .send({
                    name: 'name2',
                    surname: 'surname2',
                    dateOfBirth: '2018-11-29',
                    gender: 'Male',
                    email: 'email1@gmail.com',
                    password: '12345678Aa'
                });

            expect(res.headers["set-cookie"]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining(`access-token=`),
                    expect.stringContaining(`refresh-token=`)
                ])
            );
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("User signed in!");
        })
        it("signup 409 - email is taken", async () => {
            const res = await request(app).post("/api/auth/signup")
                .send({
                    name: 'name2',
                    surname: 'surname2',
                    dateOfBirth: '2018-11-29',
                    gender: 'Male',
                    email: 'email1@gmail.com',
                    password: '12345678Aa'
                });
            expect(res.status).toBe(409);
            expect(res.body.message).toBe("User with such an email exists");
        })

        it("signup - server error!", async () => {
            jest.spyOn(User, 'create').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/auth/signup")
                .send({
                    name: 'name2',
                    surname: 'surname2',
                    dateOfBirth: '2018-11-29',
                    gender: 'Male',
                    email: 'email11@gmail.com',
                    password: '12345678Aa'
                });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
    // login route
    describe("login", () => {
        it("login 404 - not found", async () => {
            const res = await request(app).post("/api/auth/login")
                .send({
                    email: "hello2@gmail.com",
                    password: "12345678Aa",
                });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("User was not found!");
        })
        it("login 403 - password is wrong", async () => {
            const res = await request(app).post("/api/auth/login")
                .send({
                    email: "hello@gmail.com",
                    password: "12345678Ba",
                });
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("Wrong password!");
        })
        it("login 200", async () => {
            const res = await request(app).post("/api/auth/login")
                .send({
                    email: 'hello@gmail.com',
                    password: '12345678Aa'
                });
            expect(res.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('access-token='),
                    expect.stringContaining('refresh-token='),
                ])
            );

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("User logged in!");
            expect(res.body.user._id).toBe(user._id.toString());

        })
        it("login - server error!", async () => {
            jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/auth/login")
                .send({ username: "testuser1", password: "12345678Dd" });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
    // onboarding route
    describe("onboarding", () => {
        it("onboarding 200", async () => {
            const res = await request(app).post("/api/auth/onboarding")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    weight: '81',
                    height: '177',
                    targetWeight: '75',
                    fitnessLevel: 'Intermediate',
                    primaryFitnessGoal: 'Improve endurance'
                });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("User info updated!");
        });
        it("onboarding - server error!", async () => {
            jest.spyOn(User, 'findOneAndUpdate').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).post("/api/auth/onboarding")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({
                    weight: '81',
                    height: '177',
                    targetWeight: '75',
                    fitnessLevel: 'Intermediate',
                    primaryFitnessGoal: 'Improve endurance'
                });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
    // refresh route
    describe("refresh", () => {
        it("refresh 401 - not authorized", async () => {
            const res = await request(app).post("/api/auth/refresh");
            // expect(res.status).toBe(401);
            expect(res.body.message).toBe("Not authorized!");
        });
        it("refresh 403 - invalid token", async () => {
            const res = await request(app).post("/api/auth/refresh")
                .set("Cookie", `refresh-token=invalidToken`)
                .set("Authorization", `Bearer invalidToken`)
                ;
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("Access denied! Invalid token.");
        });

        it("refresh 200", async () => {
            const res = await request(app).post("/api/auth/refresh")
                .set("Cookie", `refresh-token=${refreshToken}`)
                .set("Authorization", `Bearer ${refreshToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Token successfully created.");
            expect(res.headers["set-cookie"]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining(`access-token=`)
                ])
            );
        });
    })
    // logout route
    describe("logout", () => {
        it("logout 200", async () => {
            const res = await request(app).delete("/api/auth/logout");
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Logged out successfully");
            expect(res.headers["set-cookie"]).toEqual(
                expect.arrayContaining([
                    expect.stringContaining(`refresh-token=;`),
                    expect.stringContaining(`access-token=;`),
                ])
            );
        });

        it("logout - server error!", async () => {
            const mockRes: any = {
                clearCookie: jest.fn(() => { throw new Error("Cookie error"); }),
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            await logOut({} as any, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Server error!" });
        });
    })
    // update-profile route
    describe("update-profile", () => {
        let payload: IPayload = {
            password: "12345678Aa",
            newPassword: "12345678Ab",
            newPasswordAgain: "12345678Ab",
        }
        it("update-profile 403 - password is incorrect!", async () => {
            payload.password = "12345678Af"
            const res = await request(app).patch("/api/auth/profile")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send(payload);
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("Password is incorrect!");
        })
        it("update-profile 400 - passwords do not match!", async () => {
            payload.password = "12345678Aa"
            payload.newPassword = "12345678Af"
            const res = await request(app).patch("/api/auth/profile")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Passwords do not match!");
        })
        it("update-profile 200 passwords", async () => {
            payload.newPassword = payload.newPasswordAgain;
            const res = await request(app).patch("/api/auth/profile")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send(payload);
            expect(res.status).toBe(200);
            expect(res.body.user).toHaveProperty("_id");
        })
        it("update-profile 200 other info", async () => {
            payload = {
                firstName: "Nigel",
                lastName: "Stetsuk",
            };
            const res = await request(app).patch("/api/auth/profile")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send(payload);
            expect(res.status).toBe(200);
            expect(res.body.user).toHaveProperty("_id");
        })
        it("update-profile - server error!", async () => {
            jest.spyOn(User, 'findById').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).patch("/api/auth/profile")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send(payload);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
    //get-profile route 
    describe("get-profile", () => {
        it("get-profile 200", async () => {

            const res = await request(app).get("/api/auth/profile")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.user).toHaveProperty("_id");
        })

        it("get-profile - server error!", async () => {
            jest.spyOn(User, 'findById').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).get("/api/auth/profile")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
    // delete-profile route
    describe("delete-profile", () => {
        it("delete-profile 200", async () => {

            const res = await request(app).delete("/api/auth/profile")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Successfully deleted!");
        })
        it("delete-profile - server error!", async () => {
            jest.spyOn(User, 'findByIdAndDelete').mockImplementationOnce(() => {
                throw new Error("DB error");
            });
            const res = await request(app).delete("/api/auth/profile")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`)
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
    })
})