import Stripe from "stripe";

let client: Stripe | null = null;

// created lazily (not at module scope) so it always reads STRIPE_SECRET_KEY
// after dotenv has actually populated process.env
export function getStripeClient(): Stripe {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    if (!client) {
        client = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return client;
}
