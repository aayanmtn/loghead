import { pool } from "./db";
import { getDb } from "./turso";
import { DbService } from "./db/db-service";
import { provisionDatabase } from "./provision";

/**
 * Resolves the team for a given user (either their own team or a team they're a member of),
 * then returns a DbService connected to the team owner's Turso database.
 */
export async function getUserDb(userId: string): Promise<DbService> {
  // Prefer a shared team (member count > 1) over a solo personal team.
  // If the user only has a solo team, use that.
  const result = await pool.query(
    `SELECT t."id" as "teamId", t."ownerId", t."tursoDbUrl", t."tursoAuthToken",
            (SELECT count(*) FROM "team_member" tm2 WHERE tm2."teamId" = t."id") as "memberCount"
     FROM "team_member" tm
     JOIN "team" t ON t."id" = tm."teamId"
     WHERE tm."userId" = $1
     ORDER BY
       (SELECT count(*) FROM "team_member" tm2 WHERE tm2."teamId" = t."id") DESC,
       CASE WHEN tm."role" = 'owner' THEN 0 ELSE 1 END
     LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User has no team");
  }

  const team = result.rows[0];
  let { tursoDbUrl, tursoAuthToken, teamId } = team;

  if (!tursoDbUrl || !tursoAuthToken) {
    console.log(`Provisioning database for team ${teamId}...`);
    try {
      const provisioned = await provisionDatabase(teamId);
      tursoDbUrl = provisioned.dbUrl;
      tursoAuthToken = provisioned.authToken;

      await pool.query(
        `UPDATE "team" SET "tursoDbUrl" = $1, "tursoAuthToken" = $2, "updatedAt" = NOW() WHERE "id" = $3`,
        [tursoDbUrl, tursoAuthToken, teamId]
      );
    } catch (e) {
      console.error("Failed to provision team database:", e);
      throw new Error("Failed to provision team database");
    }
  }

  return getDb(tursoDbUrl, tursoAuthToken);
}

/**
 * Returns the team the user belongs to, with full team data.
 * Prefers shared teams (more members) over solo personal teams.
 */
export async function getUserTeam(userId: string) {
  const result = await pool.query(
    `SELECT t.*, tm."role"
     FROM "team_member" tm
     JOIN "team" t ON t."id" = tm."teamId"
     WHERE tm."userId" = $1
     ORDER BY
       (SELECT count(*) FROM "team_member" tm2 WHERE tm2."teamId" = t."id") DESC,
       CASE WHEN tm."role" = 'owner' THEN 0 ELSE 1 END
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] ?? null;
}
