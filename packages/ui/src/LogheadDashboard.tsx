"use client";

import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from "react";
import {
  Activity,
  ChevronDown,
  Box,
  LayoutGrid,
  Plug,
  Copy,
  Check,
  X,
  Plus,
  AlertCircle,
  Search,
} from "lucide-react";
import { cn } from "./utils";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-500 bg-gray-900 rounded-lg border border-red-900 m-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-sm font-mono bg-black/50 p-4 rounded text-left overflow-auto max-h-48">
            {this.state.error?.toString()}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-900/50 hover:bg-red-900 rounded text-white text-sm"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-500/20 text-yellow-200 rounded px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

// Types
interface Project {
  id: string;
  name: string;
}

interface Stream {
  id: string;
  name: string;
  type: string;
}

interface LogEntry {
  id?: string;
  stream_id: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface SearchResultEntry {
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface ConnectionInfo {
  token: string;
  mcpUrl: string;
}

type ConnectPlatform =
  | "claudeCode"
  | "windsurf"
  | "cursor"
  | "claudeDesktop"
  | "vscode";

const CONNECT_PLATFORM_TABS: { id: ConnectPlatform; label: string }[] = [
  { id: "claudeCode", label: "Claude Code" },
  { id: "windsurf", label: "Windsurf" },
  { id: "cursor", label: "Cursor" },
  { id: "claudeDesktop", label: "Claude Desktop" },
  { id: "vscode", label: "VS Code" },
];

function normalizeApiBaseUrl(url: string): string {
  let normalized = (url || "").trim();
  if (!normalized) return "";

  if (normalized.endsWith("/")) normalized = normalized.slice(0, -1);
  if (normalized.endsWith("/sse")) normalized = normalized.slice(0, -4);
  if (normalized.endsWith("/api")) normalized = normalized.slice(0, -4);

  return normalized;
}

function sharedMcpJson(apiUrl: string, token: string): string {
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

function getConnectGuide(platform: ConnectPlatform, apiUrl: string, token: string) {
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
    default:
      return {
        title: "Setup",
        steps: ["Use the URL and token above in your MCP client configuration."],
        snippetLabel: "",
        snippet: "",
      };
  }
}

export function LogheadDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  // Stream Token State
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [streamTokenLoading, setStreamTokenLoading] = useState(false);
  const [streamTokenError, setStreamTokenError] = useState<string | null>(null);
  const [streamTokenCopied, setStreamTokenCopied] = useState(false);

  // Logs State
  const [logs, setLogs] = useState<string>("");
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Connection state
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [activeConnectPlatform, setActiveConnectPlatform] =
    useState<ConnectPlatform>("claudeCode");
  const [copied, setCopied] = useState(false);

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
  const [searchResults, setSearchResults] = useState<SearchResultEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  const fetchStreams = async (projectId: string) => {
    try {
      const res = await fetch(`/api/streams?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch streams");
      const data = await res.json();
      setStreams(data);
      if (data.length > 0) {
        setSelectedStream(data[0].id);
      } else {
        setSelectedStream(null);
      }
    } catch (err) {
      console.error("Failed to fetch streams", err);
    }
  };

  const fetchStreamToken = async (streamId: string) => {
    setStreamTokenLoading(true);
    try {
      const res = await fetch(`/api/streams/${streamId}/token`);
      if (!res.ok) throw new Error("Failed to fetch token");
      const data = await res.json();
      setStreamToken(data.token);
      setStreamTokenError(null);
    } catch (err) {
      console.error("Failed to fetch stream token", err);
      setStreamTokenError(String(err));
      setStreamToken(null);
    } finally {
      setStreamTokenLoading(false);
    }
  };

  const fetchLogs = async (streamId: string) => {
    try {
      const res = await fetch(`/api/logs?streamId=${streamId}&limit=1000`);
      if (!res.ok) {
        console.error(`Failed to fetch logs: ${res.status} ${res.statusText}`);
        return;
      }
      const data: LogEntry[] = await res.json();

      if (!Array.isArray(data)) {
        console.error("Logs API returned non-array data:", data);
        return;
      }

      const parseTimestamp = (ts: string | number) => {
        if (!ts) return new Date();
        if (!isNaN(Number(ts))) {
          const num = Number(ts);
          if (num > 1000000000000000) return new Date(num / 1000000);
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
        return (
          parseTimestamp(a.timestamp).getTime() -
          parseTimestamp(b.timestamp).getTime()
        );
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
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const data = await res.json();
      setProjects([...projects, data]);
      setSelectedProject(data.id);
      setNewProjectName("");
      setIsCreateProjectOpen(false);
      setIsProjectOpen(false);
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const createStream = async () => {
    if (!newStreamName.trim() || !selectedProject) return;
    try {
      const res = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          name: newStreamName,
          type: newStreamType,
        }),
      });
      if (!res.ok) throw new Error("Failed to create stream");
      const data = await res.json();
      setStreams([...streams, data]);
      setSelectedStream(data.id);
      setNewStreamName("");
      setIsCreateStreamOpen(false);
      setIsStreamOpen(false);
    } catch (err) {
      console.error("Failed to create stream", err);
    }
  };

  const fetchConnectionInfo = async () => {
    try {
      // NOTE: /api/connection needs to be implemented or we use a static placeholder/different mechanism
      // Cloud might not expose a single system-wide token easily.
      // For now, let's assume we fetch a personal access token or similar.
      // If the route doesn't exist, handle it gracefully.
      const res = await fetch("/api/connection");
      if (res.ok) {
        const data = await res.json();
        setConnectionInfo(data);
      } else {
        // Fallback or error
        setConnectionInfo({ token: "Unavailable", mcpUrl: window.location.origin });
      }
    } catch (err) {
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
    } else {
      setStreams([]);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedStream) {
      fetchStreamToken(selectedStream);
    } else {
      setStreamToken(null);
      setStreamTokenError(null);
      setStreamTokenLoading(false);
    }
  }, [selectedStream]);

  useEffect(() => {
    if (!selectedStream) {
      setLogs("");
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      return;
    }

    if (searchQuery) {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      return;
    }

    fetchLogs(selectedStream);
    pollingInterval.current = setInterval(
      () => fetchLogs(selectedStream),
      2000,
    );

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [selectedStream, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
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
        const res = await fetch(
          `/api/logs?streamId=${selectedStream}&q=${encodeURIComponent(searchQuery)}&limit=50`,
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Search failed", e);
      } finally {
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
  const apiBaseUrl = normalizeApiBaseUrl(
    connectionInfo?.mcpUrl ||
    (typeof window !== "undefined" ? window.location.origin : "")
  );
  const activeGuide = getConnectGuide(
    activeConnectPlatform,
    apiBaseUrl || "https://your-loghead-domain.com",
    connectionInfo?.token || "<YOUR_MCP_TOKEN>"
  );

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-gray-100 flex flex-col">
      {/* Header / Toolbar */}
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Project Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProjectOpen(!isProjectOpen);
                  setIsStreamOpen(false);
                }}
                className="flex items-center gap-2 hover:bg-zinc-900 pl-2 pr-3 py-2 rounded-md transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">{currentProject?.name || "Select Project"}</span>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </button>

              {isProjectOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Projects
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProject(p.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors text-sm",
                          selectedProject === p.id ? "text-emerald-400" : "text-zinc-300"
                        )}
                      >
                        <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        {p.name}
                      </button>
                    ))}
                    {projects.length === 0 && (
                      <div className="px-3 py-2 text-sm text-zinc-500">
                        No projects found
                      </div>
                    )}
                  </div>
                  <div className="border-t border-zinc-800 mt-1 pt-1 p-2">
                    <button
                      onClick={() => {
                        setIsCreateProjectOpen(true);
                        setIsProjectOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Project
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedProject && (
              <>
                <span className="text-zinc-600">/</span>

                {/* Stream Selector */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsStreamOpen(!isStreamOpen);
                      setIsProjectOpen(false);
                    }}
                    className="flex items-center gap-2 hover:bg-zinc-900 pl-2 pr-3 py-2 rounded-md transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{currentStream?.name || "Select Stream"}</span>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </button>

                  {isStreamOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Streams
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {streams.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSelectedStream(s.id);
                              setIsStreamOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors text-sm",
                              selectedStream === s.id ? "text-emerald-400" : "text-zinc-300"
                            )}
                          >
                            <div className="w-4 h-4 rounded border border-current flex items-center justify-center text-[10px]">
                              <Box className="w-3 h-3" />
                            </div>
                            {s.name}
                          </button>
                        ))}
                        {streams.length === 0 && (
                          <div className="px-3 py-2 text-sm text-zinc-500">
                            No streams found
                          </div>
                        )}
                      </div>
                      <div className="border-t border-zinc-800 mt-1 pt-1 p-2">
                        <button
                          onClick={() => {
                            setIsCreateStreamOpen(true);
                            setIsStreamOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Create Stream
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchConnectionInfo();
                setIsConnectOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition-colors border border-emerald-500/50"
            >
              <Plug className="w-4 h-4" />
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
        {selectedProject ? (
          <div className="h-full flex flex-col space-y-6">
            {currentStream ? (
              <div className="flex-1 flex flex-col space-y-4 min-h-0">
                {/* Stream Identity + Token */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,auto)_1fr] gap-x-6 gap-y-2 items-center">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stream ID</div>
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stream Token</div>

                    <div className="text-sm font-mono text-zinc-300 truncate" title={currentStream.id}>
                      {currentStream.id}
                    </div>

                    <div className="min-w-0">
                      {streamTokenLoading && (
                        <div className="text-sm text-zinc-500 animate-pulse">Loading stream token...</div>
                      )}

                      {streamTokenError && (
                        <div className="text-sm text-red-500">Error loading token: {streamTokenError}</div>
                      )}

                      {streamToken && (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex-1 min-w-0 text-sm font-mono text-zinc-300 truncate" title={streamToken}>
                            {streamToken}
                          </div>
                          <button
                            onClick={copyStreamToken}
                            className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                            title="Copy Stream Token"
                          >
                            {streamTokenCopied ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col min-h-0">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950">
                    <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xl">
                      <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                      <input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search logs (Cmd/Ctrl+K)"
                        className="w-full bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-xs text-zinc-500 hover:text-white shrink-0"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/ingest", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${streamToken}`,
                              },
                              body: JSON.stringify({
                                streamId: currentStream.id,
                                logs: [`Test log entry at ${new Date().toISOString()}`],
                              }),
                            });
                            if (res.ok) {
                              console.log("Test log sent");
                              fetchLogs(currentStream.id);
                            } else {
                              console.error("Failed to send test log", await res.text());
                            }
                          } catch (e) {
                            console.error("Error sending test log", e);
                          }
                        }}
                        className="text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition-colors"
                      >
                        Send Test Log
                      </button>
                      <button
                        onClick={() => setIsAutoScroll(!isAutoScroll)}
                        className={cn(
                          "text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider border transition-colors",
                          isAutoScroll
                            ? "border-emerald-500/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                            : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                        )}
                      >
                        {isAutoScroll ? "Auto-scroll On" : "Auto-scroll Off"}
                      </button>
                    </div>
                  </div>
                  <div
                    ref={logContainerRef}
                    className="flex-1 bg-[#0d0d0d] font-mono text-sm overflow-y-auto p-4 scroll-smooth"
                  >
                    <ErrorBoundary>
                      {searchQuery ? (
                        isSearching ? (
                          <div className="text-zinc-500">Searching...</div>
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-3">
                            {searchResults.map((result, idx) => (
                              <div
                                key={`${result.timestamp}-${idx}`}
                                className="rounded border border-zinc-800 bg-zinc-950/60 p-3"
                              >
                                <div className="text-xs text-zinc-500 mb-1">
                                  {new Date(result.timestamp).toISOString()}
                                </div>
                                <div className="text-zinc-200 break-words">
                                  {highlightText(result.content, searchQuery)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-zinc-500">No matching logs found.</div>
                        )
                      ) : logs ? (
                        <pre className="whitespace-pre-wrap text-zinc-300 break-all font-mono leading-relaxed text-xs">
                          {logs}
                        </pre>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-700 italic">
                          <Activity className="w-8 h-8 mb-2 opacity-50" />
                          <p>Waiting for logs...</p>
                        </div>
                      )}
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {streams.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStream(stream.id)}
                    className="group text-left p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                        <Box className="w-5 h-5" />
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {stream.type}
                      </span>
                    </div>
                    <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                      {stream.name}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 font-mono">
                      {stream.id.substring(0, 8)}...
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setIsCreateStreamOpen(true)}
                  className="group flex flex-col items-center justify-center p-4 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl transition-all hover:bg-zinc-900/20 text-zinc-500 hover:text-zinc-300"
                >
                  <Plus className="w-6 h-6 mb-2 opacity-50 group-hover:opacity-100" />
                  <span className="text-sm font-medium">Create New Stream</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <LayoutGrid className="w-8 h-8 text-zinc-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">No Project Selected</h3>
              <p className="text-zinc-400 max-w-sm">
                Select a project from the top menu or create a new one to get started with Loghead.
              </p>
            </div>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium transition-colors"
            >
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {
        isCreateProjectOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Create Project</h3>
                <button
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g., My Awesome App"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && createProject()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreateProjectOpen(false)}
                    className="px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createProject}
                    disabled={!newProjectName.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Create Stream Modal */}
      {
        isCreateStreamOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Create Stream</h3>
                <button
                  onClick={() => setIsCreateStreamOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Stream Name
                  </label>
                  <input
                    type="text"
                    value={newStreamName}
                    onChange={(e) => setNewStreamName(e.target.value)}
                    placeholder="e.g., Production Logs"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && createStream()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Type
                  </label>
                  <select
                    value={newStreamType}
                    onChange={(e) => setNewStreamType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="browser">Browser</option>
                    <option value="docker">Docker</option>
                    <option value="terminal">Terminal</option>
                    <option value="opentelemetry">OpenTelemetry</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreateStreamOpen(false)}
                    className="px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createStream}
                    disabled={!newStreamName.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors"
                  >
                    Create Stream
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Connection Modal */}
      {
        isConnectOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Plug className="w-5 h-5 text-green-500" />
                  Connect to Loghead
                </h3>
                <button
                  onClick={() => setIsConnectOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Loghead API URL
                  </label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm font-mono text-zinc-300 select-all">
                    {apiBaseUrl || "Loading..."}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Authentication Token
                  </label>
                  <div className="relative">
                    <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm font-mono text-zinc-300 break-all pr-12 min-h-[60px]">
                      {connectionInfo?.token || "Loading..."}
                    </div>
                    <button
                      onClick={copyToken}
                      className="absolute top-2 right-2 p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                      title="Copy Token"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Use this token to authenticate your MCP client in the selected platform.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    Setup Instructions
                  </div>

                  <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-zinc-800">
                      {CONNECT_PLATFORM_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveConnectPlatform(tab.id)}
                          className={cn(
                            "px-3 py-2 text-xs font-medium transition-colors border-b-2",
                            activeConnectPlatform === tab.id
                              ? "text-white bg-zinc-900 border-green-500"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border-transparent"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="text-sm font-semibold text-zinc-100">{activeGuide.title}</div>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400">
                        {activeGuide.steps.map((step, index) => (
                          <li key={`${activeConnectPlatform}-${index}`}>{step}</li>
                        ))}
                      </ol>

                      {activeGuide.snippet && (
                        <div>
                          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                            {activeGuide.snippetLabel}
                          </div>
                          <pre className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 whitespace-pre-wrap wrap-break-word">
                            {activeGuide.snippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsConnectOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
