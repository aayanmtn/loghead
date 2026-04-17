import { pool } from "./db";

const TURSO_API_URL = "https://api.turso.tech/v1";

interface ProvisionResult {
  dbUrl: string;
  authToken: string;
}

export async function provisionDatabase(userId: string): Promise<ProvisionResult> {
  const apiToken = process.env.TURSO_API_TOKEN;
  const orgSlug = process.env.TURSO_ORG_SLUG;
  const group = process.env.TURSO_GROUP || "default";

  if (!apiToken || !orgSlug) {
    throw new Error("TURSO_API_TOKEN and TURSO_ORG_SLUG are required for database provisioning");
  }

  // Check if token is a database token (has 'rid' claim) instead of platform token
  try {
    const parts = apiToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      if (payload.rid) {
        console.error("TURSO_API_TOKEN appears to be a Database Token (contains 'rid'). A Platform API Token is required to create databases.");
        throw new Error("Invalid TURSO_API_TOKEN: You are using a Database Token. Please generate a Platform API Token using 'turso auth api-tokens mint <name>'.");
      }
    }
  } catch (e) {
    // Ignore parsing errors, let the API call fail naturally if token is invalid junk
    if (e instanceof Error && e.message.includes("Invalid TURSO_API_TOKEN")) {
      throw e;
    }
  }

  const dbName = `user-${userId.toLowerCase().replace(/[^a-z0-9-]/g, "")}-${Date.now().toString(36)}`;

  console.log(`Provisioning Turso database: ${dbName} for user: ${userId}`);

  // 1. Create Database
  const createRes = await fetch(`${TURSO_API_URL}/organizations/${orgSlug}/databases`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: dbName,
      group: group,
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Turso database: ${createRes.statusText} - ${errorText}`);
  }

  const createData = await createRes.json();
  const hostname = createData.database.Hostname;
  const dbUrl = `libsql://${hostname}`;

  console.log(`Database created: ${dbUrl}`);

  // 2. Create Auth Token
  // We can create a token specifically for this database
  // OR we can use the group token if we have one (but we want to issue a fresh token for the user?)
  // Generally, we should issue a token for this specific database.

  const tokenRes = await fetch(`${TURSO_API_URL}/organizations/${orgSlug}/databases/${dbName}/auth/tokens`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
    },
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    throw new Error(`Failed to create Turso auth token: ${tokenRes.statusText} - ${errorText}`);
  }

  const tokenData = await tokenRes.json();
  const authToken = tokenData.jwt;

  console.log("Auth token created");

  return {
    dbUrl,
    authToken,
  };
}
