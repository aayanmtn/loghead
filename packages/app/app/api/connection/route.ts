import { auth } from "@/lib/auth";
import { getUserDb } from "@/lib/tenant";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const db = await getUserDb(session.user.id);

    // Ensure token is scoped to the current tenant database.
    db.auth.setTenantId(session.user.id);
    const token = await db.auth.getOrCreateMcpToken();
    const mcpUrl = new URL("/sse", req.url).toString();

    return NextResponse.json({
      token,
      mcpUrl,
    });
  } catch (e) {
    console.error("Error getting connection info:", e);
    return new NextResponse(String(e), { status: 500 });
  }
}
