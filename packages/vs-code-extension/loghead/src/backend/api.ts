import { serverState } from "../state/serverState";

const baseUrl = () => `http://localhost:${serverState.port}`;

function headers() {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Optional — Core ignores it for now
  if (serverState.mcpToken) {
    h.Authorization = `Bearer ${serverState.mcpToken}`;
  }

  return h;
}

// >> Fetch projects
export async function fetchProjects() {
  const res = await fetch(`${baseUrl()}/api/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}
// >> Create project
export async function createProject(name: string) {
  const res = await fetch(`${baseUrl()}/api/projects`, {
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
  type: string
) {
  const res = await fetch(`${baseUrl()}/api/streams/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ projectId, name, type }),
  });

  if (!res.ok) throw new Error("Failed to create stream");
  return res.json();
}

// >> Fetch stream token
export async function getStreamToken(streamId: string) {
  const res = await fetch(`${baseUrl()}/api/streams/${streamId}/token`);

  if (!res.ok) {
    throw new Error("Failed to fetch stream token");
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}

// >> Delete stream
export async function deleteStream(streamId: string) {
  const res = await fetch(`${baseUrl()}/api/streams/${streamId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete stream");
  }

  return res.json();
}

// >> Delete project
export async function deleteProject(projectId: string) {
  const res = await fetch(`${baseUrl()}/api/projects/${projectId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete project");
  }

  return res.json();
}

// >> Fetch logs
export async function fetchLogs(streamId: string, limit = 50) {
  const res = await fetch(
    `${baseUrl()}/api/logs?streamId=${streamId}&limit=${limit}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch logs");
  }

  return res.json();
}
