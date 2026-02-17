import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import chalk from "chalk";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function startApiServer(db, auth) {
    const app = express();
    const port = process.env.PORT || 4567;
    app.use(cors());
    app.use(express.json());
    // Serve static frontend files
    // Determine path based on whether we are running in src (dev) or dist (prod)
    let publicPath = path.join(__dirname, "../public");
    if (!fs.existsSync(publicPath)) {
        // Try looking in dist/public if we are in src
        publicPath = path.join(__dirname, "../../dist/public");
    }
    if (fs.existsSync(publicPath)) {
        console.log(chalk.blue(`Serving frontend from: ${publicPath}`));
        app.use(express.static(publicPath));
    }
    else {
        console.warn(chalk.yellow("Frontend build not found. Run 'npm run build' in packages/core/frontend to build the UI."));
    }
    await auth.initialize();
    // console.log(chalk.bold.green(`\n💻 API server running on:`));
    // console.log(chalk.green(`http://localhost:${port}`));
    // Helper to parse OTLP attributes
    const parseOtlpAttributes = (attributes) => {
        if (!Array.isArray(attributes))
            return {};
        const result = {};
        for (const attr of attributes) {
            if (attr.key && attr.value) {
                // Extract value based on type (stringValue, intValue, boolValue, etc.)
                const val = attr.value;
                if (val.stringValue !== undefined)
                    result[attr.key] = val.stringValue;
                else if (val.intValue !== undefined)
                    result[attr.key] = parseInt(val.intValue);
                else if (val.doubleValue !== undefined)
                    result[attr.key] = val.doubleValue;
                else if (val.boolValue !== undefined)
                    result[attr.key] = val.boolValue;
                else if (val.arrayValue !== undefined)
                    result[attr.key] = val.arrayValue; // Simplified
                else if (val.kvlistValue !== undefined)
                    result[attr.key] = val.kvlistValue; // Simplified
                else
                    result[attr.key] = val;
            }
        }
        return result;
    };
    app.post("/v1/logs", async (req, res) => {
        console.log(`[API] POST /v1/logs received`);
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.warn("[API] /v1/logs Unauthorized: Missing token");
                return res.status(401).json({ code: 16, message: "Unauthenticated" });
            }
            const token = authHeader.split(" ")[1];
            const payload = await auth.verifyToken(token);
            if (!payload || !payload.streamId) {
                console.warn("[API] /v1/logs Unauthorized: Invalid token");
                return res.status(401).json({ code: 16, message: "Invalid token" });
            }
            const streamId = payload.streamId;
            console.log(`[API] Ingesting OTLP logs for stream: ${streamId}`);
            const { resourceLogs } = req.body;
            if (!resourceLogs || !Array.isArray(resourceLogs)) {
                console.warn("[API] /v1/logs Invalid payload");
                return res.status(400).json({ code: 3, message: "Invalid payload" });
            }
            // ... existing logic ...
            let count = 0;
            // ... loop ...
            // (I will keep the existing loop logic but add a log at the end)
            /* ... existing loop code ... */
            for (const resourceLog of resourceLogs) {
                const resourceAttrs = parseOtlpAttributes(resourceLog.resource?.attributes);
                if (resourceLog.scopeLogs) {
                    for (const scopeLog of resourceLog.scopeLogs) {
                        const scopeName = scopeLog.scope?.name;
                        if (scopeLog.logRecords) {
                            for (const log of scopeLog.logRecords) {
                                let content = "";
                                if (log.body?.stringValue)
                                    content = log.body.stringValue;
                                else if (log.body?.kvlistValue)
                                    content = JSON.stringify(log.body.kvlistValue);
                                else if (typeof log.body === "string")
                                    content = log.body; // Fallback
                                const logAttrs = parseOtlpAttributes(log.attributes);
                                // Merge attributes: Resource > Scope (if any) > Log
                                const metadata = {
                                    ...resourceAttrs,
                                    ...logAttrs,
                                    severity: log.severityText || log.severityNumber,
                                    scope: scopeName,
                                    timestamp: log.timeUnixNano,
                                };
                                if (content) {
                                    await db.addLog(streamId, content, metadata);
                                    count++;
                                }
                            }
                        }
                    }
                }
            }
            console.log(`[API] /v1/logs Ingested ${count} logs`);
            res.json({ partialSuccess: {}, logsIngested: count });
        }
        catch (e) {
            console.error("OTLP Ingest error:", e);
            res.status(500).json({ code: 13, message: String(e) });
        }
    });
    app.post("/api/ingest", async (req, res) => {
        console.log(`[API] POST /api/ingest received`);
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.warn("[API] /api/ingest Unauthorized: Missing token");
                return res.status(401).send("Unauthorized: Missing token");
            }
            const token = authHeader.split(" ")[1];
            const payload = await auth.verifyToken(token);
            if (!payload || !payload.streamId) {
                console.warn("[API] /api/ingest Unauthorized: Invalid token");
                return res.status(401).send("Unauthorized: Invalid token");
            }
            const { streamId, logs } = req.body;
            console.log(`[API] Ingesting logs for stream: ${streamId}`);
            if (streamId !== payload.streamId) {
                console.warn(`[API] /api/ingest Forbidden: Token streamId ${payload.streamId} != body streamId ${streamId}`);
                return res.status(403).send("Forbidden: Token does not match streamId");
            }
            if (!logs) {
                console.warn("[API] /api/ingest Missing logs");
                return res.status(400).send("Missing logs");
            }
            const logEntries = Array.isArray(logs) ? logs : [logs];
            console.log(`[API] Processing ${logEntries.length} log entries`);
            for (const log of logEntries) {
                let content = "";
                let metadata = {};
                if (typeof log === "string") {
                    content = log;
                }
                else if (typeof log === "object") {
                    content = log.content || JSON.stringify(log);
                    metadata = log.metadata || {};
                }
                if (content) {
                    await db.addLog(streamId, content, metadata);
                }
            }
            console.log(`[API] /api/ingest Successfully added ${logEntries.length} logs`);
            res.json({ success: true, count: logEntries.length });
        }
        catch (e) {
            console.error("Ingest error:", e);
            res.status(500).json({ error: String(e) });
        }
    });
    //   Added this endpoint to fetch system token
    app.get("/api/system/token", async (_req, res) => {
        try {
            const token = await auth.getOrCreateMcpToken();
            res.json({ token });
        }
        catch (e) {
            res.status(500).json({ error: String(e) });
        }
    });
    app.get("/api/connection", async (req, res) => {
        try {
            const token = await auth.getOrCreateMcpToken();
            res.json({
                token,
                mcpUrl: `http://localhost:${port}/sse`, // Assuming default MCP behavior or just provide base URL
            });
        }
        catch (e) {
            res.status(500).json({ error: String(e) });
        }
    });
    app.get("/api/projects", async (req, res) => {
        const projects = await db.listProjects();
        res.json(projects);
    });
    app.post("/api/projects", async (req, res) => {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ error: "Name required" });
        const project = await db.createProject(name);
        res.json(project);
    });
    app.delete("/api/projects/:id", async (req, res) => {
        const { id } = req.params;
        await db.deleteProject(id);
        res.json({ success: true });
    });
    app.get("/api/streams", async (req, res) => {
        const projectId = req.query.projectId;
        if (projectId) {
            const streams = await db.listStreams(projectId);
            res.json(streams);
        }
        else {
            res.status(400).send("Missing projectId");
        }
    });
    app.delete("/api/streams/:id", async (req, res) => {
        const { id } = req.params;
        await db.deleteStream(id);
        res.json({ success: true });
    });
    app.get("/api/streams/:id/token", async (req, res) => {
        const { id } = req.params;
        try {
            const token = await auth.createStreamToken(id);
            res.json({ token });
        }
        catch (e) {
            res.status(500).json({ error: String(e) });
        }
    });
    app.post("/api/streams", async (req, res) => {
        try {
            const { projectId, name, type, config } = req.body || {};
            if (!projectId) {
                return res.status(400).send("Missing projectId");
            }
            if (!name || typeof name !== "string" || !name.trim()) {
                return res.status(400).send("Missing name");
            }
            if (!type || typeof type !== "string") {
                return res.status(400).send("Missing type");
            }
            const stream = await db.createStream(projectId, type, name.trim(), config || {});
            res.json(stream);
        }
        catch (e) {
            console.error("Create stream error:", e);
            res.status(500).json({ error: String(e) });
        }
    });
    app.post("/api/streams/create", async (req, res) => {
        const body = req.body;
        const stream = await db.createStream(body.projectId, body.type, body.name, body.config || {});
        res.json(stream);
    });
    app.get("/api/search", async (req, res) => {
        const query = req.query.query || req.query.q;
        const streamId = req.query.streamId;
        const limitStr = req.query.limit;
        const limit = limitStr ? parseInt(limitStr) : 50;
        if (!query) {
            return res.json([]);
        }
        try {
            const results = await db.searchLogs(query, streamId, limit);
            res.json(results);
        }
        catch (e) {
            console.error("Error searching logs:", e);
            res.status(500).send(String(e));
        }
    });
    app.get("/api/logs", async (req, res) => {
        const streamId = req.query.streamId;
        if (!streamId) {
            return res.status(400).send("Missing streamId");
        }
        let page = parseInt(req.query.page || "1");
        if (page < 1)
            page = 1;
        let pageSize = parseInt(req.query.pageSize || "100");
        let limit = req.query.limit
            ? parseInt(req.query.limit)
            : pageSize;
        // Enforce max limit
        if (limit > 1000)
            limit = 1000;
        const offset = (page - 1) * limit;
        const query = req.query.q;
        let logs;
        if (query) {
            logs = await db.searchLogs(query, streamId, limit);
        }
        else {
            logs = await db.getRecentLogs(streamId, limit, offset);
        }
        res.json(logs);
    });
    // SPA fallback
    app.get("*", (req, res) => {
        if (req.path.startsWith("/api")) {
            return res.status(404).json({ error: "Not Found" });
        }
        if (fs.existsSync(path.join(publicPath, "index.html"))) {
            res.sendFile(path.join(publicPath, "index.html"));
        }
        else {
            res.status(404).send("Dashboard not found. Please build the frontend.");
        }
    });
    const server = app.listen(port, () => {
        // listening
    });
    server.on("error", (e) => {
        console.error("Server error:", e);
        process.exit(1);
    });
}
