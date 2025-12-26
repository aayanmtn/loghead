"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProjects = fetchProjects;
exports.createProject = createProject;
exports.createStream = createStream;
exports.getStreamToken = getStreamToken;
exports.deleteStream = deleteStream;
exports.deleteProject = deleteProject;
exports.fetchLogs = fetchLogs;
const serverState_1 = require("../state/serverState");
const baseUrl = () => `http://localhost:${serverState_1.serverState.port}`;
function headers() {
    const h = {
        "Content-Type": "application/json",
    };
    // Optional — Core ignores it for now
    if (serverState_1.serverState.mcpToken) {
        h.Authorization = `Bearer ${serverState_1.serverState.mcpToken}`;
    }
    return h;
}
// >> Fetch projects
async function fetchProjects() {
    const res = await fetch(`${baseUrl()}/api/projects`);
    if (!res.ok)
        throw new Error("Failed to fetch projects");
    return res.json();
}
// >> Create project
async function createProject(name) {
    const res = await fetch(`${baseUrl()}/api/projects`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ name }),
    });
    if (!res.ok)
        throw new Error("Failed to create project");
    return res.json();
}
// >> Create stream
async function createStream(projectId, name, type) {
    const res = await fetch(`${baseUrl()}/api/streams/create`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ projectId, name, type }),
    });
    if (!res.ok)
        throw new Error("Failed to create stream");
    return res.json();
}
// >> Fetch stream token
async function getStreamToken(streamId) {
    const res = await fetch(`${baseUrl()}/api/streams/${streamId}/token`);
    if (!res.ok) {
        throw new Error("Failed to fetch stream token");
    }
    const data = (await res.json());
    return data.token;
}
// >> Delete stream
async function deleteStream(streamId) {
    const res = await fetch(`${baseUrl()}/api/streams/${streamId}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        throw new Error("Failed to delete stream");
    }
    return res.json();
}
// >> Delete project
async function deleteProject(projectId) {
    const res = await fetch(`${baseUrl()}/api/projects/${projectId}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        throw new Error("Failed to delete project");
    }
    return res.json();
}
// >> Fetch logs
async function fetchLogs(streamId, limit = 50) {
    const res = await fetch(`${baseUrl()}/api/logs?streamId=${streamId}&limit=${limit}`);
    if (!res.ok) {
        throw new Error("Failed to fetch logs");
    }
    return res.json();
}
//# sourceMappingURL=api.js.map