import { auth } from "@/lib/auth";
import { getUserTeam } from "@/lib/tenant";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const callback = searchParams.get("callback");

  if (!callback || !callback.startsWith("vscode://onvoai.loghead")) {
    return new NextResponse(
      "Invalid callback URL. Must start with vscode://onvoai.loghead",
      { status: 400 },
    );
  }

  // 2. Validate Session
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    // Redirect to login
    const loginUrl = new URL("/app/auth/login", req.url);
    // Use the full current URL as the callback destination
    const currentUrl = new URL(req.url);
    loginUrl.searchParams.set("callbackURL", currentUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // 3. Team Safety Check
  const team = await getUserTeam(session.user.id);
  if (!team) {
    return new NextResponse(
      "User does not belong to a team. Please contact support.",
      { status: 403 },
    );
  }

  // 4. Generate Extension Token
  const secret = process.env.BETTER_AUTH_SECRET || "default_secret_key";
  const payload = {
    userId: session.user.id,
    teamId: team.id,
    role: team.role,
    type: "extension",
    iss: "loghead-cloud",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  };

  const token = jwt.sign(payload, secret);

  // 5. Redirect to VS Code
  // Handle URL construction carefully for custom protocols
  const separator = callback.includes("?") ? "&" : "?";
  const finalUrl = `${callback}${separator}token=${token}`;

  return NextResponse.redirect(finalUrl);
}
