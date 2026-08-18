import request from "supertest"
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import User, { IUserDocument } from "../models/User";

// mocking the stripe SDK so tests never hit the real network
const mockCustomersCreate = jest.fn();
const mockCheckoutSessionsCreate = jest.fn();
const mockBillingPortalSessionsCreate = jest.fn();
const mockSubscriptionsRetrieve = jest.fn();
const mockWebhooksConstructEvent = jest.fn();

jest.mock("stripe", () => {
    return jest.fn().mockImplementation(() => ({
        customers: { create: mockCustomersCreate },
        checkout: { sessions: { create: mockCheckoutSessionsCreate } },
        billingPortal: { sessions: { create: mockBillingPortalSessionsCreate } },
        subscriptions: { retrieve: mockSubscriptionsRetrieve },
        webhooks: { constructEvent: mockWebhooksConstructEvent },
    }));
});

// imported after the mock so the controller picks up the mocked module
import { app } from "../app"

describe("billing api", () => {
    let mongo: MongoMemoryServer;
    let accessToken: string;
    let user: IUserDocument;

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        const hashedPass = await bcrypt.hash('12345678Aa', 10);
        user = await User.create({
            firstName: 'billing', lastName: 'user', dateOfBirth: '2018-11-29',
            gender: 'Male', email: 'billing@gmail.com', password: hashedPass,
        });
        accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
        process.env.STRIPE_SECRET_KEY = "sk_test_fake";
        process.env.STRIPE_PRICE_ID_PREMIUM = "price_fake";
        process.env.STRIPE_WEBHOOK_SECRET = "whsec_fake";
    });

    afterEach(() => jest.clearAllMocks());

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
        await mongo.stop();
        delete process.env.STRIPE_SECRET_KEY;
        delete process.env.STRIPE_PRICE_ID_PREMIUM;
        delete process.env.STRIPE_WEBHOOK_SECRET;
    });

    describe("checkout", () => {
        it("401 when not authenticated", async () => {
            const res = await request(app).post("/api/billing/checkout");
            expect(res.status).toBe(401);
        });

        it("creates a Stripe customer on first checkout and returns the session url", async () => {
            mockCustomersCreate.mockResolvedValueOnce({ id: "cus_123" });
            mockCheckoutSessionsCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.com/session_abc" });

            const res = await request(app).post("/api/billing/checkout")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.url).toBe("https://checkout.stripe.com/session_abc");
            expect(mockCustomersCreate).toHaveBeenCalledTimes(1);
            const updatedUser = await User.findById(user._id);
            expect(updatedUser!.stripeCustomerId).toBe("cus_123");
        });

        it("reuses the existing Stripe customer on a later checkout", async () => {
            mockCheckoutSessionsCreate.mockResolvedValueOnce({ url: "https://checkout.stripe.com/session_def" });

            const res = await request(app).post("/api/billing/checkout")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(mockCustomersCreate).not.toHaveBeenCalled();
        });

        it("503 when billing is not configured", async () => {
            const priceId = process.env.STRIPE_PRICE_ID_PREMIUM;
            delete process.env.STRIPE_PRICE_ID_PREMIUM;
            const res = await request(app).post("/api/billing/checkout")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`);
            expect(res.status).toBe(503);
            process.env.STRIPE_PRICE_ID_PREMIUM = priceId;
        });
    });

    describe("portal", () => {
        it("404 when the user has no billing account yet", async () => {
            const hashedPass = await bcrypt.hash('12345678Aa', 10);
            const freshUser = await User.create({
                firstName: 'no', lastName: 'billing', dateOfBirth: '2018-11-29',
                gender: 'Male', email: 'no-billing@gmail.com', password: hashedPass,
            });
            const freshToken = jwt.sign({ userId: freshUser._id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
            const res = await request(app).post("/api/billing/portal")
                .set("Cookie", `access-token=${freshToken}`)
                .set("Authorization", `Bearer ${freshToken}`);
            expect(res.status).toBe(404);
        });

        it("200 with a portal url for an existing billing customer", async () => {
            mockBillingPortalSessionsCreate.mockResolvedValueOnce({ url: "https://billing.stripe.com/portal_abc" });
            const res = await request(app).post("/api/billing/portal")
                .set("Cookie", `access-token=${accessToken}`)
                .set("Authorization", `Bearer ${accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body.url).toBe("https://billing.stripe.com/portal_abc");
        });
    });

    describe("webhook", () => {
        it("400 on a bad signature", async () => {
            mockWebhooksConstructEvent.mockImplementationOnce(() => { throw new Error("bad signature"); });
            const res = await request(app).post("/api/billing/webhook")
                .set("stripe-signature", "invalid")
                .send({});
            expect(res.status).toBe(400);
        });

        it("activates premium on checkout.session.completed", async () => {
            mockWebhooksConstructEvent.mockReturnValueOnce({
                type: "checkout.session.completed",
                data: { object: { subscription: "sub_123" } },
            });
            mockSubscriptionsRetrieve.mockResolvedValueOnce({
                id: "sub_123", status: "active", customer: "cus_123",
            });

            const res = await request(app).post("/api/billing/webhook")
                .set("stripe-signature", "valid")
                .send({});

            expect(res.status).toBe(200);
            const updatedUser = await User.findById(user._id);
            expect(updatedUser!.subscriptionTier).toBe("premium");
            expect(updatedUser!.subscriptionStatus).toBe("active");
        });

        it("reverts to free on customer.subscription.deleted", async () => {
            mockWebhooksConstructEvent.mockReturnValueOnce({
                type: "customer.subscription.deleted",
                data: { object: { id: "sub_123", status: "canceled", customer: "cus_123" } },
            });

            const res = await request(app).post("/api/billing/webhook")
                .set("stripe-signature", "valid")
                .send({});

            expect(res.status).toBe(200);
            const updatedUser = await User.findById(user._id);
            expect(updatedUser!.subscriptionTier).toBe("free");
            expect(updatedUser!.subscriptionStatus).toBe("canceled");
        });
    });
});
