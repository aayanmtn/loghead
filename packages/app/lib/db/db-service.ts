import { DatabaseAdapter } from "./adapter";
import { OllamaService } from "./ollama-service";
import { AuthService } from "./auth-service";
import { Project, Stream, Log, SearchResult } from "./types";
import { randomUUID } from "crypto";

export class DbService {
  private db: DatabaseAdapter;
  public readonly auth: AuthService;
  private ollama: OllamaService;

  constructor(db: DatabaseAdapter, auth: AuthService, ollama: OllamaService) {
    this.db = db;
    this.auth = auth;
    this.ollama = ollama;
  }

  async createProject(name: string): Promise<Project> {
    const id = randomUUID();
    await this.db.run("INSERT INTO projects (id, name) VALUES (?, ?)", [
      id,
      name,
    ]);
    const project = await this.getProject(id);
    if (!project) throw new Error("Failed to create project");
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.db.get<Project>("SELECT * FROM projects WHERE id = ?", [id]);
  }

  async deleteProject(id: string): Promise<boolean> {
    await this.db.run("DELETE FROM projects WHERE id = ?", [id]);
    return true;
  }

  async listProjects(): Promise<Project[]> {
    try {
      const projects = await this.db.query<Project>(
        "SELECT * FROM projects ORDER BY created_at DESC",
      );
      // Fetch streams for each project (N+1, acceptable for this scale)
      const projectsWithStreams = await Promise.all(
        projects.map(async (p) => {
          const streams = await this.db.query<Stream>(
            "SELECT * FROM data_streams WHERE project_id = ?",
            [p.id],
          );
          return { ...p, streams };
        }),
      );

      return projectsWithStreams;
    } catch (e) {
      console.error("Error in listProjects:", e);
      throw e;
    }
  }

  async createStream(
    projectId: string,
    type: string,
    name: string,
    config: Record<string, unknown> = {},
  ): Promise<Stream & { token: string }> {
    const id = randomUUID();
    await this.db.run(
      "INSERT INTO data_streams (id, project_id, type, name, config) VALUES (?, ?, ?, ?, ?)",
      [id, projectId, type, name, JSON.stringify(config)],
    );

    const token = await this.auth.createStreamToken(id);
    const stream = await this.getStream(id);

    if (!stream) throw new Error("Failed to create stream");

    return { ...stream, token };
  }

  async getStream(id: string): Promise<Stream | undefined> {
    const stream = await this.db.get<Stream>(
      "SELECT * FROM data_streams WHERE id = ?",
      [id],
    );
    if (stream && typeof stream.config === "string") {
      try {
        stream.config = JSON.parse(stream.config);
      } catch {
        /* ignore */
      }
    }
    return stream;
  }

  async deleteStream(id: string): Promise<boolean> {
    await this.db.run("DELETE FROM data_streams WHERE id = ?", [id]);
    return true;
  }

  async listStreams(projectId: string): Promise<Stream[]> {
    const streams = await this.db.query<Stream>(
      "SELECT * FROM data_streams WHERE project_id = ? ORDER BY created_at DESC",
      [projectId],
    );
    return streams.map((s: Stream) => {
      if (typeof s.config === "string")
        try {
          s.config = JSON.parse(s.config);
        } catch {
          /* ignore */
        }
      return s;
    });
  }

  async addLog(
    streamId: string,
    content: string,
    metadata: Record<string, unknown> = {},
  ): Promise<{ id: string }> {
    // Generate embedding
    let embedding: number[] | null = null;
    try {
      embedding = await this.ollama.generateEmbedding(content);
    } catch (_e) {
      console.warn(
        "Embedding failed (vector search will be unavailable for this log):",
        _e,
      );
    }

    const id = randomUUID();
    const metadataStr = JSON.stringify(metadata);

    await this.db.transaction(async (tx) => {
      // 1. Insert into logs
      const result = await tx.run(
        "INSERT INTO logs (id, stream_id, content, metadata) VALUES (?, ?, ?, ?)",
        [id, streamId, content, metadataStr],
      );

      // Note: lastInsertRowid might not be available or reliable with @libsql/client over HTTP
      // if we are not careful. But standard INSERT returning rowid is supported.
      // However, with `uuid` primary keys, we might not need `rowid` for the logs table
      // unless `vec_logs` specifically requires it. `sqlite-vec` usually maps `rowid` to `rowid`.
      // So we DO need the rowid of the inserted log.

      const rowid = result.lastInsertRowid;

      if (rowid === undefined) {
        console.error("Failed to get lastInsertRowid for log insertion");
        return;
      }

      // 3. Insert into vec_logs if embedding exists
      if (embedding && embedding.length > 0) {
        if (embedding.length !== 1024) {
          console.warn(
            `[Warning] Embedding dimension mismatch. Expected 1024, got ${embedding.length}. Skipping vector index.`,
          );
          return;
        }

        // Ensure rowid is passed as BigInt so it binds as INTEGER
        const vecRowId = BigInt(rowid);

        const vectorJson = JSON.stringify(embedding);
        try {
          await tx.exec("SAVEPOINT add_vec");
          await tx.run(
            "INSERT OR REPLACE INTO vec_logs(rowid, embedding) VALUES (?, vector(?))",
            [vecRowId, vectorJson],
          );
          await tx.exec("RELEASE SAVEPOINT add_vec");
        } catch (vecError) {
          console.error("Failed to insert into vec_logs:", vecError);
          try {
            await tx.exec("ROLLBACK TO SAVEPOINT add_vec");
          } catch {}
        }
      }
    });

    return { id };
  }

