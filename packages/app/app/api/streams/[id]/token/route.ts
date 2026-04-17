import { resolveAuthorizedUserId } from "@/lib/api-auth";
import { getUserDb } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(
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

    // Set tenant ID for token generation
    db.auth.setTenantId(userId);

    // Create the token
    const token = await db.auth.createStreamToken(id);

    return NextResponse.json({ token });

  } catch (e) {
    console.error("Error getting stream token:", e);
    return new NextResponse(String(e), { status: 500 });
  }
}
