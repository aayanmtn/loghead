import { serverState, LOGHEAD_API_URL } from "../state/serverState";
import * as vscode from "vscode";

const baseUrl = () => {
  return LOGHEAD_API_URL;
};

function headers() {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = serverState.cloudToken || serverState.mcpToken;

  if (token) {
    h.Authorization = `Bearer ${token}`;
  }

  return h;
}

async function apiFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, init);

  if (res.status === 401) {
    vscode.commands.executeCommand("loghead.disconnect");
    vscode.window.showErrorMessage(
      "Session expired. Please reconnect to Loghead.",
    );
    throw new Error("Session expired");
  }

  return res;
}

// >> Fetch projects
export async function fetchProjects() {
  const res = await apiFetch(`${baseUrl()}/api/projects`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}
// >> Create project
export async function createProject(name: string) {
  const res = await apiFetch(`${baseUrl()}/api/projects`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

// >> Create stream
export async function createStream(
  projectId: string,
  name: string,
  type: string,
) {
  const res = await apiFetch(`${baseUrl()}/api/streams`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ projectId, name, type }),
  });

  if (!res.ok) throw new Error("Failed to create stream");
  return res.json();
}

// >> Fetch stream token
export async function getStreamToken(streamId: string) {
  const res = await apiFetch(`${baseUrl()}/api/streams/${streamId}/token`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch stream token");
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}

// >> Delete stream
export async function deleteStream(streamId: string) {
  const res = await apiFetch(`${baseUrl()}/api/streams/${streamId}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete stream");
  }

  return res.json();
}

// >> Delete project
export async function deleteProject(projectId: string) {
  const res = await apiFetch(`${baseUrl()}/api/projects/${projectId}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete project");
  }

  return res.json();
}

// >> Fetch logs
export async function fetchLogs(streamId: string, limit = 50) {
  const res = await apiFetch(
    `${baseUrl()}/api/logs?streamId=${streamId}&limit=${limit}`,
    {
      headers: headers(),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch logs");
  }

  return res.json();
}
