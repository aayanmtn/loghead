import { stripe } from "@/lib/stripe";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return new NextResponse("Webhook Error: Invalid signature", { status: 400 });
    }
  } else {
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return new NextResponse("Invalid JSON", { status: 400 });
    }
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const teamId = session.metadata?.teamId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (teamId && subscriptionId) {
          await pool.query(
            `UPDATE "team" SET "stripeCustomerId" = $1, "stripeSubscriptionId" = $2, "plan" = 'PAID', "updatedAt" = NOW() WHERE "id" = $3`,
            [customerId, subscriptionId, teamId]
          );
          console.log(`[Stripe] Team ${teamId} upgraded to PAID`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const isActive = subscription.status === "active" || subscription.status === "trialing";

        await pool.query(
          `UPDATE "team" SET "stripeSubscriptionId" = $1, "plan" = $2, "updatedAt" = NOW() WHERE "stripeCustomerId" = $3`,
          [subscription.id, isActive ? "PAID" : "FREE", customerId]
        );
        console.log(`[Stripe] Subscription ${subscription.id} updated to ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await pool.query(
          `UPDATE "team" SET "stripeSubscriptionId" = NULL, "plan" = 'FREE', "updatedAt" = NOW() WHERE "stripeCustomerId" = $1`,
          [customerId]
        );
        console.log(`[Stripe] Subscription ${subscription.id} cancelled`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.warn(`[Stripe] Payment failed for customer ${customerId}`);
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
  } catch (e) {
    console.error("[Stripe] Webhook handler error:", e);
    return new NextResponse("Internal error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
