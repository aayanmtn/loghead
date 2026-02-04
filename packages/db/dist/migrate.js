export async function migrate(db, verbose = true) {
    if (verbose)
        console.log("Running migrations...");
    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON;");
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
    // Vector table (using sqlite-vec)
    try {
        await db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS vec_logs USING vec0(
        embedding float[1024]
      );
    `);
    }
    catch (e) {
        console.warn("Failed to create virtual vector table. Is sqlite-vec loaded?", e);
    }
    if (verbose)
        console.log("Migrations complete.");
}
