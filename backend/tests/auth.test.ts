import request from "supertest"
import { app } from "../app"
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import User, { IUserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import { logOut } from "../controllers/authController";
import bcrypt from "bcrypt"
import * as emailUtils from "../utils/email";

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

        // regression test: signup's duplicate-email check (User.findOne({ email })) used
        // to accept a raw operator object as "email" unvalidated, which - combined with
        // the 409-vs-500 response difference - could be used as a boolean oracle for
        // whether any registered email matches a given pattern.
        it("signup 400 - operator-object email is rejected before it reaches the DB query (NoSQL injection guard)", async () => {
            const res = await request(app).post("/api/auth/signup")
                .send({
                    name: 'name3',
                    surname: 'surname3',
                    dateOfBirth: '2018-11-29',
                    gender: 'Male',
                    email: { $regex: "^email1" },
                    password: '12345678Aa'
                });
            expect(res.status).toBe(400);
        });

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
                .send({ email: "testuser1@gmail.com", password: "12345678Dd" });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Server error!" });
            jest.restoreAllMocks();
        });
        it("login - missing email or password returns 400", async () => {
            const res = await request(app).post("/api/auth/login").send({ password: "12345678Dd" });
            expect(res.status).toBe(400);
        });
        // regression test: a NoSQL operator object (e.g. { "$regex": "^h" }) used to be
        // passed straight into User.findOne({ email }) unvalidated. That let an
        // unauthenticated caller use the 404-vs-403 response difference as a boolean
        // oracle to enumerate every registered email address (a $regex/$ne value matches
        // *some* real user, producing 403 "Wrong password!" instead of 404 "User was not
        // found!"), completely bypassing the anti-enumeration design used elsewhere
        // (forgot-password always returns the same generic message). Non-string email/
        // password must now be rejected before any DB query runs.
        it("login - operator-object email/password is rejected before it reaches the DB query (NoSQL injection guard)", async () => {
            const res = await request(app).post("/api/auth/login").send({
                email: { $regex: "^h" },
                password: { $ne: null },
            });
            expect(res.status).toBe(400);
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

        it("get-profile 404 when the token is valid but the account no longer exists", async () => {
            const deletedUserToken = jwt.sign({ userId: "507f1f77bcf86cd799439011" }, process.env.JWT_SECRET!, { expiresIn: "15m" });
            const res = await request(app).get("/api/auth/profile")
                .set("Cookie", `access-token=${deletedUserToken}`)
                .set("Authorization", `Bearer ${deletedUserToken}`)
            expect(res.status).toBe(404);
        });
    })
    // forgot-password / reset-password routes
    describe("forgot-password / reset-password", () => {
        let resetUser: IUserDocument;
        beforeAll(async () => {
            const hashedPass = await bcrypt.hash('12345678Aa', 10);
            resetUser = await User.create({
                firstName: 'reset', lastName: 'user', dateOfBirth: '2018-11-29',
                gender: 'Male', email: 'reset-me@gmail.com', password: hashedPass,
            });
        });
        afterEach(() => jest.restoreAllMocks());

        const captureResetLink = () => {
            const spy = jest.spyOn(emailUtils, "sendPasswordResetEmail").mockResolvedValue();
            return () => {
                const link = spy.mock.calls[0]?.[1] as string | undefined;
                return link ? new URL(link).searchParams.get("token")! : "";
            };
        };

        it("forgot-password 200 for a real email, and sends a usable token", async () => {
            const getToken = captureResetLink();
            const res = await request(app).post("/api/auth/forgot-password").send({ email: 'reset-me@gmail.com' });
            expect(res.status).toBe(200);
            expect(getToken()).not.toBe("");
        });

        it("forgot-password 200 for an unknown email too, without sending anything (no enumeration)", async () => {
            const spy = jest.spyOn(emailUtils, "sendPasswordResetEmail").mockResolvedValue();
            const res = await request(app).post("/api/auth/forgot-password").send({ email: 'nobody-here@gmail.com' });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("If an account exists for that email, a reset link has been sent.");
            expect(spy).not.toHaveBeenCalled();
        });

        it("reset-password 400 for a bad token", async () => {
            const res = await request(app).post("/api/auth/reset-password").send({ email: 'reset-me@gmail.com', token: 'not-the-right-token', newPassword: '12345678Bb' });
            expect(res.status).toBe(400);
        });

        it("reset-password 200 with the real token, and the new password actually works on login", async () => {
            const getToken = captureResetLink();
            await request(app).post("/api/auth/forgot-password").send({ email: 'reset-me@gmail.com' });
            const token = getToken();

            const res = await request(app).post("/api/auth/reset-password").send({ email: 'reset-me@gmail.com', token, newPassword: '12345678Bb' });
            expect(res.status).toBe(200);

            const loginRes = await request(app).post("/api/auth/login").send({ email: 'reset-me@gmail.com', password: '12345678Bb' });
            expect(loginRes.status).toBe(200);

            // the token is single-use
            const reuseRes = await request(app).post("/api/auth/reset-password").send({ email: 'reset-me@gmail.com', token, newPassword: '12345678Cc' });
            expect(reuseRes.status).toBe(400);
        });

        it("reset-password 400 for a too-short password", async () => {
            const getToken = captureResetLink();
            await request(app).post("/api/auth/forgot-password").send({ email: 'reset-me@gmail.com' });
            const token = getToken();

            const res = await request(app).post("/api/auth/reset-password").send({ email: 'reset-me@gmail.com', token, newPassword: 'short' });
            expect(res.status).toBe(400);
        });

        // regression test: forgotPassword's DB lookup used to accept a raw operator
        // object as "email" (e.g. { "$regex": "^r" }), which - unlike a plain unknown
        // string - matches a real user and triggers the (mocked) email send. The
        // response message is intentionally identical either way, but the internal
        // behavior diverging is itself an injection surface (timing side-channel, and
        // a foothold for the same query to be reused for other operators). It must now
        // be rejected the same way an unknown email is, with no lookup/send at all.
        it("forgot-password 200 for an operator-object email too, without sending anything (NoSQL injection guard)", async () => {
            const spy = jest.spyOn(emailUtils, "sendPasswordResetEmail").mockResolvedValue();
            const res = await request(app).post("/api/auth/forgot-password").send({ email: { $regex: "^r" } });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("If an account exists for that email, a reset link has been sent.");
            expect(spy).not.toHaveBeenCalled();
        });

        // regression test: resetPassword's DB lookup used to accept a raw operator
        // object as "email" or "token" before ever reaching the timing-safe hash
        // comparison. Non-string values must be rejected up front.
        it("reset-password 400 for an operator-object email/token (NoSQL injection guard)", async () => {
            const res = await request(app).post("/api/auth/reset-password").send({
                email: { $ne: null },
                token: { $ne: null },
                newPassword: '12345678Bb',
            });
            expect(res.status).toBe(400);
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
            const clearedCookies = String(res.headers["set-cookie"] ?? "");
            expect(clearedCookies).toContain("access-token=;");
            expect(clearedCookies).toContain("refresh-token=;");
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
