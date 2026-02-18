import { randomUUID, createHash } from "crypto";
export class DbService {
    db;
    auth;
    ollama;
    warnedLastInsertRowidFallback = false;
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
    async cleanupOldLogs(days = 3) {
        await this.db.transaction(async () => {
            try {
                await this.db.run(`
        DELETE FROM vec_logs
        WHERE rowid IN (
          SELECT rowid FROM logs
          WHERE datetime(timestamp) < datetime('now', ?)
        )
      `, [`-${days} days`]);
            }
            catch (vecCleanupError) {
                console.warn("[Core][DB][cleanupOldLogs] Vector cleanup step failed; continuing with log cleanup:", vecCleanupError);
            }
            await this.db.run(`
      DELETE FROM logs
      WHERE datetime(timestamp) < datetime('now', ?)
    `, [`-${days} days`]);
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
        // Fetch project_id for error grouping
        const stream = await this.getStream(streamId);
        const projectId = stream?.project_id;
        await this.db.transaction(async () => {
            // 1. Insert into logs
            const result = await this.db.run("INSERT INTO logs (id, stream_id, content, metadata) VALUES (?, ?, ?, ?)", [
                id, streamId, content, metadataStr
            ]);
            let rowid = result.lastInsertRowid;
            if (rowid === undefined) {
                const inserted = await this.db.get("SELECT rowid FROM logs WHERE id = ?", [id]);
                rowid = inserted?.rowid;
                if (rowid !== undefined && !this.warnedLastInsertRowidFallback) {
                    this.warnedLastInsertRowidFallback = true;
                    console.warn(`[Core][DB][addLog] lastInsertRowid missing; recovered via SELECT rowid for log inserts`);
                }
            }
            if (rowid === undefined) {
                console.error(`[Core][DB][addLog] Failed to resolve rowid for log insertion; vector index insert skipped for logId=${id}`);
                return;
            }
            // 2. Error Grouping
            if (projectId) {
                await this.processErrorGrouping(streamId, projectId, rowid, content, metadata);
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
                    await this.db.run("INSERT OR REPLACE INTO vec_logs(rowid, embedding) VALUES (?, vector(?))", [vecRowId, vectorJson]);
                }
                catch (vecError) {
                    console.error(`[Core][DB][addLog] Vector insert failed for streamId=${streamId} logId=${id}:`, vecError);
                    // Don't fail the whole transaction if vector insert fails
                }
            }
        });
        return { id };
    }
    async searchLogs(query, streamId, limit = 10) {
        console.log(`[Core][DB][searchLogs] query=\"${query}\" streamId=${streamId ?? "all"} limit=${limit}`);
        const normalizedQuery = query.trim().toLowerCase();
        const minSimilarity = 0.65;
        const embedding = await this.ollama.generateEmbedding(query);
        if (!embedding) {
            console.warn("[Core][DB][searchLogs] No embedding returned; returning empty results");
            return [];
        }
        console.log(`[Core][DB][searchLogs] Generated embedding dims=${embedding.length}`);
        const vectorJson = JSON.stringify(embedding);
        try {
            const distanceFns = ["vector_distance_cos", "vector_distance_l2", "vector_distance"];
            let lastVectorError;
            for (const distanceFn of distanceFns) {
                try {
                    let sql = `
      SELECT l.content, l.timestamp, l.metadata, ${distanceFn}(v.embedding, vector(?)) AS distance
      FROM vec_logs v
      JOIN logs l ON l.rowid = v.rowid
    `;
                    const params = [vectorJson];
                    if (streamId) {
                        sql += " WHERE l.stream_id = ?";
                        params.push(streamId);
                    }
                    sql += " ORDER BY distance ASC LIMIT ?";
                    params.push(limit);
                    console.log(`[Core][DB][searchLogs] Executing vector distance search via ${distanceFn}${streamId ? " with stream filter" : ""}`);
                    const rows = await this.db.query(sql, params);
                    console.log(`[Core][DB][searchLogs] Vector search succeeded via ${distanceFn}; rows=${rows.length}`);
                    const ranked = rows.map((row) => {
                        let meta;
                        try {
                            meta = JSON.parse(row.metadata);
                        }
                        catch { /* ignore */ }
                        const similarity = Math.max(0, 1 - row.distance);
                        const lexicalMatch = normalizedQuery.length > 0 && row.content.toLowerCase().includes(normalizedQuery);
                        return {
                            content: row.content,
                            timestamp: row.timestamp,
                            similarity,
                            metadata: (meta && Object.keys(meta).length > 0) ? meta : undefined,
                            lexicalMatch,
                        };
                    });
                    const filtered = ranked
                        .filter((row) => row.lexicalMatch || (row.similarity ?? 0) >= minSimilarity)
                        .slice(0, limit)
                        .map(({ lexicalMatch: _lexicalMatch, ...result }) => result);
                    console.log(`[Core][DB][searchLogs] Relevance filter kept ${filtered.length}/${rows.length} rows (minSimilarity=${minSimilarity})`);
                    return filtered;
                }
                catch (fnError) {
                    lastVectorError = fnError;
                    console.warn(`[Core][DB][searchLogs] ${distanceFn} search path failed; trying next path`, fnError);
                }
            }
            throw lastVectorError ?? new Error("No vector distance function path succeeded");
        }
        catch (e) {
            console.error("[Core][DB][searchLogs] Vector search failed on all paths; falling back to keyword LIKE search:", e);
            let fallbackSql = `
        SELECT content, timestamp, metadata
        FROM logs
        WHERE content LIKE ?
      `;
            const fallbackParams = [`%${query}%`];
            if (streamId) {
                fallbackSql += " AND stream_id = ?";
                fallbackParams.push(streamId);
            }
            fallbackSql += " ORDER BY timestamp DESC LIMIT ?";
            fallbackParams.push(limit);
            const rows = await this.db.query(fallbackSql, fallbackParams);
            console.log(`[Core][DB][searchLogs] Fallback LIKE search returned ${rows.length} rows`);
            return rows.map((row) => {
                let meta;
                try {
                    meta = JSON.parse(row.metadata);
                }
                catch { /* ignore */ }
                return {
                    content: row.content,
                    timestamp: row.timestamp,
                    similarity: 0.5,
                    metadata: (meta && Object.keys(meta).length > 0) ? meta : undefined
                };
            });
        }
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
    async processErrorGrouping(streamId, projectId, logRowId, content, metadata) {
        // Step A: Detect Error
        const isError = metadata.severity === "ERROR" ||
            metadata.level === "error" ||
            content.includes("Error:") ||
            content.includes("Exception") ||
            content.includes("Unhandled") ||
            content.includes("ECONNREFUSED") ||
            /HTTP\s+5\d{2}/.test(content);
        if (!isError)
            return;
        // Step B: Generate Fingerprint
        const fingerprint = this.generateFingerprint(content);
        // Step C: Find Existing Issue
        const existingIssue = await this.db.get("SELECT id, occurrence_count FROM issues WHERE project_id = ? AND fingerprint = ? LIMIT 1", [projectId, fingerprint]);
        let issueId;
        if (existingIssue) {
            // Step D: Update Issue
            issueId = existingIssue.id;
            await this.db.run("UPDATE issues SET last_seen = CURRENT_TIMESTAMP, occurrence_count = occurrence_count + 1, status = CASE WHEN status = 'resolved' THEN 'open' ELSE status END WHERE id = ?", [issueId]);
        }
        else {
            // Step E: Create Issue
            issueId = randomUUID();
            const title = content.split('\n')[0].substring(0, 120);
            await this.db.run(`INSERT INTO issues (id, project_id, fingerprint, title, status, first_seen, last_seen, occurrence_count, created_at)
         VALUES (?, ?, ?, ?, 'open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP)`, [issueId, projectId, fingerprint, title]);
        }
        // Link log to issue
        await this.db.run("UPDATE logs SET issue_id = ? WHERE rowid = ?", [issueId, logRowId]);
    }
    generateFingerprint(content) {
        const firstLine = content.split('\n')[0];
        const normalized = firstLine
            .toLowerCase()
            .replace(/\d+/g, '') // Remove numbers
            .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '') // Remove UUIDs
            .replace(/0x[0-9a-f]+/g, '') // Remove hex
            .trim();
        return createHash('sha256').update(normalized).digest('hex');
    }
    async getIssues(projectId, status, limit = 50) {
        let sql = "SELECT * FROM issues WHERE project_id = ?";
        const params = [projectId];
        if (status) {
            sql += " AND status = ?";
            params.push(status);
        }
        sql += " ORDER BY last_seen DESC LIMIT ?";
        params.push(limit);
        return this.db.query(sql, params);
    }
    async getIssue(id) {
        const issue = await this.db.get("SELECT * FROM issues WHERE id = ?", [id]);
        if (!issue)
            return null;
        const logs = await this.db.query("SELECT * FROM logs WHERE issue_id = ? ORDER BY timestamp DESC LIMIT 100", [id]);
        return { issue, logs };
    }
    async updateIssueStatus(id, status) {
        await this.db.run("UPDATE issues SET status = ? WHERE id = ?", [status, id]);
    }
}
