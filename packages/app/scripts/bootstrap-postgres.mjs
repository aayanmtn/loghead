import dotenv from "dotenv";
import { Pool } from "pg";
import path from "path";

const cwd = process.cwd();

dotenv.config({ path: path.join(cwd, ".env.local") });
dotenv.config({ path: path.join(cwd, ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

async function ensureColumn(client, tableName, columnName, definition) {
  const result = await client.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
    `,
    [tableName, columnName],
  );

  if (result.rowCount === 0) {
    await client.query(`ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${definition}`);
  }
}

async function ensureIndex(client, indexName, sql) {
  const result = await client.query(
    `
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname = $1
      LIMIT 1
    `,
    [indexName],
  );

  if (result.rowCount === 0) {
    await client.query(sql);
  }
}

async function main() {
  const client = await pool.connect();

  try {
    console.log("[db] Bootstrapping app schema...");
    await client.query("BEGIN");
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

    await ensureColumn(client, "user", "tursoDbUrl", "text");
    await ensureColumn(client, "user", "tursoAuthToken", "text");
    await ensureColumn(client, "user", "plan", "text");

    await client.query(`UPDATE "user" SET "plan" = 'free' WHERE "plan" IS NULL`);
    await client.query(`ALTER TABLE "user" ALTER COLUMN "plan" SET DEFAULT 'free'`);
    await client.query(`ALTER TABLE "user" ALTER COLUMN "plan" SET NOT NULL`);
    await client.query(`ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_plan_check"`);
    await client.query(
      `ALTER TABLE "user" ADD CONSTRAINT "user_plan_check" CHECK ("plan" IN ('free', 'paid'))`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS "team" (
        "id" text NOT NULL PRIMARY KEY,
        "name" text NOT NULL,
        "ownerId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
        "plan" text NOT NULL DEFAULT 'FREE',
        "stripeCustomerId" text,
        "stripeSubscriptionId" text,
        "tursoDbUrl" text,
        "tursoAuthToken" text,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await ensureIndex(
      client,
      "team_ownerId_idx",
      `CREATE UNIQUE INDEX "team_ownerId_idx" ON "team" ("ownerId")`,
    );
    await ensureIndex(
      client,
      "team_stripeCustomerId_idx",
      `CREATE INDEX "team_stripeCustomerId_idx" ON "team" ("stripeCustomerId")`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS "team_member" (
        "id" text NOT NULL PRIMARY KEY,
        "teamId" text NOT NULL REFERENCES "team" ("id") ON DELETE CASCADE,
        "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
        "role" text NOT NULL DEFAULT 'member',
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("teamId", "userId")
      )
    `);

    await ensureIndex(
      client,
      "team_member_userId_idx",
      `CREATE INDEX "team_member_userId_idx" ON "team_member" ("userId")`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS "team_invite" (
        "id" text NOT NULL PRIMARY KEY,
        "ownerId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
        "email" text NOT NULL,
        "name" text NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "acceptedUserId" text REFERENCES "user" ("id") ON DELETE SET NULL,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await ensureColumn(
      client,
      "team_invite",
      "teamId",
      `text REFERENCES "team" ("id") ON DELETE CASCADE`,
    );

    await ensureIndex(
      client,
      "team_invite_ownerId_idx",
      `CREATE INDEX "team_invite_ownerId_idx" ON "team_invite" ("ownerId")`,
    );
    await ensureIndex(
      client,
      "team_invite_teamId_idx",
      `CREATE INDEX "team_invite_teamId_idx" ON "team_invite" ("teamId")`,
    );

    await client.query(`
      INSERT INTO "team" (
        "id",
        "name",
        "ownerId",
        "plan",
        "stripeCustomerId",
        "stripeSubscriptionId",
        "tursoDbUrl",
        "tursoAuthToken",
        "createdAt",
        "updatedAt"
      )
      SELECT
        gen_random_uuid()::text,
        COALESCE(NULLIF(u."name", ''), u."email") || '''s Team',
        u."id",
        CASE
          WHEN LOWER(COALESCE(u."plan", 'free')) = 'paid' THEN 'PAID'
          ELSE 'FREE'
        END,
        NULL,
        NULL,
        u."tursoDbUrl",
        u."tursoAuthToken",
        u."createdAt",
        u."updatedAt"
      FROM "user" u
      LEFT JOIN "team" t ON t."ownerId" = u."id"
      WHERE t."id" IS NULL
      ON CONFLICT DO NOTHING
    `);

    await client.query(`
      INSERT INTO "team_member" ("id", "teamId", "userId", "role", "createdAt")
      SELECT
        gen_random_uuid()::text,
        t."id",
        t."ownerId",
        'owner',
        t."createdAt"
      FROM "team" t
      LEFT JOIN "team_member" tm
        ON tm."teamId" = t."id"
       AND tm."userId" = t."ownerId"
      WHERE tm."id" IS NULL
      ON CONFLICT ("teamId", "userId") DO NOTHING
    `);

    await client.query(`
      UPDATE "team_invite" ti
      SET "teamId" = t."id"
      FROM "team" t
      WHERE ti."teamId" IS NULL
        AND t."ownerId" = ti."ownerId"
    `);

    await client.query(`
      INSERT INTO "team_member" ("id", "teamId", "userId", "role")
      SELECT
        gen_random_uuid()::text,
        ti."teamId",
        ti."acceptedUserId",
        'member'
      FROM "team_invite" ti
      WHERE ti."status" = 'accepted'
        AND ti."acceptedUserId" IS NOT NULL
        AND ti."teamId" IS NOT NULL
      ON CONFLICT ("teamId", "userId") DO NOTHING
    `);

    await client.query("COMMIT");
    console.log("[db] App schema bootstrap complete.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[db] App schema bootstrap failed:", error);
  process.exit(1);
});
