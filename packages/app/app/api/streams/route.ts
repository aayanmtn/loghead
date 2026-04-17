import { resolveAuthorizedUserId } from "@/lib/api-auth";
import { getUserDb } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userId = await resolveAuthorizedUserId(req);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return new NextResponse("Missing projectId", { status: 400 });
  }

  try {
    const db = await getUserDb(userId);
    const streams = await db.listStreams(projectId);
    return NextResponse.json(streams);
  } catch (e) {
    console.error("Error listing streams:", e);
    return new NextResponse(String(e), { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await resolveAuthorizedUserId(req);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, type, name, config } = body;

    if (!projectId || !type || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const db = await getUserDb(userId);
    const stream = await db.createStream(projectId, type, name, config || {});
    return NextResponse.json(stream);
  } catch (e) {
    console.error("Error creating stream:", e);
    return new NextResponse(String(e), { status: 500 });
  }
}
