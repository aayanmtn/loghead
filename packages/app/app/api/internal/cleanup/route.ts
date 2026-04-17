import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUserDb } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  // 🔐 1. Verify secret
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Parse 'days' from query param, default to 3
    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days");
    const days = daysParam ? parseFloat(daysParam) : 3;

    // 2️⃣ Fetch FREE users
    const result = await pool.query(`
      SELECT id FROM "user"
      WHERE plan = 'FREE'
    `);

    console.log(`Found ${result.rows.length} FREE users for log cleanup`);

    for (const user of result.rows) {
      try {
        const db = await getUserDb(user.id);
        await db.cleanupOldLogs(days);
        console.log(
          `Cleaned logs for FREE user ${user.id} (retention: ${days} days)`,
        );
      } catch (err) {
        console.error(`Cleanup failed for ${user.id}`, err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Global cleanup failed:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
