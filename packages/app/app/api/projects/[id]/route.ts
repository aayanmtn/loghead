import { resolveAuthorizedUserId } from "@/lib/api-auth";
import { getUserDb } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await resolveAuthorizedUserId(req);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const db = await getUserDb(userId);
    await db.deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting project:", e);
    return new NextResponse(String(e), { status: 500 });
  }
}
