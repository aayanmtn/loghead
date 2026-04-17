import Stripe from "stripe";

// Validated at runtime — avoids failing at build time when env vars aren't baked in
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-01-28.clover",
});
