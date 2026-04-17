import { auth } from "@/lib/auth";
import { AuthService } from "@/lib/db/auth-service";
import { getUserDb } from "@/lib/tenant";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

function maskToken(token: string): string {
  if (!token) return "<empty>";
  if (token.length <= 12) return `${token.slice(0, 4)}...${token.slice(-2)}`;
  return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

/**
 * Resolves a tenant user id from either browser session cookies or a Bearer MCP token.
 */
export async function resolveAuthorizedUserId(
  req: Request,
): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.id) {
    console.log(`[Auth] Authorized via session user=${session.user.id}`);
    return session.user.id;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[Auth] Unauthorized: missing Bearer token and no session");
    return null;
  }

  const token = authHeader.split(" ")[1];
  console.log(`[Auth] Bearer token received: ${maskToken(token)}`);

  const decoded = AuthService.decodeTokenUnsafe(token) as any;

  // Extension Token Check
  if (decoded?.type === "extension") {
    try {
      const secret = process.env.BETTER_AUTH_SECRET || "default_secret_key";
      jwt.verify(token, secret);
      console.log(
        `[Auth] Authorized via extension token user=${decoded.userId}`,
      );
      return decoded.userId;
    } catch (e) {
      console.warn("[Auth] Unauthorized: extension token invalid", e);
      return null;
    }
  }

  const tenantId = decoded?.tenantId;
  if (!tenantId) {
    console.warn("[Auth] Unauthorized: token missing tenantId");
    return null;
  }

  try {
    console.log(`[Auth] Validating token against tenant db: ${tenantId}`);
    const db = await getUserDb(tenantId);
    const payload = await db.auth.verifyToken(token);
    if (!payload) {
      console.warn(
        `[Auth] Unauthorized: token signature invalid for tenant=${tenantId}`,
      );
      return null;
    }

    console.log(
      `[Auth] Authorized via token tenant=${tenantId}, sub=${payload.streamId || "system"}`,
    );
    return tenantId;
  } catch (error) {
    console.error(
      `[Auth] Unauthorized: token verification error for tenant=${tenantId}`,
      error,
    );
    return null;
  }
}
