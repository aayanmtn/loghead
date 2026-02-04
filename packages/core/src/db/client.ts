import Database from "libsql";
import * as sqliteVec from "sqlite-vec";
import path from "path";
import dotenv from "dotenv";
import { LocalLibSqlAdapter, DbService, AuthService, OllamaService } from "@loghead/db";

dotenv.config();

const dbPath = process.env.LOGHEAD_DB_PATH || "loghead.db";
console.log(`[DB] Using database at: ${path.resolve(dbPath)}`);

const db = new Database(dbPath, {});

// Load sqlite-vec extension
try {
    const vecPath = sqliteVec.getLoadablePath();
    db.loadExtension(vecPath);
} catch (e) {
    console.error("Failed to load sqlite-vec extension:", e);
}

const dbAdapter = new LocalLibSqlAdapter(db);
const authService = new AuthService(dbAdapter);
const ollamaService = new OllamaService();
const dbService = new DbService(dbAdapter, authService, ollamaService);

export { dbAdapter, authService, ollamaService, dbService };
