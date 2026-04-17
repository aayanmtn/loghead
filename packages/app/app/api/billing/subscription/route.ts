import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { pool } from "@/lib/db";
import { getUserTeam } from "@/lib/tenant";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const team = await getUserTeam(session.user.id);
  if (!team?.stripeCustomerId) {
    return NextResponse.json({ subscription: null, invoices: [] });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: team.stripeCustomerId,
      status: "all",
      limit: 5,
      expand: ["data.items.data.price"],
    });

    const activeSubscription = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    ) ?? subscriptions.data[0] ?? null;

    const invoices = await stripe.invoices.list({
      customer: team.stripeCustomerId,
      limit: 10,
    });

    return NextResponse.json({
      subscription: activeSubscription
        ? {
            id: activeSubscription.id,
            status: activeSubscription.status,
            billingCycleAnchor: activeSubscription.billing_cycle_anchor,
            cancelAt: activeSubscription.cancel_at,
            cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
            items: activeSubscription.items.data.map((item) => {
              const price = item.price;
              return {
                id: item.id,
                productName: null,
                priceAmount: price.unit_amount,
                priceCurrency: price.currency,
                interval: price.recurring?.interval ?? null,
                quantity: item.quantity ?? 1,
              };
            }),
          }
        : null,
      invoices: invoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amountPaid: inv.amount_paid,
        currency: inv.currency,
        created: inv.created,
        hostedInvoiceUrl: inv.hosted_invoice_url,
        periodStart: inv.period_start,
        periodEnd: inv.period_end,
      })),
    });
  } catch (e) {
    console.error("Error fetching subscription:", e);
    return new NextResponse(String(e), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { quantity } = await req.json();
  if (typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ error: "quantity must be a positive integer" }, { status: 400 });
  }

  const team = await getUserTeam(session.user.id);
  if (team?.role !== "owner") {
    return NextResponse.json({ error: "Only the team owner can update the subscription." }, { status: 403 });
  }
  if (!team?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: team.stripeCustomerId,
    status: "active",
    limit: 1,
    expand: ["data.items.data.price"],
  });

  const activeSub = subscriptions.data[0] ?? null;
  if (!activeSub) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  const item = activeSub.items.data[0];
  if (!item) {
    return NextResponse.json({ error: "No subscription item found" }, { status: 404 });
  }

  const memberCountResult = await pool.query(
    `SELECT COUNT(*) FROM "team_member" WHERE "teamId" = $1`,
    [team.id]
  );
  const usedSeats = Number(memberCountResult.rows[0].count);
  if (quantity < usedSeats) {
    return NextResponse.json(
      { error: `Cannot reduce to ${quantity} seat${quantity === 1 ? "" : "s"} — you have ${usedSeats} in use. Remove members first.` },
      { status: 409 }
    );
  }

  await stripe.subscriptions.update(activeSub.id, {
    items: [{ id: item.id, quantity }],
    proration_behavior: "always_invoice",
  });

  return NextResponse.json({ success: true });
}
