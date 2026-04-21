import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
import { pool } from "@/lib/db";
import type { NextRequest } from "next/server";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

export const POST = async (req: NextRequest) => {
  const url = new URL(req.url);

  if (url.pathname.endsWith("/api/auth/sign-up/email")) {
    try {
      const clone = req.clone();
      const body = await clone.json();

      if (body?.email) {
        const email = body.email.toLowerCase();
        const res = await pool.query('SELECT id FROM "user" WHERE email = $1', [
          email,
        ]);

        if (res.rowCount && res.rowCount > 0) {
          return new Response(
            JSON.stringify({
              message: "An account with this email already exists",
              code: "EMAIL_ALREADY_EXISTS",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }
    } catch (e) {
      // Ignored: let better-auth handle it
    }
  }

  return handler.POST(req);
};
