import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { pool } from "@/lib/db";
import { getUserTeam } from "@/lib/tenant";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const team = await getUserTeam(session.user.id);
  if (!team) {
    return NextResponse.json({ totalSeats: 0, hasPro: false, invites: [], members: [] });
  }

  let totalSeats = 0;
  if (team.plan === "PAID" && team.stripeCustomerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: team.stripeCustomerId,
        status: "active",
        limit: 1,
        expand: ["data.items.data.price"],
      });
      const activeSub = subscriptions.data[0] ?? null;
      if (activeSub) {
        totalSeats = activeSub.items.data.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0);
      }
    } catch (e) {
      console.error("Error fetching subscription for team members:", e);
    }
  }

  // All active team members with their user profile
  const membersResult = await pool.query(
    `SELECT tm."id", tm."role", u."id" as "userId", u."name", u."email", u."image"
     FROM "team_member" tm
     JOIN "user" u ON u."id" = tm."userId"
     WHERE tm."teamId" = $1
     ORDER BY CASE WHEN tm."role" = 'owner' THEN 0 ELSE 1 END, tm."createdAt" ASC`,
    [team.id]
  );

  // Pending invites only (accepted ones are already team_members)
  const invitesResult = await pool.query(
    `SELECT "id", "email", "name", "status", "createdAt"
     FROM "team_invite"
     WHERE "teamId" = $1 AND "status" = 'pending'
     ORDER BY "createdAt" ASC`,
    [team.id]
  );

  return NextResponse.json({
    teamId: team.id,
    teamName: team.name,
    userRole: team.role,
    totalSeats,
    hasPro: team.plan === "PAID",
    members: membersResult.rows,
    invites: invitesResult.rows,
  });
}
