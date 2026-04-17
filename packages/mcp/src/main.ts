#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const LOGHEAD_TOKEN = process.env.LOGHEAD_TOKEN;

function normalizeBaseUrl(url: string) {
    let normalized = url.trim();
    if (normalized.endsWith("/")) normalized = normalized.slice(0, -1);

    // Support users passing API/SSE endpoints instead of the host root.
    if (normalized.endsWith("/api")) normalized = normalized.slice(0, -4);
    if (normalized.endsWith("/sse")) normalized = normalized.slice(0, -4);

    // Node.js fetch resolves localhost via dual IPv4/IPv6 which can cause ECONNREFUSED.
    // Normalize to 127.0.0.1 for reliable local connections.
    normalized = normalized.replace(/^(https?:\/\/)localhost\b/, "$1127.0.0.1");

    return normalized;
}

const baseUrl = normalizeBaseUrl(process.env.LOGHEAD_API_URL || "https://www.loghead.dev");
const API_BASE_CANDIDATES = [`${baseUrl}/api`, baseUrl];

class ApiError extends Error {
    status: number;
    statusText: string;
    url: string;

    constructor(status: number, statusText: string, url: string, bodyText: string) {
        super(`API Error ${status}: ${statusText} (${url})${bodyText ? ` - ${bodyText}` : ""}`);
        this.status = status;
        this.statusText = statusText;
        this.url = url;
    }
}

async function fetchApi(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    if (LOGHEAD_TOKEN && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${LOGHEAD_TOKEN}`);
    }

    let lastError: ApiError | null = null;

    for (const apiBase of API_BASE_CANDIDATES) {
        const url = `${apiBase}${path}`;
        const res = await fetch(url, { ...options, headers });

        if (res.ok) {
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                return await res.json();
            }

            const text = await res.text();
            if (!text) return {};

            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        }

        const bodyText = await res.text();
        lastError = new ApiError(res.status, res.statusText, url, bodyText);

        // Try the next candidate base URL only for not found routes.
        if (res.status !== 404) {
            throw lastError;
        }
    }

    throw (lastError || new Error("Unknown API request error"));
}

// Define types locally
interface Project { id: string; name: string; }
interface Stream { id: string; name: string; type: string; }

async function main() {
    const server = new McpServer({
        name: "loghead-mcp",
        version: "0.1.0"
    });

    // Resources
    server.resource(
        "project",
        "loghead://project/{id}",
        async (uri) => {
            const id = uri.href.split("/").pop() as string;
            try {
                const streams: Stream[] = await fetchApi(`/streams?projectId=${id}`);
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify(streams, null, 2),
                    }]
                };
            } catch (error) {
                throw new Error(`Failed to fetch project streams: ${error}`);
            }
        }
    );

    // Tools
    server.tool(
        "list_projects",
        "Lists all the projects and their data streams in Loghead. Use this to discover available logs and streams.",
        {}, // No args
        async () => {
            try {
                const projects = await fetchApi("/projects");
                const fullData = await Promise.all(projects.map(async (p: Project) => {
                    try {
                        const streams = await fetchApi(`/streams?projectId=${p.id}`);
                        return { ...p, streams };
                    } catch {
                        return p;
                    }
                }));
                return { content: [{ type: "text", text: JSON.stringify(fullData, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${error}` }], isError: true };
            }
        }
    );

    server.tool(
        "query_logs",
        "Search or retrieve logs from a specific data stream using semantic search or simple retrieval.",
        {
            streamId: z.string().describe("The unique identifier of the stream to query. Get this from list_projects."),
            query: z.string().optional().describe("Natural language search query for semantic search (e.g. 'find errors in auth'). If omitted, returns recent logs."),
            limit: z.number().optional().describe("Deprecated. Use pageSize instead."),
            page: z.number().optional().default(1).describe("Page number for pagination (starts at 1)."),
            pageSize: z.number().optional().default(100).describe("Number of logs to return per page (max 1000).")
        },
        async ({ streamId, query, limit, page, pageSize }) => {
            try {
                let url = `/logs?streamId=${streamId}&page=${page}&pageSize=${pageSize}`;

                if (query) {
                    const searchLimit = limit ?? pageSize;
                    url = `/search?streamId=${streamId}&q=${encodeURIComponent(query)}&limit=${searchLimit}`;
                } else if (limit) {
                    url += `&limit=${limit}`;
                }

                const logs = await fetchApi(url);
                return { content: [{ type: "text", text: JSON.stringify(logs, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${error}` }], isError: true };
            }
        }
    );

    server.tool(
        "create_project",
        "Create a new project container for organizing log streams.",
        {
            name: z.string().describe("The name of the new project (e.g. 'My App', 'Backend Services')")
        },
        async ({ name }) => {
            try {
                const project = await fetchApi("/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name })
                });
                return { content: [{ type: "text", text: `Project created: ${project.id}` }] };
            } catch (e) {
                return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
            }
        }
    );

    server.tool(
        "delete_project",
        "Delete a project and all its associated streams.",
        {
            id: z.string().describe("The ID of the project to delete")
        },
        async ({ id }) => {
            try {
                await fetchApi(`/projects/${id}`, { method: "DELETE" });
                return { content: [{ type: "text", text: `Project deleted` }] };
            } catch (e) {
                return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
            }
        }
    );

    server.tool(
        "create_stream",
        "Create a new data stream within a project to ingest logs.",
        {
            projectId: z.string().describe("The ID of the parent project"),
            type: z.string().describe("The type of stream (e.g. 'browser', 'python', 'docker', 'terminal')"),
            name: z.string().describe("A friendly name for the stream"),
            config: z.any().optional().describe("Optional configuration object specific to the stream type")
        },
        async ({ projectId, type, name, config }) => {
            try {
                const payload = { projectId, type, name, config };

                try {
                    const stream = await fetchApi("/streams/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });

                    return { content: [{ type: "text", text: `Stream created: ${stream.id}\nToken: ${stream.token}` }] };
                } catch (error) {
                    // Cloud uses POST /api/streams while Core uses POST /api/streams/create.
                    if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 405)) {
                        throw error;
                    }
                }

                const stream = await fetchApi("/streams", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                return { content: [{ type: "text", text: `Stream created: ${stream.id}\nToken: ${stream.token}` }] };
            } catch (e) {
                return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
            }
        }
    );

    server.tool(
        "delete_stream",
        "Delete a specific data stream.",
        {
            id: z.string().describe("The ID of the stream to delete")
        },
        async ({ id }) => {
            try {
                await fetchApi(`/streams/${id}`, { method: "DELETE" });
                return { content: [{ type: "text", text: `Stream deleted` }] };
            } catch (e) {
                return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
            }
        }
    );

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Loghead MCP Server running on stdio");
}

main().catch(console.error);
