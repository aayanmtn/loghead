import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { pool } from "@/lib/db";
import { provisionDatabase } from "@/lib/provision";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

if (!process.env.BETTER_AUTH_BASE_URL) {
  throw new Error("BETTER_AUTH_BASE_URL is not set");
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:3000",
    // "http://127.0.0.1:3000",
  ],

  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    max: 5,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, url });
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },

  session: {
    cookieCache: { enabled: false },
  },

  secret: process.env.BETTER_AUTH_SECRET || "default_secret_key",

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // No invites — create a personal team and provision their Turso DB
          const teamId = randomBytes(16).toString("hex");
          const memberId = randomBytes(16).toString("hex");

          await pool.query(
            `INSERT INTO "team" ("id", "name", "ownerId") VALUES ($1, $2, $3)`,
            [teamId, `${user.name ?? user.email}'s Team`, user.id],
          );
          await pool.query(
            `INSERT INTO "team_member" ("id", "teamId", "userId", "role") VALUES ($1, $2, $3, 'owner')`,
            [memberId, teamId, user.id],
          );

          // Provision Turso DB asynchronously (don't block sign-up if it fails)
          provisionDatabase(teamId)
            .then(({ dbUrl, authToken }) =>
              pool.query(
                `UPDATE "team" SET "tursoDbUrl" = $1, "tursoAuthToken" = $2, "updatedAt" = NOW() WHERE "id" = $3`,
                [dbUrl, authToken, teamId],
              ),
            )
            .catch((e) =>
              console.error("Failed to provision team DB on sign-up:", e),
            );
        },
      },
    },
  },
});
