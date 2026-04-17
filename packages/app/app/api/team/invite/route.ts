import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { pool } from "@/lib/db";
import { getUserTeam } from "@/lib/tenant";
import { sendTeamInviteEmail } from "@/lib/email";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { email, name } = await req.json();
  if (!email || !name) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 },
    );
  }

  const team = await getUserTeam(session.user.id);
  if (team?.role !== "owner") {
    return NextResponse.json(
      { error: "Only the team owner can invite members." },
      { status: 403 },
    );
  }
  if (team.plan !== "PAID" || !team.stripeCustomerId) {
    return NextResponse.json(
      {
        error: "A Loghead Pro subscription is required to invite team members.",
      },
      { status: 403 },
    );
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: team.stripeCustomerId,
    status: "active",
    limit: 1,
    expand: ["data.items.data.price"],
  });

  const activeSub = subscriptions.data[0] ?? null;
  if (!activeSub) {
    return NextResponse.json(
      { error: "No active subscription found." },
      { status: 403 },
    );
  }

  const totalSeats = activeSub.items.data.reduce(
    (sum, item) => sum + (item.quantity ?? 1),
    0,
  );

  // Count current team members (already accepted)
  const memberCountResult = await pool.query(
    `SELECT COUNT(*) FROM "team_member" WHERE "teamId" = $1`,
    [team.id],
  );
  const pendingCountResult = await pool.query(
    `SELECT COUNT(*) FROM "team_invite" WHERE "teamId" = $1 AND "status" = 'pending'`,
    [team.id],
  );
  const usedSeats =
    Number(memberCountResult.rows[0].count) +
    Number(pendingCountResult.rows[0].count);

  if (usedSeats >= totalSeats) {
    return NextResponse.json(
      {
        error: `You've used all ${totalSeats} seats. Upgrade your plan to invite more members.`,
      },
      { status: 403 },
    );
  }

  // Check for duplicate pending invite
  const dupResult = await pool.query(
    `SELECT id FROM "team_invite" WHERE "teamId" = $1 AND "email" = $2 AND "status" = 'pending'`,
    [team.id, email.toLowerCase()],
  );
  if (dupResult.rows.length > 0) {
    return NextResponse.json(
      { error: "An invite has already been sent to this email." },
      { status: 409 },
    );
  }

  // Also check if this email is already a team member
  const existingMember = await pool.query(
    `SELECT tm.id FROM "team_member" tm JOIN "user" u ON u.id = tm."userId"
     WHERE tm."teamId" = $1 AND LOWER(u.email) = $2`,
    [team.id, email.toLowerCase()],
  );
  if (existingMember.rows.length > 0) {
    return NextResponse.json(
      { error: "This person is already a team member." },
      { status: 409 },
    );
  }

  const inviteId = randomBytes(16).toString("hex");
  await pool.query(
    `INSERT INTO "team_invite" ("id", "ownerId", "teamId", "email", "name", "status")
     VALUES ($1, $2, $3, $4, $5, 'pending')`,
    [inviteId, session.user.id, team.id, email.toLowerCase(), name],
  );

  const appUrl = process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:3000";
  try {
    await sendTeamInviteEmail({
      to: email,
      toName: name,
      fromName: session.user.name ?? "Someone",
      appUrl: `${appUrl}/app/invite/accept?invite=${inviteId}`,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }

  return NextResponse.json({ success: true, inviteId });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { inviteId, memberId } = await req.json();

  const team = await getUserTeam(session.user.id);
  if (team?.role !== "owner") {
    return NextResponse.json(
      { error: "Only the team owner can remove members." },
      { status: 403 },
    );
  }

  if (inviteId) {
    await pool.query(
      `UPDATE "team_invite" SET "status" = 'revoked' WHERE "id" = $1 AND "teamId" = $2`,
      [inviteId, team.id],
    );
  } else if (memberId) {
    if (memberId === session.user.id) {
      return NextResponse.json(
        { error: "Owner cannot remove themselves." },
        { status: 400 },
      );
    }
    // Prevent owner from removing themselves
    await pool.query(
      `DELETE FROM "team_member" WHERE "id" = $1 AND "teamId" = $2 AND "role" != 'owner'`,
      [memberId, team.id],
    );
  }

  return NextResponse.json({ success: true });
}
