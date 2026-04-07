"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, Component, } from "react";
import { Activity, ChevronDown, Box, LayoutGrid, Plug, Copy, Check, X, Plus, AlertCircle, Search, Pencil, Trash, ArrowLeft, } from "lucide-react";
import { cn } from "./utils";
// Error Boundary Component
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { className: "p-8 text-center text-red-500 bg-gray-900 rounded-lg border border-red-900 m-4", children: [_jsx(AlertCircle, { className: "w-12 h-12 mx-auto mb-4" }), _jsx("h2", { className: "text-lg font-bold mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-sm font-mono bg-black/50 p-4 rounded text-left overflow-auto max-h-48", children: this.state.error?.toString() }), _jsx("button", { onClick: () => window.location.reload(), className: "mt-4 px-4 py-2 bg-red-900/50 hover:bg-red-900 rounded text-white text-sm", children: "Reload Page" })] }));
        }
        return this.props.children;
    }
}
function highlightText(text, query) {
    if (!query)
        return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (_jsx("span", { children: parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? (_jsx("span", { className: "bg-yellow-500/20 text-yellow-200 rounded px-0.5", children: part }, i)) : (part)) }));
}
const CONNECT_PLATFORM_TABS = [
    { id: "claudeCode", label: "Claude Code" },
    { id: "windsurf", label: "Windsurf" },
    { id: "cursor", label: "Cursor" },
    { id: "claudeDesktop", label: "Claude Desktop" },
    { id: "vscode", label: "VS Code" },
    { id: "aws", label: "AWS" },
];
function normalizeApiBaseUrl(url) {
    let normalized = (url || "").trim();
    if (!normalized)
        return "";
    if (normalized.endsWith("/"))
        normalized = normalized.slice(0, -1);
    if (normalized.endsWith("/sse"))
        normalized = normalized.slice(0, -4);
    if (normalized.endsWith("/api"))
        normalized = normalized.slice(0, -4);
    return normalized;
}
function getIngestionCommand(baseUrl, token) {
    return `npx @loghead/core --base-url ${baseUrl} --token ${token}`;
}
function sharedMcpJson(apiUrl, token) {
    return `{
  "mcpServers": {
    "loghead": {
      "command": "npx",
      "args": ["-y", "@loghead/mcp"],
      "env": {
        "LOGHEAD_API_URL": "${apiUrl}",
        "LOGHEAD_TOKEN": "${token}"
      }
    }
  }
}`;
}
function getConnectGuide(platform, apiUrl, token) {
    switch (platform) {
        case "claudeCode":
            return {
                title: "Claude Code setup",
                steps: [
                    "Open your Claude Code MCP configuration file.",
                    "Add the Loghead MCP server entry shown below.",
                    "Save the file and restart Claude Code.",
                ],
                snippetLabel: "Config snippet",
                snippet: sharedMcpJson(apiUrl, token),
            };
        case "windsurf":
            return {
                title: "Windsurf setup",
                steps: [
                    "Open Windsurf MCP settings (or mcp_config.json).",
                    "Add/update the Loghead server config shown below.",
                    "Reload Windsurf so MCP servers reconnect.",
                ],
                snippetLabel: "mcp_config.json",
                snippet: `{
  "servers": {
    "loghead": {
      "command": "npx",
      "args": ["-y", "@loghead/mcp"],
      "env": {
        "LOGHEAD_API_URL": "${apiUrl}",
        "LOGHEAD_TOKEN": "${token}"
      }
    }
  }
}`,
            };
        case "cursor":
            return {
                title: "Cursor setup",
                steps: [
                    "Go to Settings -> MCP and add a new server.",
                    "Name: loghead | Type: stdio | Command: npx -y @loghead/mcp.",
                    `Set env vars: LOGHEAD_API_URL=${apiUrl} and LOGHEAD_TOKEN=<your token>.`,
                ],
                snippetLabel: "Command",
                snippet: "npx -y @loghead/mcp",
            };
        case "claudeDesktop":
            return {
                title: "Claude Desktop setup",
                steps: [
                    "Open claude_desktop_config.json.",
                    "Add the Loghead MCP server block shown below.",
                    "Save and fully restart Claude Desktop.",
                ],
                snippetLabel: "claude_desktop_config.json",
                snippet: sharedMcpJson(apiUrl, token),
            };
        case "vscode":
            return {
                title: "VS Code MCP extension setup",
                steps: [
                    "Open your VS Code mcp.json configuration.",
                    "Add the loghead server under the servers object.",
                    "Reload VS Code to apply the MCP server changes.",
                ],
                snippetLabel: "mcp.json",
                snippet: `{
  "servers": {
    "loghead": {
      "command": "npx",
      "args": ["-y", "@loghead/mcp"],
      "env": {
        "LOGHEAD_API_URL": "${apiUrl}",
        "LOGHEAD_TOKEN": "${token}"
      }
    }
  }
}`,
            };
        case "aws":
            return {
                title: "AWS CloudWatch Logs setup",
                steps: [
                    "Create a new Node.js Lambda function.",
                    `Set environment variables: LOGHEAD_API_URL=${apiUrl} and LOGHEAD_STREAM_TOKEN=<stream token>.`,
                    "Add a Subscription Filter to your CloudWatch Log Group targeting this Lambda.",
                ],
                snippetLabel: "Lambda Function (Node.js)",
                snippet: `const zlib = require('zlib');
const https = require('https');

exports.handler = async (event) => {
    const payload = Buffer.from(event.awslogs.data, 'base64');
    const decompressed = zlib.gunzipSync(payload);
    const data = JSON.parse(decompressed.toString());
    
    const logs = data.logEvents.map(e => ({
        content: e.message,
        metadata: { 
            logGroup: data.logGroup, 
            logStream: data.logStream,
            aws_timestamp: e.timestamp 
        }
    }));

    const url = new URL(process.env.LOGHEAD_API_URL + '/api/ingest');
    const body = JSON.stringify({
        streamId: process.env.LOGHEAD_STREAM_ID,
        logs: logs
    });

    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.LOGHEAD_STREAM_TOKEN,
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            res.on('data', () => {});
            res.on('end', () => resolve());
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
};`,
            };
        default:
            return {
                title: "Setup",
                steps: [
                    "Use the URL and token above in your MCP client configuration.",
                ],
                snippetLabel: "",
                snippet: "",
            };
    }
}
export function LogheadDashboard({ apiUrl = "", apiToken = "", }) {
    const [projects, setProjects] = useState([]);
    const [streams, setStreams] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedStream, setSelectedStream] = useState(null);
    // Stream Token State
    const [streamToken, setStreamToken] = useState(null);
    const [streamTokenLoading, setStreamTokenLoading] = useState(false);
    const [streamTokenError, setStreamTokenError] = useState(null);
    const [streamTokenCopied, setStreamTokenCopied] = useState(false);
    // Logs State
    const [logs, setLogs] = useState("");
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const pollingInterval = useRef(null);
    const logContainerRef = useRef(null);
    // Connection state
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [connectionInfo, setConnectionInfo] = useState(null);
    const [activeConnectPlatform, setActiveConnectPlatform] = useState("claudeCode");
    const [copied, setCopied] = useState(false);
    const [apiUrlCopied, setApiUrlCopied] = useState(false);
    const [snippetCopied, setSnippetCopied] = useState(false);
    const [ingestionCopied, setIngestionCopied] = useState(false);
    // Dropdown states
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [isStreamOpen, setIsStreamOpen] = useState(false);
    // Creation states
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreateStreamOpen, setIsCreateStreamOpen] = useState(false);
    const [newStreamName, setNewStreamName] = useState("");
    const [newStreamType, setNewStreamType] = useState("http");
    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef(null);
    // Issue Grouping State
    const [viewMode, setViewMode] = useState("logs");
    const [issues, setIssues] = useState([]);
    const [issueFilter, setIssueFilter] = useState("open");
    const [expandedIssue, setExpandedIssue] = useState(null);
    const [issueDetails, setIssueDetails] = useState(null); // { issue: ..., logs: ... }
    // Rename & Delete State
    const [isRenameProjectOpen, setIsRenameProjectOpen] = useState(false);
    const [renameProjectName, setRenameProjectName] = useState("");
    const [renameProjectId, setRenameProjectId] = useState(null);
    const [isRenameStreamOpen, setIsRenameStreamOpen] = useState(false);
    const [renameStreamName, setRenameStreamName] = useState("");
    const [renameStreamId, setRenameStreamId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    // Auto-scroll effect
    useEffect(() => {
        if (isAutoScroll && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, isAutoScroll]);
    const apiFetch = async (path, options = {}) => {
        const url = `${apiUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
        const headers = { ...options.headers };
        if (apiToken) {
            headers["Authorization"] = `Bearer ${apiToken}`;
        }
        return fetch(url, { ...options, headers });
    };
    const fetchProjects = async () => {
        try {
            const res = await apiFetch("/api/projects");
            if (!res.ok)
                throw new Error("Failed to fetch projects");
            const data = await res.json();
            setProjects(data);
            if (data.length > 0 && !selectedProject) {
                setSelectedProject(data[0].id);
            }
        }
        catch (err) {
            console.error("Failed to fetch projects", err);
        }
    };
    const fetchStreams = async (projectId) => {
        try {
            const res = await apiFetch(`/api/streams?projectId=${projectId}`);
            if (!res.ok)
                throw new Error("Failed to fetch streams");
            const data = await res.json();
            setStreams(data);
            // Removed auto-selection to show grid view by default
            setSelectedStream(null);
        }
        catch (err) {
            console.error("Failed to fetch streams", err);
        }
    };
    const fetchStreamToken = async (streamId) => {
        setStreamTokenLoading(true);
        try {
            const res = await apiFetch(`/api/streams/${streamId}/token`);
            if (!res.ok)
                throw new Error("Failed to fetch token");
            const data = await res.json();
            setStreamToken(data.token);
            setStreamTokenError(null);
        }
        catch (err) {
            console.error("Failed to fetch stream token", err);
            setStreamTokenError(String(err));
            setStreamToken(null);
        }
        finally {
            setStreamTokenLoading(false);
        }
    };
    const fetchLogs = async (streamId) => {
        try {
            const res = await apiFetch(`/api/logs?streamId=${streamId}&limit=1000`);
            if (!res.ok) {
                console.error(`Failed to fetch logs: ${res.status} ${res.statusText}`);
                return;
            }
            const data = await res.json();
            if (!Array.isArray(data)) {
                console.error("Logs API returned non-array data:", data);
                return;
            }
            const parseTimestamp = (ts) => {
                if (!ts)
                    return new Date();
                if (!isNaN(Number(ts))) {
                    const num = Number(ts);
                    if (num > 1000000000000000)
                        return new Date(num / 1000000);
                    return new Date(num);
                }
                if (typeof ts === "string") {
                    if (ts.includes(" ") && !ts.includes("Z") && !ts.includes("+")) {
                        return new Date(ts.replace(" ", "T") + "Z");
                    }
                }
                return new Date(ts);
            };
            const sortedLogs = data.sort((a, b) => {
                return (parseTimestamp(a.timestamp).getTime() -
                    parseTimestamp(b.timestamp).getTime());
            });
            const logString = sortedLogs
                .map((log) => {
                const date = parseTimestamp(log.timestamp).toISOString();
                let metaString = "";
                if (log.metadata && Object.keys(log.metadata).length > 0) {
                    metaString = ` ${JSON.stringify(log.metadata)}`;
                }
                return `[${date}] ${log.content}${metaString}`;
            })
                .join("\n");
            setLogs(logString);
        }
        catch (err) {
            console.error("Failed to fetch logs", err);
        }
    };
    const fetchIssues = async (projectId) => {
        try {
            let url = `/api/issues?projectId=${projectId}`;
            if (issueFilter !== "all")
                url += `&status=${issueFilter}`;
            const res = await apiFetch(url);
            if (res.ok) {
                const data = await res.json();
                setIssues(data);
            }
        }
        catch (e) {
            console.error("Failed to fetch issues", e);
        }
    };
    const fetchIssueDetails = async (issueId) => {
        try {
            const res = await apiFetch(`/api/issues/${issueId}`);
            if (res.ok) {
                const data = await res.json();
                setIssueDetails(data);
            }
        }
        catch (e) {
            console.error("Failed to fetch issue details", e);
        }
    };
    const resolveIssue = async (issueId, newStatus) => {
        try {
            await apiFetch(`/api/issues/${issueId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            // Refresh
            if (selectedProject)
                fetchIssues(selectedProject);
            if (expandedIssue === issueId && issueDetails) {
                setIssueDetails({
                    ...issueDetails,
                    issue: { ...issueDetails.issue, status: newStatus },
                });
            }
        }
        catch (e) {
            console.error("Failed to resolve issue", e);
        }
    };
    const renameProject = async () => {
        const id = renameProjectId || selectedProject;
        if (!id || !renameProjectName.trim())
            return;
        try {
            const res = await apiFetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: renameProjectName }),
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            await fetchProjects();
            setIsRenameProjectOpen(false);
            setRenameProjectId(null);
        }
        catch (err) {
            console.error("Failed to rename project", err);
            alert("Failed to rename project: " + err);
        }
    };
    const renameStream = async () => {
        const id = renameStreamId || selectedStream;
        if (!id || !renameStreamName.trim())
            return;
        try {
            const res = await apiFetch(`/api/streams/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: renameStreamName }),
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            if (selectedProject)
                await fetchStreams(selectedProject);
            setIsRenameStreamOpen(false);
            setRenameStreamId(null);
        }
        catch (err) {
            console.error("Failed to rename stream", err);
            alert("Failed to rename stream: " + err);
        }
    };
    const confirmDelete = async () => {
        if (!deleteTarget)
            return;
        try {
            await apiFetch(`/api/${deleteTarget.type}s/${deleteTarget.id}`, {
                method: "DELETE",
            });
            if (deleteTarget.type === "project") {
                await fetchProjects();
                if (selectedProject === deleteTarget.id) {
                    setSelectedProject(null);
                    setStreams([]);
                    setLogs("");
                    setSelectedStream(null);
                }
            }
            else {
                if (selectedProject)
                    await fetchStreams(selectedProject);
                if (selectedStream === deleteTarget.id) {
                    setSelectedStream(null);
                    setLogs("");
                }
            }
            setDeleteTarget(null);
        }
        catch (err) {
            console.error("Failed to delete", err);
        }
    };
    useEffect(() => {
        if (viewMode === "issues" && selectedProject) {
            fetchIssues(selectedProject);
            const interval = setInterval(() => fetchIssues(selectedProject), 5000);
            return () => clearInterval(interval);
        }
    }, [viewMode, selectedProject, issueFilter]);
    useEffect(() => {
        if (expandedIssue) {
            fetchIssueDetails(expandedIssue);
        }
        else {
            setIssueDetails(null);
        }
    }, [expandedIssue]);
    const createProject = async () => {
        if (!newProjectName.trim())
            return;
        try {
            const res = await apiFetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newProjectName }),
            });
            if (!res.ok)
                throw new Error("Failed to create project");
            const data = await res.json();
            setProjects([...projects, data]);
            setSelectedProject(data.id);
            setNewProjectName("");
            setIsCreateProjectOpen(false);
            setIsProjectOpen(false);
        }
        catch (err) {
            console.error("Failed to create project", err);
        }
    };
    const createStream = async () => {
        if (!newStreamName.trim() || !selectedProject)
            return;
        try {
            const res = await apiFetch("/api/streams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: selectedProject,
                    name: newStreamName,
                    type: newStreamType,
                }),
            });
            if (!res.ok)
                throw new Error("Failed to create stream");
            const data = await res.json();
            setStreams([...streams, data]);
            setSelectedStream(data.id);
            setNewStreamName("");
            setIsCreateStreamOpen(false);
            setIsStreamOpen(false);
        }
        catch (err) {
            console.error("Failed to create stream", err);
        }
    };
    const fetchConnectionInfo = async () => {
        try {
            // NOTE: /api/connection needs to be implemented or we use a static placeholder/different mechanism
            // Cloud might not expose a single system-wide token easily.
            // For now, let's assume we fetch a personal access token or similar.
            // If the route doesn't exist, handle it gracefully.
            const res = await apiFetch("/api/connection");
            if (res.ok) {
                const data = await res.json();
                setConnectionInfo(data);
            }
            else {
                // Fallback or error
                setConnectionInfo({
                    token: "Unavailable",
                    mcpUrl: window.location.origin,
                });
            }
        }
        catch (err) {
            console.error("Failed to fetch connection info", err);
        }
    };
    useEffect(() => {
        fetchProjects();
    }, []);
    useEffect(() => {
        if (selectedProject) {
            fetchStreams(selectedProject);
            setIsProjectOpen(false);
        }
        else {
            setStreams([]);
        }
    }, [selectedProject]);
    useEffect(() => {
        if (selectedStream) {
            fetchStreamToken(selectedStream);
        }
        else {
            setStreamToken(null);
            setStreamTokenError(null);
            setStreamTokenLoading(false);
        }
    }, [selectedStream]);
    useEffect(() => {
        if (!selectedStream) {
            setLogs("");
            if (pollingInterval.current)
                clearInterval(pollingInterval.current);
            return;
        }
        if (searchQuery) {
            if (pollingInterval.current)
                clearInterval(pollingInterval.current);
            return;
        }
        fetchLogs(selectedStream);
        pollingInterval.current = setInterval(() => fetchLogs(selectedStream), 2000);
        return () => {
            if (pollingInterval.current)
                clearInterval(pollingInterval.current);
        };
    }, [selectedStream, searchQuery]);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === "Escape") {
                setIsProjectOpen(false);
                setIsStreamOpen(false);
                setIsCreateProjectOpen(false);
                setIsCreateStreamOpen(false);
                setIsConnectOpen(false);
                setIsRenameProjectOpen(false);
                setIsRenameStreamOpen(false);
                setDeleteTarget(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        if (!selectedStream) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await apiFetch(`/api/logs?streamId=${selectedStream}&q=${encodeURIComponent(searchQuery)}&limit=50`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(Array.isArray(data) ? data : []);
                }
            }
            catch (e) {
                console.error("Search failed", e);
            }
            finally {
                setIsSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedStream]);
    const copyToken = () => {
        if (connectionInfo?.token) {
            navigator.clipboard.writeText(connectionInfo.token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const copyStreamToken = () => {
        if (streamToken) {
            navigator.clipboard.writeText(streamToken);
            setStreamTokenCopied(true);
            setTimeout(() => setStreamTokenCopied(false), 2000);
        }
    };
    const currentProject = projects.find((p) => p.id === selectedProject);
    const currentStream = streams.find((s) => s.id === selectedStream);
    const apiBaseUrl = normalizeApiBaseUrl(apiUrl ||
        connectionInfo?.mcpUrl ||
        (typeof window !== "undefined" ? window.location.origin : ""));
    const ingestionUrl = apiBaseUrl;
    const ingestionCommand = streamToken && ingestionUrl
        ? getIngestionCommand(ingestionUrl, streamToken)
        : "";
    const activeGuide = getConnectGuide(activeConnectPlatform, apiBaseUrl || "https://your-loghead-domain.com", connectionInfo?.token || "<YOUR_MCP_TOKEN>");
    return (_jsxs("div", { className: "min-h-screen w-full bg-zinc-950 text-gray-100 flex flex-col", children: [_jsx("div", { className: "sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm", children: _jsxs("div", { className: "mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => {
                                                setIsProjectOpen(!isProjectOpen);
                                                setIsStreamOpen(false);
                                            }, className: "flex items-center gap-2 hover:bg-zinc-900 pl-2 pr-3 py-2 rounded-md transition-colors", children: [_jsx("div", { className: "w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center", children: _jsx(LayoutGrid, { className: "w-4 h-4" }) }), _jsx("span", { className: "font-medium text-sm", children: currentProject?.name || "Select Project" }), _jsx(ChevronDown, { className: "w-4 h-4 text-zinc-500" })] }), isProjectOpen && (_jsxs("div", { className: "absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100", children: [_jsx("div", { className: "px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider", children: "Projects" }), _jsxs("div", { className: "max-h-60 overflow-y-auto", children: [projects.map((p) => (_jsxs("div", { onClick: () => setSelectedProject(p.id), className: cn("group relative flex items-center justify-between px-3 py-2 hover:bg-zinc-800 transition-colors cursor-pointer text-sm", selectedProject === p.id
                                                                ? "text-emerald-400"
                                                                : "text-zinc-300"), children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]", children: p.name.charAt(0).toUpperCase() }), _jsx("span", { className: "truncate max-w-[140px]", children: p.name })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: (e) => {
                                                                                e.stopPropagation();
                                                                                setRenameProjectId(p.id);
                                                                                setRenameProjectName(p.name);
                                                                                setIsRenameProjectOpen(true);
                                                                                setIsProjectOpen(false);
                                                                            }, className: "p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white", children: _jsx(Pencil, { className: "w-3 h-3" }) }), _jsx("button", { onClick: (e) => {
                                                                                e.stopPropagation();
                                                                                setDeleteTarget({
                                                                                    type: "project",
                                                                                    id: p.id,
                                                                                    name: p.name,
                                                                                });
                                                                                setIsProjectOpen(false);
                                                                            }, className: "p-1 hover:bg-red-900/50 rounded text-zinc-400 hover:text-red-400", children: _jsx(Trash, { className: "w-3 h-3" }) })] })] }, p.id))), projects.length === 0 && (_jsx("div", { className: "px-3 py-2 text-sm text-zinc-500", children: "No projects found" }))] }), _jsx("div", { className: "border-t border-zinc-800 mt-1 pt-1 p-2", children: _jsxs("button", { onClick: () => {
                                                            setIsCreateProjectOpen(true);
                                                            setIsProjectOpen(false);
                                                        }, className: "w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-sm", children: [_jsx(Plus, { className: "w-4 h-4" }), "Create Project"] }) })] }))] }), selectedProject && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-zinc-600", children: "/" }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => {
                                                        setIsStreamOpen(!isStreamOpen);
                                                        setIsProjectOpen(false);
                                                    }, className: "flex items-center gap-2 hover:bg-zinc-900 pl-2 pr-3 py-2 rounded-md transition-colors", children: [_jsx("div", { className: "w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center", children: _jsx(Activity, { className: "w-4 h-4" }) }), _jsx("span", { className: "font-medium text-sm", children: currentStream?.name || "Select Stream" }), _jsx(ChevronDown, { className: "w-4 h-4 text-zinc-500" })] }), isStreamOpen && (_jsxs("div", { className: "absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100", children: [_jsx("div", { className: "px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider", children: "Streams" }), _jsxs("div", { className: "max-h-60 overflow-y-auto", children: [streams.map((s) => (_jsxs("div", { onClick: () => {
                                                                        setSelectedStream(s.id);
                                                                        setIsStreamOpen(false);
                                                                    }, className: cn("group relative flex items-center justify-between px-3 py-2 hover:bg-zinc-800 transition-colors cursor-pointer text-sm", selectedStream === s.id
                                                                        ? "text-emerald-400"
                                                                        : "text-zinc-300"), children: [_jsxs("div", { className: "flex items-center gap-2 overflow-hidden", children: [_jsx("div", { className: "w-4 h-4 rounded border border-current flex items-center justify-center text-[10px] shrink-0", children: _jsx(Box, { className: "w-3 h-3" }) }), _jsx("span", { className: "truncate", children: s.name })] }), _jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0", children: [_jsx("button", { onClick: (e) => {
                                                                                        e.stopPropagation();
                                                                                        setRenameStreamId(s.id);
                                                                                        setRenameStreamName(s.name);
                                                                                        setIsRenameStreamOpen(true);
                                                                                        setIsStreamOpen(false);
                                                                                    }, className: "p-1.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-all shadow-sm", children: _jsx(Pencil, { className: "w-3 h-3" }) }), _jsx("button", { onClick: (e) => {
                                                                                        e.stopPropagation();
                                                                                        setDeleteTarget({
                                                                                            type: "stream",
                                                                                            id: s.id,
                                                                                            name: s.name,
                                                                                        });
                                                                                        setIsStreamOpen(false);
                                                                                    }, className: "p-1.5 bg-zinc-900 border border-zinc-700 hover:bg-red-600/20 hover:border-red-500/50 rounded-md text-zinc-400 hover:text-red-400 transition-all shadow-sm", children: _jsx(Trash, { className: "w-3 h-3" }) })] })] }, s.id))), streams.length === 0 && (_jsx("div", { className: "px-3 py-2 text-sm text-zinc-500", children: "No streams found" }))] }), _jsx("div", { className: "border-t border-zinc-800 mt-1 pt-1 p-2", children: _jsxs("button", { onClick: () => {
                                                                    setIsCreateStreamOpen(true);
                                                                    setIsStreamOpen(false);
                                                                }, className: "w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-sm", children: [_jsx(Plus, { className: "w-4 h-4" }), "Create Stream"] }) })] }))] })] }))] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("button", { onClick: () => {
                                    fetchConnectionInfo();
                                    setIsConnectOpen(true);
                                }, className: "flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition-colors border border-emerald-500/50", children: [_jsx(Plug, { className: "w-4 h-4" }), "Connect"] }) })] }) }), _jsx("div", { className: "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-3 sm:px-6 sm:py-4", children: selectedProject ? (_jsxs("div", { className: "h-full flex flex-col space-y-3", children: [currentStream && (_jsx("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 shrink-0", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[minmax(220px,auto)_1fr] gap-x-6 gap-y-2 items-center", children: [_jsx("div", { className: "text-xs font-semibold text-zinc-500 uppercase tracking-wider", children: "Stream ID" }), _jsx("div", { className: "text-xs font-semibold text-zinc-500 uppercase tracking-wider", children: "Stream Token" }), _jsx("div", { className: "text-sm font-mono text-zinc-300 truncate", title: currentStream.id, children: currentStream.id }), _jsxs("div", { className: "min-w-0", children: [streamTokenLoading && (_jsx("div", { className: "text-sm text-zinc-500 animate-pulse", children: "Loading stream token..." })), streamTokenError && (_jsxs("div", { className: "text-sm text-red-500", children: ["Error loading token: ", streamTokenError] })), streamToken && (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("div", { className: "flex-1 min-w-0 text-sm font-mono text-zinc-300 truncate", title: streamToken, children: streamToken }), _jsx("button", { onClick: copyStreamToken, className: "p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors", title: "Copy Stream Token", children: streamTokenCopied ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(Copy, { className: "w-4 h-4" })) })] }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: "CLI Ingestion Command" }), _jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("div", { className: "flex-1 min-w-0 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 truncate", title: ingestionCommand, children: ingestionCommand }), _jsx("button", { onClick: () => {
                                                                            navigator.clipboard.writeText(ingestionCommand);
                                                                            setIngestionCopied(true);
                                                                            setTimeout(() => setIngestionCopied(false), 2000);
                                                                        }, className: "p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors", title: "Copy CLI command", children: ingestionCopied ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(Copy, { className: "w-4 h-4" })) })] })] })] }))] })] }) })), _jsxs("div", { className: "flex items-center gap-6 border-b border-zinc-800 px-2", children: [_jsx("button", { onClick: () => setViewMode("logs"), className: cn("px-1 py-3 text-sm font-medium border-b-2 transition-colors", viewMode === "logs"
                                        ? "border-emerald-500 text-white"
                                        : "border-transparent text-zinc-400 hover:text-zinc-200"), children: "Logs" }), _jsx("button", { onClick: () => setViewMode("issues"), className: cn("px-1 py-3 text-sm font-medium border-b-2 transition-colors", viewMode === "issues"
                                        ? "border-emerald-500 text-white"
                                        : "border-transparent text-zinc-400 hover:text-zinc-200"), children: "Issues" })] }), viewMode === "logs" ? (currentStream ? (_jsx("div", { className: "flex-1 flex flex-col space-y-4 min-h-0", children: _jsxs("div", { className: "flex-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col min-h-0", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950", children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1 max-w-xl", children: [_jsx("button", { onClick: () => setSelectedStream(null), className: "mr-2 p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors", title: "Back to all streams", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsx(Search, { className: "w-4 h-4 text-zinc-500 shrink-0" }), _jsx("input", { ref: searchInputRef, value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search logs (Cmd/Ctrl+K)", className: "w-full bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-500" }), searchQuery && (_jsx("button", { onClick: () => setSearchQuery(""), className: "text-xs text-zinc-500 hover:text-white shrink-0", children: "Clear" }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: async () => {
                                                            try {
                                                                const res = await apiFetch("/api/ingest", {
                                                                    method: "POST",
                                                                    headers: {
                                                                        "Content-Type": "application/json",
                                                                        Authorization: `Bearer ${streamToken}`,
                                                                    },
                                                                    body: JSON.stringify({
                                                                        streamId: currentStream.id,
                                                                        logs: [
                                                                            `Test log entry at ${new Date().toISOString()}`,
                                                                        ],
                                                                    }),
                                                                });
                                                                if (res.ok) {
                                                                    console.log("Test log sent");
                                                                    fetchLogs(currentStream.id);
                                                                }
                                                                else {
                                                                    console.error("Failed to send test log", await res.text());
                                                                }
                                                            }
                                                            catch (e) {
                                                                console.error("Error sending test log", e);
                                                            }
                                                        }, className: "text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition-colors", children: "Send Test Log" }), _jsx("button", { onClick: () => setIsAutoScroll(!isAutoScroll), className: cn("text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider border transition-colors", isAutoScroll
                                                            ? "border-emerald-500/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                                                            : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-300"), children: isAutoScroll ? "Auto-scroll On" : "Auto-scroll Off" })] })] }), _jsx("div", { ref: logContainerRef, className: "flex-1 bg-[#0d0d0d] font-mono text-sm overflow-y-auto p-4 scroll-smooth", children: _jsx(ErrorBoundary, { children: searchQuery ? (isSearching ? (_jsx("div", { className: "text-zinc-500", children: "Searching..." })) : searchResults.length > 0 ? (_jsx("div", { className: "space-y-3", children: searchResults.map((result, idx) => (_jsxs("div", { className: "rounded border border-zinc-800 bg-zinc-950/60 p-3", children: [_jsx("div", { className: "text-xs text-zinc-500 mb-1", children: new Date(result.timestamp).toISOString() }), _jsx("div", { className: "text-zinc-200 break-words", children: highlightText(result.content, searchQuery) })] }, `${result.timestamp}-${idx}`))) })) : (_jsx("div", { className: "text-zinc-500", children: "No matching logs found." }))) : logs ? (_jsx("pre", { className: "whitespace-pre-wrap text-zinc-300 break-all font-mono leading-relaxed text-xs", children: logs })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-zinc-700 italic", children: [_jsx(Activity, { className: "w-8 h-8 mb-2 opacity-50" }), _jsx("p", { children: "Waiting for logs..." })] })) }) })] }) })) : (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [streams.map((stream) => (_jsxs("div", { className: "group relative bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all", children: [_jsxs("button", { onClick: () => setSelectedStream(stream.id), className: "w-full text-left p-4 h-full", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "p-2 rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700 group-hover:text-white transition-colors", children: _jsx(Box, { className: "w-5 h-5" }) }), _jsx("span", { className: "text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700", children: stream.type })] }), _jsx("div", { className: "font-medium text-white group-hover:text-emerald-400 transition-colors", children: stream.name }), _jsxs("div", { className: "text-xs text-zinc-500 mt-1 font-mono", children: [stream.id.substring(0, 8), "..."] })] }), _jsxs("div", { className: "absolute bottom-2 right-2 flex gap-1 z-10", children: [_jsx("button", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        setRenameStreamId(stream.id);
                                                        setRenameStreamName(stream.name);
                                                        setIsRenameStreamOpen(true);
                                                    }, className: "p-1 bg-zinc-800/80 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx("button", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        setDeleteTarget({
                                                            type: "stream",
                                                            id: stream.id,
                                                            name: stream.name,
                                                        });
                                                    }, className: "p-1 bg-zinc-800/80 hover:bg-red-900/50 rounded text-zinc-400 hover:text-red-400 transition-colors", children: _jsx(Trash, { className: "w-4 h-4" }) })] })] }, stream.id))), _jsxs("button", { onClick: () => setIsCreateStreamOpen(true), className: "group flex flex-col items-center justify-center p-4 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl transition-all hover:bg-zinc-900/20 text-zinc-500 hover:text-zinc-300", children: [_jsx(Plus, { className: "w-6 h-6 mb-2 opacity-50 group-hover:opacity-100" }), _jsx("span", { className: "text-sm font-medium", children: "Create New Stream" })] })] }))) : (_jsx("div", { className: "flex-1 min-h-0 flex flex-col", children: _jsxs("div", { className: "flex-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col min-h-0", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950", children: [_jsxs("h2", { className: "text-sm font-semibold flex items-center gap-2 text-zinc-300", children: [_jsx("span", { className: "text-emerald-400", children: "\u25CF" }), "Issues (", issues.filter((i) => i.status === "open").length, " ", "active)"] }), _jsxs("div", { className: "flex bg-zinc-900 rounded-lg p-1 border border-zinc-800", children: [_jsx("button", { onClick: () => setIssueFilter("all"), className: cn("px-3 py-1 text-xs font-medium rounded transition-colors", issueFilter === "all"
                                                            ? "bg-zinc-700 text-white"
                                                            : "text-zinc-400 hover:text-white"), children: "All" }), _jsx("button", { onClick: () => setIssueFilter("open"), className: cn("px-3 py-1 text-xs font-medium rounded transition-colors", issueFilter === "open"
                                                            ? "bg-zinc-700 text-white"
                                                            : "text-zinc-400 hover:text-white"), children: "Open" }), _jsx("button", { onClick: () => setIssueFilter("resolved"), className: cn("px-3 py-1 text-xs font-medium rounded transition-colors", issueFilter === "resolved"
                                                            ? "bg-zinc-700 text-white"
                                                            : "text-zinc-400 hover:text-white"), children: "Resolved" })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto space-y-2 p-4", children: issues.length === 0 ? (_jsx("div", { className: "text-center py-12 text-zinc-500 italic", children: "No issues found." })) : (issues.map((issue) => (_jsxs("div", { className: "border border-zinc-800 bg-zinc-900/40 rounded-lg overflow-hidden", children: [_jsxs("div", { className: cn("p-4 cursor-pointer hover:bg-zinc-900/60 transition-colors flex items-start gap-4 border-l-4", issue.status === "open"
                                                        ? "border-l-red-500"
                                                        : "border-l-emerald-500"), onClick: () => setExpandedIssue(expandedIssue === issue.id ? null : issue.id), children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [issue.status === "open" ? (_jsx("span", { className: "text-xs font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase", children: "Error" })) : (_jsx("span", { className: "text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase", children: "Resolved" })), _jsx("h3", { className: "font-mono text-sm font-medium text-zinc-200 truncate", children: issue.title })] }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-zinc-500", children: [_jsxs("span", { children: ["Occurrences:", " ", _jsx("strong", { className: "text-zinc-300", children: issue.occurrence_count })] }), _jsxs("span", { children: ["First seen:", " ", new Date(issue.first_seen).toLocaleString()] }), _jsxs("span", { children: ["Last seen:", " ", new Date(issue.last_seen).toLocaleString()] })] })] }), _jsx(ChevronDown, { className: cn("w-5 h-5 text-zinc-600 transition-transform", expandedIssue === issue.id ? "rotate-180" : "") })] }), expandedIssue === issue.id && (_jsxs("div", { className: "border-t border-zinc-800 bg-zinc-950 p-4 animate-in slide-in-from-top-2 duration-200", children: [_jsx("div", { className: "flex justify-end mb-4", children: issue.status === "open" ? (_jsx("button", { onClick: () => resolveIssue(issue.id, "resolved"), className: "px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors", children: "Mark as Resolved" })) : (_jsx("button", { onClick: () => resolveIssue(issue.id, "open"), className: "px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded transition-colors", children: "Reopen Issue" })) }), _jsx("div", { className: "text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: "Recent Occurrences" }), _jsxs("div", { className: "space-y-1 font-mono text-xs", children: [issueDetails?.logs?.map((log) => (_jsxs("div", { className: "bg-zinc-900/50 p-2 rounded text-zinc-400 break-all", children: [_jsxs("span", { className: "text-zinc-600 mr-2", children: ["[", new Date(log.timestamp).toISOString(), "]"] }), log.content] }, log.id))), !issueDetails && (_jsx("div", { className: "text-zinc-600 italic", children: "Loading logs..." }))] })] }))] }, issue.id)))) })] }) }))] })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center space-y-6", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center", children: _jsx(LayoutGrid, { className: "w-8 h-8 text-zinc-500" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-white mb-2", children: "No Project Selected" }), _jsx("p", { className: "text-zinc-400 max-w-sm", children: "Select a project from the top menu or create a new one to get started with Loghead." })] }), _jsx("button", { onClick: () => setIsCreateProjectOpen(true), className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium transition-colors", children: "Create Project" })] })) }), isCreateProjectOpen && (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "p-4 border-b border-zinc-800 flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Create Project" }), _jsx("button", { onClick: () => setIsCreateProjectOpen(false), className: "text-zinc-500 hover:text-white transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: "Project Name" }), _jsx("input", { type: "text", value: newProjectName, onChange: (e) => setNewProjectName(e.target.value), placeholder: "e.g., My Awesome App", className: "w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && createProject() })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setIsCreateProjectOpen(false), className: "px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors", children: "Cancel" }), _jsx("button", { onClick: createProject, disabled: !newProjectName.trim(), className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors", children: "Create Project" })] })] })] }) })), isCreateStreamOpen && (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "p-4 border-b border-zinc-800 flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Create Stream" }), _jsx("button", { onClick: () => setIsCreateStreamOpen(false), className: "text-zinc-500 hover:text-white transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: "Stream Name" }), _jsx("input", { type: "text", value: newStreamName, onChange: (e) => setNewStreamName(e.target.value), placeholder: "e.g., Production Logs", className: "w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && createStream() })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: "Type" }), _jsxs("select", { value: newStreamType, onChange: (e) => setNewStreamType(e.target.value), className: "w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors", children: [_jsx("option", { value: "browser", children: "Browser" }), _jsx("option", { value: "docker", children: "Docker" }), _jsx("option", { value: "terminal", children: "Terminal" }), _jsx("option", { value: "opentelemetry", children: "OpenTelemetry" }), _jsx("option", { value: "aws", children: "AWS" })] })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setIsCreateStreamOpen(false), className: "px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors", children: "Cancel" }), _jsx("button", { onClick: createStream, disabled: !newStreamName.trim(), className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors", children: "Create Stream" })] })] })] }) })), isRenameProjectOpen && (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "p-4 border-b border-zinc-800 flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Rename Project" }), _jsx("button", { onClick: () => setIsRenameProjectOpen(false), className: "text-zinc-500 hover:text-white transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: "New Name" }), _jsx("input", { type: "text", value: renameProjectName, onChange: (e) => setRenameProjectName(e.target.value), placeholder: "Project Name", className: "w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && renameProject() })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setIsRenameProjectOpen(false), className: "px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors", children: "Cancel" }), _jsx("button", { onClick: renameProject, disabled: !renameProjectName.trim(), className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors", children: "Rename" })] })] })] }) })), isRenameStreamOpen && (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "p-4 border-b border-zinc-800 flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Rename Stream" }), _jsx("button", { onClick: () => setIsRenameStreamOpen(false), className: "text-zinc-500 hover:text-white transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: "New Name" }), _jsx("input", { type: "text", value: renameStreamName, onChange: (e) => setRenameStreamName(e.target.value), placeholder: "Stream Name", className: "w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && renameStream() })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setIsRenameStreamOpen(false), className: "px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors", children: "Cancel" }), _jsx("button", { onClick: renameStream, disabled: !renameStreamName.trim(), className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors", children: "Rename" })] })] })] }) })), deleteTarget && (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200", children: [_jsx("div", { className: "p-4 border-b border-zinc-800", children: _jsxs("h3", { className: "font-semibold text-lg text-red-500 flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), "Delete ", deleteTarget.type === "project" ? "Project" : "Stream"] }) }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("p", { className: "text-zinc-300 text-sm", children: ["Are you sure you want to delete", " ", _jsxs("span", { className: "font-bold text-white", children: ["\"", deleteTarget.name, "\""] }), "? This action cannot be undone."] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setDeleteTarget(null), className: "px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors", children: "Cancel" }), _jsx("button", { onClick: confirmDelete, className: "px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-medium text-white transition-colors", children: "Delete" })] })] })] }) })), isConnectOpen && (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "p-4 border-b border-zinc-800 flex items-center justify-between", children: [_jsxs("h3", { className: "font-semibold text-lg flex items-center gap-2", children: [_jsx(Plug, { className: "w-5 h-5 text-green-500" }), "Connect to Loghead"] }), _jsx("button", { onClick: () => setIsConnectOpen(false), className: "text-zinc-500 hover:text-white transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "flex divide-x divide-zinc-800 max-h-[70vh]", children: [_jsxs("div", { className: "p-6 space-y-6 w-80 shrink-0 overflow-y-auto", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: "Loghead API URL" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "bg-zinc-950 border border-zinc-800 rounded p-3 text-sm font-mono text-zinc-300 break-all pr-12 min-h-[60px]", children: apiBaseUrl || "Loading..." }), _jsx("button", { onClick: () => {
                                                                if (apiBaseUrl) {
                                                                    navigator.clipboard.writeText(apiBaseUrl);
                                                                    setApiUrlCopied(true);
                                                                    setTimeout(() => setApiUrlCopied(false), 2000);
                                                                }
                                                            }, className: "absolute top-2 right-2 p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors", title: "Copy URL", children: apiUrlCopied ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(Copy, { className: "w-4 h-4" })) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: "Authentication Token" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "bg-zinc-950 border border-zinc-800 rounded p-3 text-sm font-mono text-zinc-300 break-all pr-12 min-h-[60px]", children: connectionInfo?.token || "Loading..." }), _jsx("button", { onClick: copyToken, className: "absolute top-2 right-2 p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors", title: "Copy Token", children: copied ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(Copy, { className: "w-4 h-4" })) })] }), _jsx("p", { className: "text-xs text-zinc-500 mt-2", children: "Use this token to authenticate your MCP client in the selected platform." })] })] }), _jsxs("div", { className: "p-6 flex-1 overflow-y-auto", children: [_jsx("div", { className: "text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3", children: "Setup Instructions" }), _jsxs("div", { className: "bg-zinc-950/40 border border-zinc-800 rounded-lg overflow-hidden", children: [_jsx("div", { className: "grid grid-cols-3 sm:grid-cols-6 border-b border-zinc-800", children: CONNECT_PLATFORM_TABS.map((tab) => (_jsx("button", { onClick: () => setActiveConnectPlatform(tab.id), className: cn("px-3 py-2 text-xs font-medium transition-colors border-b-2", activeConnectPlatform === tab.id
                                                            ? "text-white bg-zinc-900 border-green-500"
                                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border-transparent"), children: tab.label }, tab.id))) }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsx("div", { className: "text-sm font-semibold text-zinc-100", children: activeGuide.title }), _jsx("ol", { className: "list-decimal list-inside space-y-1 text-xs text-zinc-400", children: activeGuide.steps.map((step, index) => (_jsx("li", { children: step }, `${activeConnectPlatform}-${index}`))) }), activeGuide.snippet && (_jsxs("div", { className: "relative group", children: [_jsx("div", { className: "text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2", children: activeGuide.snippetLabel }), _jsxs("div", { className: "relative", children: [_jsx("pre", { className: "bg-zinc-950 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 whitespace-pre-wrap break-words pr-12", children: activeGuide.snippet }), _jsx("button", { onClick: () => {
                                                                                navigator.clipboard.writeText(activeGuide.snippet);
                                                                                setSnippetCopied(true);
                                                                                setTimeout(() => setSnippetCopied(false), 2000);
                                                                            }, className: "absolute top-2 right-2 p-1.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100", title: "Copy snippet", children: snippetCopied ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(Copy, { className: "w-4 h-4" })) })] })] }))] })] })] })] }), _jsx("div", { className: "p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-end", children: _jsx("button", { onClick: () => setIsConnectOpen(false), className: "px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium transition-colors", children: "Done" }) })] }) }))] }));
}
