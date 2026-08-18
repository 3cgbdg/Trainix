import { Request, Response } from "express";
import Stripe from "stripe";
import User from "../models/User";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getStripeClient } from "../utils/stripe";

// starts (or resumes) a subscription checkout for the signed-in user
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!process.env.STRIPE_PRICE_ID_PREMIUM) {
            res.status(503).json({ message: "Billing is not configured yet." });
            return;
        }
        const stripe = getStripeClient();
        const userId = (req as AuthRequest).userId;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User was not found!" });
            return;
        }

        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                metadata: { userId: String(user._id) },
            });
            customerId = customer.id;
            user.stripeCustomerId = customerId;
            await user.save();
        }

        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: customerId,
            line_items: [{ price: process.env.STRIPE_PRICE_ID_PREMIUM, quantity: 1 }],
            success_url: `${frontendUrl}/profile?checkout=success`,
            cancel_url: `${frontendUrl}/profile?checkout=cancelled`,
            client_reference_id: String(user._id),
        });

        res.status(200).json({ url: session.url });
        return;
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// lets a subscribed user manage or cancel their subscription via Stripe's
// hosted billing portal instead of us re-building that UI
export const createPortalSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const stripe = getStripeClient();
        const user = await User.findById((req as AuthRequest).userId);
        if (!user?.stripeCustomerId) {
            res.status(404).json({ message: "No billing account found for this user." });
            return;
        }
        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${frontendUrl}/profile`,
        });
        res.status(200).json({ url: session.url });
        return;
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error!" });
        return;
    }
}

// applies a subscription's current status/tier to the user it belongs to,
// looked up by the Stripe customer id every webhook event carries
async function syncSubscription(subscription: Stripe.Subscription) {
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const isActive = subscription.status === "active" || subscription.status === "trialing";
    await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionTier: isActive ? "premium" : "free",
        },
    );
}

// Stripe calls this directly (no auth cookie) -- authenticity comes from the
// signature check against the raw body, not from authMiddleware
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["stripe-signature"];
    if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
        res.status(400).json({ message: "Webhook is not configured." });
        return;
    }
    let event: Stripe.Event;
    try {
        const stripe = getStripeClient();
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Stripe webhook signature verification failed:", err);
        res.status(400).json({ message: "Invalid signature" });
        return;
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.subscription) {
                    const stripe = getStripeClient();
                    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    await syncSubscription(subscription);
                }
                break;
            }
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                await syncSubscription(subscription);
                break;
            }
            default:
                break;
        }
        res.status(200).json({ received: true });
        return;
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error!" });
        return;
    }
}