  async searchLogs(
    streamId: string,
    query: string,
    limit = 10,
  ): Promise<SearchResult[]> {
    const vectorSql = `
      SELECT l.content, l.timestamp, l.metadata, k.distance
      FROM vector_top_k('vec_logs_idx', vector(?), ?) AS k
      JOIN logs l ON l.rowid = k.id
      WHERE l.stream_id = ?
      ORDER BY k.distance
    `;

    const embedding = await this.ollama.generateEmbedding(query);
    if (!embedding) return [];

    const vectorJson = JSON.stringify(embedding);

    try {
      console.info("[VectorSearch] Running vector similarity search", {
        streamId,
        limit,
        queryLength: query.length,
        embeddingLength: embedding.length,
      });

      const rows = await this.db.query<{
        content: string;
        timestamp: string;
        metadata: string;
        distance: number;
      }>(vectorSql, [vectorJson, limit, streamId]);

      console.info("[VectorSearch] Vector query succeeded", {
        streamId,
        rowCount: rows.length,
        firstDistance: rows[0]?.distance ?? null,
      });

      return rows.map((row) => {
        let meta: Record<string, unknown> | undefined;
        try {
          meta = JSON.parse(row.metadata);
        } catch {
          /* ignore */
        }
        return {
          content: row.content,
          timestamp: row.timestamp,
          similarity: 1 - row.distance,
          metadata: meta && Object.keys(meta).length > 0 ? meta : undefined,
        };
      });
    } catch (e) {
      const err = e as Error;
      console.warn(
        "[VectorSearch] Vector search failed; falling back to keyword search",
        {
          streamId,
          limit,
          query,
          embeddingLength: embedding.length,
          sql: vectorSql.trim(),
          errorMessage: err.message,
        },
      );

      const rows = await this.db.query<{
        content: string;
        timestamp: string;
        metadata: string;
      }>(
        `
      SELECT content, timestamp, metadata
      FROM logs
      WHERE stream_id = ? AND content LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `,
        [streamId, `%${query}%`, limit],
      );

      console.info("[VectorSearch] Keyword fallback query succeeded", {
        streamId,
        rowCount: rows.length,
      });

      return rows.map((row) => {
        let meta: Record<string, unknown> | undefined;
        try {
          meta = JSON.parse(row.metadata);
        } catch {
          /* ignore */
        }
        return {
          content: row.content,
          timestamp: row.timestamp,
          similarity: 0.5,
          metadata: meta && Object.keys(meta).length > 0 ? meta : undefined,
        };
      });
    }
  }

  async getRecentLogs(
    streamId: string,
    limit = 50,
    offset = 0,
  ): Promise<Log[]> {
    const rows = await this.db.query<Log>(
      `
      SELECT id, stream_id, content, timestamp, metadata FROM logs
      WHERE stream_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `,
      [streamId, limit, offset],
    );

    return rows.map((row) => {
      let meta = row.metadata;
      if (typeof meta === "string") {
        try {
          meta = JSON.parse(meta);
        } catch {
          /* ignore */
        }
      }
      return {
        id: row.id,
        stream_id: streamId,
        content: row.content,
        timestamp: row.timestamp,
        metadata:
          typeof meta === "object" && meta && Object.keys(meta).length > 0
            ? meta
            : {},
      } as Log;
    });
  }

  async cleanupOldLogs(days = 3): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Use SAVEPOINT to prevent transaction abort if vec_logs deletion fails (e.g. table missing)
      try {
        await tx.exec("SAVEPOINT cleanup_vec");
        await tx.run(
          `
        DELETE FROM vec_logs
        WHERE rowid IN (
          SELECT rowid FROM logs
          WHERE datetime(timestamp) < datetime('now', ?)
        )
      `,
          [`-${days} days`],
        );
        await tx.exec("RELEASE SAVEPOINT cleanup_vec");
      } catch (e) {
        // vec_logs might not exist if vector extension is not loaded
        // console.warn("Failed to cleanup vec_logs:", e);
        try {
          await tx.exec("ROLLBACK TO SAVEPOINT cleanup_vec");
        } catch (rollbackErr) {
          // If rollback fails, maybe transaction is already dead, but we try.
        }
      }

      await tx.run(
        `
      DELETE FROM logs
      WHERE datetime(timestamp) < datetime('now', ?)
    `,
        [`-${days} days`],
      );
    });
  }

  async close() {
    await this.db.close();
  }
}
