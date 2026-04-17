import { DatabaseAdapter } from "./adapter";

export async function migrate(db: DatabaseAdapter, verbose = true) {
  if (verbose) console.log("Running migrations...");

  // Enable foreign keys
  // Note: specific drivers might behave differently, but standard SQLite supports this.
  try {
    await db.exec("PRAGMA foreign_keys = ON;");
  } catch (e) {
    console.warn("Failed to enable foreign keys:", e);
  }

  // System Config table (for secrets, etc.)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Projects table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Data Streams table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS data_streams (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      config TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // Logs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      stream_id TEXT,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT DEFAULT '{}',
      FOREIGN KEY(stream_id) REFERENCES data_streams(id) ON DELETE CASCADE
    );
  `);

  // Native Turso/libSQL vector table + index
  const vecTableInfo = await db.query<{ name: string; type: string }>(
    "PRAGMA table_info(vec_logs)",
  );

  const hasVecTable = vecTableInfo.length > 0;
  const embeddingColumn = vecTableInfo.find((col) => col.name === "embedding");
  const hasNativeVectorColumn =
    !!embeddingColumn && embeddingColumn.type.toUpperCase().includes("F32_BLOB");

  if (hasVecTable && !hasNativeVectorColumn) {
    if (verbose) {
      console.warn("[Vector] Migrating legacy vec_logs table to Turso native vector type.");
    }

    await db.exec("ALTER TABLE vec_logs RENAME TO vec_logs_legacy");
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS vec_logs (
      rowid INTEGER PRIMARY KEY,
      embedding F32_BLOB(1024) NOT NULL
    );
  `);

  if (hasVecTable && !hasNativeVectorColumn) {
    await db.exec(`
      INSERT OR IGNORE INTO vec_logs (rowid, embedding)
      SELECT rowid, vector(embedding)
      FROM vec_logs_legacy
      WHERE embedding IS NOT NULL;
    `);
    await db.exec("DROP TABLE IF EXISTS vec_logs_legacy");
  }

  await db.exec(
    "CREATE INDEX IF NOT EXISTS vec_logs_idx ON vec_logs(libsql_vector_idx(embedding, 'metric=cosine'))",
  );

  if (verbose) console.log("Migrations complete.");
}
