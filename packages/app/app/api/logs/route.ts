import { resolveAuthorizedUserId } from "@/lib/api-auth";
import { getUserDb } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userId = await resolveAuthorizedUserId(req);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get("streamId");

  if (!streamId) {
    return new NextResponse("Missing streamId", { status: 400 });
  }

  // Pagination
  let page = parseInt(searchParams.get("page") || "1");
  if (page < 1) page = 1;

  let pageSize = parseInt(searchParams.get("pageSize") || "100");
  let limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : pageSize;

  if (limit > 1000) limit = 1000;

  const offset = (page - 1) * limit;
  const query = searchParams.get("q");

  try {
    const db = await getUserDb(userId);
    let logs;
    if (query) {
      logs = await db.searchLogs(streamId, query, limit);
    } else {
      logs = await db.getRecentLogs(streamId, limit, offset);
    }
    return NextResponse.json(logs);
  } catch (e) {
    console.error("Error fetching logs:", e);
    return new NextResponse(String(e), { status: 500 });
  }
}
