import { randomUUID } from "crypto";
export class DbService {
    db;
    auth;
    ollama;
    constructor(db, auth, ollama) {
        this.db = db;
        this.auth = auth;
        this.ollama = ollama;
    }
    async createProject(name) {
        const id = randomUUID();
        await this.db.run("INSERT INTO projects (id, name) VALUES (?, ?)", [id, name]);
        const project = await this.getProject(id);
        if (!project)
            throw new Error("Failed to create project");
        return project;
    }
    async getProject(id) {
        return this.db.get("SELECT * FROM projects WHERE id = ?", [id]);
    }
    async deleteProject(id) {
        await this.db.run("DELETE FROM projects WHERE id = ?", [id]);
        return true;
    }
    async listProjects() {
        try {
            const projects = await this.db.query("SELECT * FROM projects ORDER BY created_at DESC");
            // Fetch streams for each project (N+1, acceptable for this scale)
            const projectsWithStreams = await Promise.all(projects.map(async (p) => {
                const streams = await this.db.query("SELECT * FROM data_streams WHERE project_id = ?", [p.id]);
                return { ...p, streams };
            }));
            return projectsWithStreams;
        }
        catch (e) {
            console.error("Error in listProjects:", e);
            throw e;
        }
    }
    async createStream(projectId, type, name, config = {}) {
        const id = randomUUID();
        await this.db.run("INSERT INTO data_streams (id, project_id, type, name, config) VALUES (?, ?, ?, ?, ?)", [
            id, projectId, type, name, JSON.stringify(config)
        ]);
        const token = await this.auth.createStreamToken(id);
        const stream = await this.getStream(id);
        if (!stream)
            throw new Error("Failed to create stream");
        return { ...stream, token };
    }
    async getStream(id) {
        const stream = await this.db.get("SELECT * FROM data_streams WHERE id = ?", [id]);
        if (stream && typeof stream.config === "string") {
            try {
                stream.config = JSON.parse(stream.config);
            }
            catch { /* ignore */ }
        }
        return stream;
    }
    async deleteStream(id) {
        await this.db.run("DELETE FROM data_streams WHERE id = ?", [id]);
        return true;
    }
    async listStreams(projectId) {
        const streams = await this.db.query("SELECT * FROM data_streams WHERE project_id = ? ORDER BY created_at DESC", [projectId]);
        return streams.map((s) => {
            if (typeof s.config === "string")
                try {
                    s.config = JSON.parse(s.config);
                }
                catch { /* ignore */ }
            return s;
        });
    }
    async addLog(streamId, content, metadata = {}) {
        // Generate embedding
        let embedding = null;
        try {
            embedding = await this.ollama.generateEmbedding(content);
        }
        catch (_e) {
            // console.warn("Embedding failed", _e);
        }
        const id = randomUUID();
        const metadataStr = JSON.stringify(metadata);
        await this.db.transaction(async () => {
            // 1. Insert into logs
            const result = await this.db.run("INSERT INTO logs (id, stream_id, content, metadata) VALUES (?, ?, ?, ?)", [
                id, streamId, content, metadataStr
            ]);
            const rowid = result.lastInsertRowid;
            if (rowid === undefined) {
                console.error("Failed to get lastInsertRowid for log insertion");
                return;
            }
            // 3. Insert into vec_logs if embedding exists
            if (embedding && embedding.length > 0) {
                if (embedding.length !== 1024) {
                    console.warn(`[Warning] Embedding dimension mismatch. Expected 1024, got ${embedding.length}. Skipping vector index.`);
                    return;
                }
                // Ensure rowid is passed as BigInt so it binds as INTEGER
                const vecRowId = BigInt(rowid);
                const vectorJson = JSON.stringify(embedding);
                try {
                    await this.db.run("INSERT INTO vec_logs(rowid, embedding) VALUES (?, ?)", [vecRowId, vectorJson]);
                }
                catch (vecError) {
                    console.error("Failed to insert into vec_logs:", vecError);
                    // Don't fail the whole transaction if vector insert fails
                }
            }
        });
        return { id };
    }
    async searchLogs(streamId, query, limit = 10) {
        const embedding = await this.ollama.generateEmbedding(query);
        if (!embedding)
            return [];
        const vectorJson = JSON.stringify(embedding);
        // KNN Search
        const rows = await this.db.query(`
      SELECT l.content, l.timestamp, l.metadata, v.distance
      FROM vec_logs v
      JOIN logs l ON l.rowid = v.rowid
      WHERE v.embedding MATCH ? AND k = ? AND l.stream_id = ?
      ORDER BY v.distance
    `, [vectorJson, limit, streamId]);
        return rows.map((row) => {
            let meta;
            try {
                meta = JSON.parse(row.metadata);
            }
            catch { /* ignore */ }
            return {
                content: row.content,
                timestamp: row.timestamp,
                similarity: 1 - row.distance, // Rough approx
                metadata: (meta && Object.keys(meta).length > 0) ? meta : undefined
            };
        });
    }
    async getRecentLogs(streamId, limit = 50, offset = 0) {
        const rows = await this.db.query(`
      SELECT id, stream_id, content, timestamp, metadata FROM logs
      WHERE stream_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `, [streamId, limit, offset]);
        return rows.map((row) => {
            let meta = row.metadata;
            if (typeof meta === "string") {
                try {
                    meta = JSON.parse(meta);
                }
                catch { /* ignore */ }
            }
            return {
                id: row.id,
                stream_id: streamId,
                content: row.content,
                timestamp: row.timestamp,
                metadata: (typeof meta === "object" && meta && Object.keys(meta).length > 0) ? meta : {}
            };
        });
    }
    async close() {
        await this.db.close();
    }
}
