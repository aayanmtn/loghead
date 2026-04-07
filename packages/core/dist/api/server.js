import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { ingestCustomLogs, ingestOtlpLogs } from "./controllers.js";
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
    app.post("/v1/logs", async (req, res) => {
        console.log(`[API] POST /v1/logs received`);
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.warn("[API] /v1/logs Unauthorized: Missing token");
                return res.status(401).json({ code: 16, message: "Unauthenticated" });
            }
            const token = authHeader.split(" ")[1];
            const result = await ingestOtlpLogs(req.body, token, db, auth);
            res.json(result);
        }
        catch (e) {
            console.error("OTLP Ingest error:", e);
            if (e.message.includes("Unauthorized")) {
                return res.status(401).json({ code: 16, message: e.message });
            }
            if (e.message.includes("Invalid payload")) {
                return res.status(400).json({ code: 3, message: e.message });
            }
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
            const result = await ingestCustomLogs(req.body, token, db, auth);
            res.json(result);
        }
        catch (e) {
            console.error("Ingest error:", e);
            if (e.message.includes("Unauthorized")) {
                return res.status(401).send(e.message);
            }
            if (e.message.includes("Forbidden")) {
                return res.status(403).send(e.message);
            }
            if (e.message.includes("Missing logs")) {
                return res.status(400).send(e.message);
            }
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
    app.patch("/api/projects/:id", async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).send("Name required");
        }
        const project = await db.renameProject(id, name.trim());
        res.json(project);
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
    app.patch("/api/streams/:id", async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).send("Name required");
        }
        const stream = await db.renameStream(id, name.trim());
        res.json(stream);
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
    app.get("/api/issues", async (req, res) => {
        const projectId = req.query.projectId;
        const status = req.query.status;
        const limit = parseInt(req.query.limit || "50");
        if (!projectId) {
            return res.status(400).send("Missing projectId");
        }
        try {
            const issues = await db.getIssues(projectId, status, limit);
            res.json(issues);
        }
        catch (e) {
            console.error("Error fetching issues:", e);
            res.status(500).send(String(e));
        }
    });
    app.get("/api/issues/:id", async (req, res) => {
        const { id } = req.params;
        try {
            const data = await db.getIssue(id);
            if (!data)
                return res.status(404).send("Issue not found");
            res.json(data);
        }
        catch (e) {
            console.error("Error fetching issue details:", e);
            res.status(500).send(String(e));
        }
    });
    app.patch("/api/issues/:id", async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        if (status !== "open" && status !== "resolved") {
            return res.status(400).send("Invalid status");
        }
        try {
            await db.updateIssueStatus(id, status);
            res.json({ success: true });
        }
        catch (e) {
            console.error("Error updating issue:", e);
            res.status(500).send(String(e));
        }
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
