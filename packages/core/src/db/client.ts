import { connect } from "@tursodatabase/database";
import { rm } from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { LocalLibSqlAdapter, DbService, AuthService, OllamaService } from "@loghead/db";

dotenv.config();

const dbPath = process.env.LOGHEAD_DB_PATH || "loghead.db";
const resolvedDbPath = path.resolve(dbPath);
console.log(`[DB] Using database at: ${resolvedDbPath}`);

async function openLocalDb() {
    let db = await connect(resolvedDbPath);

    try {
        const legacyRows = (await db
            .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='vec_logs'")
            .all()) as Array<{ sql?: string | null }>;
        const hasLegacyVec0 = legacyRows.some((r) => (r.sql || "").toLowerCase().includes("vec0"));

        if (hasLegacyVec0) {
            console.warn("[DB] Legacy sqlite-vec schema detected. Resetting local DB file.");
            db.close();

            await Promise.allSettled([
                rm(resolvedDbPath, { force: true }),
                rm(`${resolvedDbPath}-wal`, { force: true }),
                rm(`${resolvedDbPath}-shm`, { force: true }),
                rm(`${resolvedDbPath}-journal`, { force: true }),
            ]);

            db = await connect(resolvedDbPath);
        }
    } catch {
        // If sqlite_master inspection fails, continue and let migrations handle setup.
    }

    return db;
}

const db = await openLocalDb();
const dbAdapter = new LocalLibSqlAdapter(db);
const authService = new AuthService(dbAdapter);
const ollamaService = new OllamaService();
const dbService = new DbService(dbAdapter, authService, ollamaService);

export { dbAdapter, authService, ollamaService, dbService };
