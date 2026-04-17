import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { inviteId } = await req.json();

  if (!inviteId) {
    return NextResponse.json(
      { error: "Invite ID is required" },
      { status: 400 },
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Fetch invite
    const inviteResult = await client.query(
      `SELECT * FROM "team_invite" WHERE "id" = $1`,
      [inviteId],
    );

    const invite = inviteResult.rows[0];

    if (!invite) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // 2. Validate status
    if (invite.status === "accepted") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Invite already accepted" },
        { status: 409 },
      );
    }

    if (invite.status !== "pending") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Invite is no longer valid" },
        { status: 400 },
      );
    }

    // 3. Validate email match (case-insensitive)
    if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "This invite was sent to a different email address" },
        { status: 403 },
      );
    }

    // 4. Add user to team
    const memberId = randomBytes(16).toString("hex");

    // Check if already member
    const existingMember = await client.query(
      `SELECT * FROM "team_member" WHERE "teamId" = $1 AND "userId" = $2`,
      [invite.teamId, session.user.id],
    );

    if (existingMember.rows.length === 0) {
      await client.query(
        `INSERT INTO "team_member" ("id", "teamId", "userId", "role")
         VALUES ($1, $2, $3, 'member')`,
        [memberId, invite.teamId, session.user.id],
      );
    }

    // 5. Update invite status
    await client.query(
      `UPDATE "team_invite"
       SET "status" = 'accepted', "acceptedUserId" = $1
       WHERE "id" = $2`,
      [session.user.id, inviteId],
    );

    await client.query("COMMIT");

    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to accept invite:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
