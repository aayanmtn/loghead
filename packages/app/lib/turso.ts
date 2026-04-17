import { createClient } from "@libsql/client";
import { LibSqlClientAdapter } from "./db/libsql-client-adapter";
import { DbService } from "./db/db-service";
import { AuthService } from "./db/auth-service";
import { OllamaService } from "./db/ollama-service";
import { migrate } from "./db/migrate";

// Cache instances to avoid creating too many connections
// Key is url+token
const instances = new Map<string, DbService>();

export async function getDb(url: string, authToken: string): Promise<DbService> {
    const key = `${url}|${authToken}`;

    if (instances.has(key)) {
        return instances.get(key)!;
    }

    const client = createClient({
        url,
        authToken,
    });

    const adapter = new LibSqlClientAdapter(client);

    // Ensure DB is migrated
    try {
        await migrate(adapter, false); // verbose=false to reduce noise
    } catch (e) {
        console.error("Failed to migrate database:", e);
        // Continue anyway? Or throw?
        // If basic tables fail, the app won't work.
    }

    const authService = new AuthService(adapter);
    // TODO: Configure Ollama URL via env if needed, or pass in
    const ollamaService = new OllamaService();

    const dbService = new DbService(adapter, authService, ollamaService);

    instances.set(key, dbService);
    return dbService;
}

export async function getSystemDb(): Promise<DbService> {
    const url = process.env.TURSO_DATABASE_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
        throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set for system DB");
    }

    return getDb(url, token);
}
