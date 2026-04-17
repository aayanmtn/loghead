import { AuthService } from "@/lib/db/auth-service";
import { getUserDb } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log(`[API] POST /api/ingest received`);
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[API] /api/ingest Unauthorized: Missing token");
      return new NextResponse("Unauthorized: Missing token", { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 1. Decode token (unsafe) to get tenantId (userId)
    const decoded = AuthService.decodeTokenUnsafe(token);

    if (!decoded || !decoded.sub) {
      console.warn("[API] /api/ingest Invalid token structure");
      return new NextResponse("Unauthorized: Invalid token", { status: 401 });
    }

    const tenantId = decoded.tenantId;

    // If no tenantId in token, we can't route to the correct DB.
    if (!tenantId) {
      console.warn("[API] /api/ingest Token missing tenantId");
      return new NextResponse("Unauthorized: Token missing tenantId", {
        status: 401,
      });
    }

    // 2. Get the correct DB for the tenant
    const db = await getUserDb(tenantId);

    // 3. Verify token using the tenant's DB secret
    // Note: DbService exposes auth, so we can use it.
    const payload = await db.auth.verifyToken(token);

    if (!payload || !payload.streamId) {
      console.warn("[API] /api/ingest Unauthorized: Invalid token signature");
      return new NextResponse("Unauthorized: Invalid token", { status: 401 });
    }

    const { streamId, logs } = await req.json();
    console.log(`[API] Ingesting logs for stream: ${streamId}`);

    if (payload.role !== "admin" && streamId !== payload.streamId) {
      console.warn(
        `[API] /api/ingest Forbidden: Token streamId ${payload.streamId} != body streamId ${streamId}`,
      );
      return new NextResponse("Forbidden: Token does not match streamId", {
        status: 403,
      });
    }

    if (!logs) {
      console.warn("[API] /api/ingest Missing logs");
      return new NextResponse("Missing logs", { status: 400 });
    }

    const logEntries = Array.isArray(logs) ? logs : [logs];
    console.log(`[API] Processing ${logEntries.length} log entries`);

    for (const log of logEntries) {
      let content = "";
      let metadata = {};

      if (typeof log === "string") {
        content = log;
      } else if (typeof log === "object") {
        content = log.content || JSON.stringify(log);
        metadata = log.metadata || {};
      }

      if (content) {
        await db.addLog(streamId, content, metadata);
      }
    }

    console.log(
      `[API] /api/ingest Successfully added ${logEntries.length} logs`,
    );
    return NextResponse.json({ success: true, count: logEntries.length });
  } catch (e) {
    console.error("Ingest error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
