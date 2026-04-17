import { resolveAuthorizedUserId } from "@/lib/api-auth";
import { getUserDb } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userId = await resolveAuthorizedUserId(req);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const db = await getUserDb(userId);
    const projects = await db.listProjects();
    return NextResponse.json(projects);
  } catch (e) {
    console.error("Error listing projects:", e);
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
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const db = await getUserDb(userId);
    const project = await db.createProject(name);
    return NextResponse.json(project);
  } catch (e) {
    console.error("Error creating project:", e);
    return new NextResponse(String(e), { status: 500 });
  }
}
