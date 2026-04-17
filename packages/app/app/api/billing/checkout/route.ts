import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { pool } from "@/lib/db";
import { getUserTeam } from "@/lib/tenant";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { priceId } = await req.json();
  if (!priceId) {
    return new NextResponse("priceId is required", { status: 400 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  const baseUrl = process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:3000";

  // Get or create the user's team
  let team = await getUserTeam(userId);

  if (!team) {
    // Create a team for this user on first checkout
    const teamId = randomBytes(16).toString("hex");
    await pool.query(
      `INSERT INTO "team" ("id", "name", "ownerId") VALUES ($1, $2, $3)`,
      [teamId, `${session.user.name ?? userEmail}'s Team`, userId]
    );
    await pool.query(
      `INSERT INTO "team_member" ("id", "teamId", "userId", "role") VALUES ($1, $2, $3, 'owner')`,
      [randomBytes(16).toString("hex"), teamId, userId]
    );
    team = await getUserTeam(userId);
  }

  if (team?.role !== "owner") {
    return NextResponse.json({ error: "Only the team owner can manage billing." }, { status: 403 });
  }

  let customerId: string | null = team.stripeCustomerId ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { teamId: team.id, userId },
    });
    customerId = customer.id;
    await pool.query(
      `UPDATE "team" SET "stripeCustomerId" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
      [customerId, team.id]
    );
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1, adjustable_quantity: { enabled: true, minimum: 1 } }],
    success_url: `${baseUrl}/app?billing=success`,
    cancel_url: `${baseUrl}/app?billing=cancelled`,
    metadata: { teamId: team.id, userId },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
