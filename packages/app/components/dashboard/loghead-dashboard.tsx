"use client";

import {
  useState,
  useEffect,
  useRef,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
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
  Pencil,
  Trash,
  ArrowLeft,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Onboarding } from "@/components/onboarding";
import { SettingsModal } from "@/components/SettingsModal";

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
          <span
            key={i}
            className="bg-yellow-500/20 text-yellow-200 rounded px-0.5"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}

// Types
interface AppUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

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

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

type ConnectPlatform =
  | "claudeCode"
  | "windsurf"
  | "cursor"
  | "claudeDesktop"
  | "vscode"
  | "aws";

const CONNECT_PLATFORM_TABS: { id: ConnectPlatform; label: string }[] = [
  { id: "claudeCode", label: "Claude Code" },
  { id: "windsurf", label: "Windsurf" },
  { id: "cursor", label: "Cursor" },
  { id: "claudeDesktop", label: "Claude Desktop" },
  { id: "vscode", label: "VS Code" },
  { id: "aws", label: "AWS" },
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

function getConnectGuide(
  platform: ConnectPlatform,
  apiUrl: string,
  token: string,
) {
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

export function LogheadDashboard({ user }: { user: AppUser }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  // Stream Token State
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [streamTokenLoading, setStreamTokenLoading] = useState(false);
  const [streamTokenError, setStreamTokenError] = useState<string | null>(null);

  // Logs State
  const [logs, setLogs] = useState<string>("");
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Connection state
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(
    null,
  );
  const [activeConnectPlatform, setActiveConnectPlatform] =
    useState<ConnectPlatform>("claudeCode");
  const [copied, setCopied] = useState(false);
  const [apiUrlCopied, setApiUrlCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);

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

  // Issue Grouping State
  const [viewMode, setViewMode] = useState<"logs" | "issues">("logs");
  const [issues, setIssues] = useState<any[]>([]);
  const [issueFilter, setIssueFilter] = useState<"all" | "open" | "resolved">(
    "open",
  );
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [issueDetails, setIssueDetails] = useState<any>(null); // { issue: ..., logs: ... }

  // Rename & Delete State
  const [isRenameProjectOpen, setIsRenameProjectOpen] = useState(false);
  const [renameProjectName, setRenameProjectName] = useState("");
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);

  const [isRenameStreamOpen, setIsRenameStreamOpen] = useState(false);
  const [renameStreamName, setRenameStreamName] = useState("");
  const [renameStreamId, setRenameStreamId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "project" | "stream";
    id: string;
    name: string;
  } | null>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingInitialStep, setOnboardingInitialStep] =
    useState<OnboardingStep>(1);
  const [onboardingInitialStreamType, setOnboardingInitialStreamType] =
    useState("terminal");
  const [onboardingInitialStreamId, setOnboardingInitialStreamId] = useState<
    string | null
  >(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const fetchProjects = async (autoOnboard = false) => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      } else if (data.length === 0 && autoOnboard) {
        fetchConnectionInfo();
        setOnboardingInitialStep(1);
        setOnboardingInitialStreamType("terminal");
        setOnboardingInitialStreamId(null);
        setShowOnboarding(true);
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
      setSelectedStream(data.length > 0 ? data[0].id : null);
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

  const fetchIssues = async (projectId: string) => {
    try {
      let url = `/api/issues?projectId=${projectId}`;
      if (issueFilter !== "all") url += `&status=${issueFilter}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (e) {
      console.error("Failed to fetch issues", e);
    }
  };

  const fetchIssueDetails = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`);
      if (res.ok) {
        const data = await res.json();
        setIssueDetails(data);
      }
    } catch (e) {
      console.error("Failed to fetch issue details", e);
    }
  };

  const resolveIssue = async (
    issueId: string,
    newStatus: "open" | "resolved",
  ) => {
    try {
      await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      // Refresh
      if (selectedProject) fetchIssues(selectedProject);
      if (expandedIssue === issueId && issueDetails) {
        setIssueDetails({
          ...issueDetails,
          issue: { ...issueDetails.issue, status: newStatus },
        });
      }
    } catch (e) {
      console.error("Failed to resolve issue", e);
    }
  };

  const renameProject = async () => {
    const id = renameProjectId || selectedProject;
    if (!id || !renameProjectName.trim()) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
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
    } catch (err) {
      console.error("Failed to rename project", err);
      alert("Failed to rename project: " + err);
    }
  };

  const renameStream = async () => {
    const id = renameStreamId || selectedStream;
    if (!id || !renameStreamName.trim()) return;

    try {
      const res = await fetch(`/api/streams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameStreamName }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      if (selectedProject) await fetchStreams(selectedProject);
      setIsRenameStreamOpen(false);
      setRenameStreamId(null);
    } catch (err) {
      console.error("Failed to rename stream", err);
      alert("Failed to rename stream: " + err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await fetch(`/api/${deleteTarget.type}s/${deleteTarget.id}`, {
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
      } else {
        if (selectedProject) await fetchStreams(selectedProject);
        if (selectedStream === deleteTarget.id) {
          setSelectedStream(null);
          setLogs("");
        }
      }

      setDeleteTarget(null);
    } catch (err) {
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
    } else {
      setIssueDetails(null);
    }
  }, [expandedIssue]);

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
        setConnectionInfo({
          token: "Unavailable",
          mcpUrl: window.location.origin,
        });
      }
    } catch (err) {
      console.error("Failed to fetch connection info", err);
    }
  };

  useEffect(() => {
    fetchProjects(true);
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

  const currentProject = projects.find((p) => p.id === selectedProject);
  const currentStream = streams.find((s) => s.id === selectedStream);
  const apiBaseUrl = normalizeApiBaseUrl(
    connectionInfo?.mcpUrl ||
      (typeof window !== "undefined" ? window.location.origin : ""),
  );

  const activeGuide = getConnectGuide(
    activeConnectPlatform,
    apiBaseUrl || "https://your-loghead-domain.com",
    connectionInfo?.token || "<YOUR_MCP_TOKEN>",
  );

  const getOnboardingStreamType = (streamType?: string) => {
    switch (streamType) {
      case "browser":
      case "docker":
      case "terminal":
      case "opentelemetry":
      case "aws":
        return streamType;
      default:
        return "terminal";
    }
  };

  const openOnboarding = (
    initialStep: OnboardingStep,
    streamType = "terminal",
    streamId: string | null = null,
  ) => {
    fetchConnectionInfo();
    setOnboardingInitialStep(initialStep);
    setOnboardingInitialStreamType(getOnboardingStreamType(streamType));
    setOnboardingInitialStreamId(streamId);
    setShowOnboarding(true);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-gray-100 flex flex-col pb-6">
      {/* Header / Toolbar */}
      <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mr-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00FF94]/10">
                <img
                  src="https://www.loghead.dev/logo.svg"
                  alt="Loghead"
                  className="h-5 w-5 object-contain rotate-[30deg]"
                />
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-sm font-semibold">Loghead</div>
                <div className="text-[10px] text-zinc-500">Infra reasoning layer</div>
              </div>
            </div>

            <div className="w-px h-5 bg-zinc-800 hidden sm:block" />

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
                <span className="font-medium text-sm">
                  {currentProject?.name || "Select Project"}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </button>

              {isProjectOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Projects
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProject(p.id)}
                        className={cn(
                          "group relative flex items-center justify-between px-3 py-2 hover:bg-zinc-800 transition-colors cursor-pointer text-sm",
                          selectedProject === p.id
                            ? "text-emerald-400"
                            : "text-zinc-300",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[140px]">
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameProjectId(p.id);
                              setRenameProjectName(p.name);
                              setIsRenameProjectOpen(true);
                              setIsProjectOpen(false);
                            }}
                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({
                                type: "project",
                                id: p.id,
                                name: p.name,
                              });
                              setIsProjectOpen(false);
                            }}
                            className="p-1 hover:bg-red-900/50 rounded text-zinc-400 hover:text-red-400"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
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
                    <span className="font-medium text-sm">
                      {currentStream?.name || "Select Stream"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </button>

                  {isStreamOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Streams
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {streams.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setSelectedStream(s.id);
                              setIsStreamOpen(false);
                            }}
                            className={cn(
                              "group relative flex items-center justify-between px-3 py-2 hover:bg-zinc-800 transition-colors cursor-pointer text-sm",
                              selectedStream === s.id
                                ? "text-emerald-400"
                                : "text-zinc-300",
                            )}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-4 h-4 rounded border border-current flex items-center justify-center text-[10px] shrink-0">
                                <Box className="w-3 h-3" />
                              </div>
                              <span className="truncate">{s.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenameStreamId(s.id);
                                  setRenameStreamName(s.name);
                                  setIsRenameStreamOpen(true);
                                  setIsStreamOpen(false);
                                }}
                                className="p-1.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-all shadow-sm"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget({
                                    type: "stream",
                                    id: s.id,
                                    name: s.name,
                                  });
                                  setIsStreamOpen(false);
                                }}
                                className="p-1.5 bg-zinc-900 border border-zinc-700 hover:bg-red-600/20 hover:border-red-500/50 rounded-md text-zinc-400 hover:text-red-400 transition-all shadow-sm"
                              >
                                <Trash className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
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
                openOnboarding(1);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition-colors border border-emerald-500/50"
            >
              <Plug className="w-4 h-4" />
              Connect
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg p-2 hover:bg-white/5 transition-colors"
              title="Settings"
            >
              <Settings size={16} className="text-zinc-400" />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-full hover:ring-2 hover:ring-zinc-600 transition-all"
              title="Profile"
            >
              <img
                src={user?.image || `https://avatar.vercel.sh/${user?.id}`}
                className="h-8 w-8 rounded-full border border-zinc-800"
                alt="avatar"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-3 sm:px-6 sm:py-4">
        {selectedProject ? (
          <div className="h-full flex flex-col space-y-3">
            {/* Stream Identity + Onboarding CTA */}
            {currentStream && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,auto)_1fr] gap-x-6 gap-y-2 items-center">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Stream ID
                  </div>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Connect Project
                  </div>

                  <div
                    className="text-sm font-mono text-zinc-300 truncate"
                    title={currentStream.id}
                  >
                    {currentStream.id}
                  </div>

                  <div className="min-w-0 flex items-center gap-3">
                    <p className="text-sm text-zinc-300">
                      Need to connect your project to this stream?
                    </p>
                    <button
                      onClick={() =>
                        openOnboarding(
                          4,
                          currentStream.type,
                          currentStream.id,
                        )
                      }
                      className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 hover:border-emerald-400/60 hover:bg-emerald-500/10 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      Connect
                      <Plug className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 border-b border-zinc-800 px-2">
              <button
                onClick={() => setViewMode("logs")}
                className={cn(
                  "px-1 py-3 text-sm font-medium border-b-2 transition-colors",
                  viewMode === "logs"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200",
                )}
              >
                Logs
              </button>
              <button
                onClick={() => setViewMode("issues")}
                className={cn(
                  "px-1 py-3 text-sm font-medium border-b-2 transition-colors",
                  viewMode === "issues"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200",
                )}
              >
                Issues
              </button>
            </div>

            {viewMode === "logs" ? (
              currentStream ? (
                <div className="flex-1 flex flex-col space-y-4 min-h-0">
                  <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col min-h-0">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950">
                      <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xl">
                        <button
                          onClick={() => setSelectedStream(null)}
                          className="mr-2 p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                          title="Back to all streams"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
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
                            if (!streamToken || !currentStream) return;
                            try {
                              const res = await fetch("/api/ingest", {
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
                              } else {
                                console.error(
                                  "Failed to send test log",
                                  await res.text(),
                                );
                              }
                            } catch (e) {
                              console.error("Error sending test log", e);
                            }
                          }}
                          disabled={!streamToken || streamTokenLoading}
                          title={
                            streamTokenError
                              ? `Unavailable: ${streamTokenError}`
                              : streamTokenLoading
                                ? "Loading stream token..."
                                : !streamToken
                                  ? "Stream token unavailable"
                                  : "Send a test log to this stream"
                          }
                          className={cn(
                            "text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider border transition-colors",
                            !streamToken || streamTokenLoading
                              ? "border-zinc-800 bg-zinc-900 text-zinc-500 cursor-not-allowed"
                              : "border-emerald-500/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30",
                          )}
                        >
                          {streamTokenLoading ? "Loading Token" : "Send Test Log"}
                        </button>
                        <button
                          onClick={() => setIsAutoScroll(!isAutoScroll)}
                          className={cn(
                            "text-[10px] px-3 py-1.5 rounded font-bold uppercase tracking-wider border transition-colors",
                            isAutoScroll
                              ? "border-emerald-500/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-300",
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
                            <div className="text-zinc-500">
                              No matching logs found.
                            </div>
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
                    <div
                      key={stream.id}
                      className="group relative bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all"
                    >
                      <button
                        onClick={() => setSelectedStream(stream.id)}
                        className="w-full text-left p-4 h-full"
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
                      <div className="absolute bottom-2 right-2 flex gap-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameStreamId(stream.id);
                            setRenameStreamName(stream.name);
                            setIsRenameStreamOpen(true);
                          }}
                          className="p-1 bg-zinc-800/80 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({
                              type: "stream",
                              id: stream.id,
                              name: stream.name,
                            });
                          }}
                          className="p-1 bg-zinc-800/80 hover:bg-red-900/50 rounded text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setIsCreateStreamOpen(true)}
                    className="group flex flex-col items-center justify-center p-4 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl transition-all hover:bg-zinc-900/20 text-zinc-500 hover:text-zinc-300"
                  >
                    <Plus className="w-6 h-6 mb-2 opacity-50 group-hover:opacity-100" />
                    <span className="text-sm font-medium">
                      Create New Stream
                    </span>
                  </button>
                </div>
              )
            ) : (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col min-h-0">
                  {/* Issues Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950">
                    <h2 className="text-sm font-semibold flex items-center gap-2 text-zinc-300">
                      <span className="text-emerald-400">●</span>
                      Issues ({
                        issues.filter((i) => i.status === "open").length
                      }{" "}
                      active)
                    </h2>
                    <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                      <button
                        onClick={() => setIssueFilter("all")}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded transition-colors",
                          issueFilter === "all"
                            ? "bg-zinc-700 text-white"
                            : "text-zinc-400 hover:text-white",
                        )}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setIssueFilter("open")}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded transition-colors",
                          issueFilter === "open"
                            ? "bg-zinc-700 text-white"
                            : "text-zinc-400 hover:text-white",
                        )}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setIssueFilter("resolved")}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded transition-colors",
                          issueFilter === "resolved"
                            ? "bg-zinc-700 text-white"
                            : "text-zinc-400 hover:text-white",
                        )}
                      >
                        Resolved
                      </button>
                    </div>
                  </div>

                  {/* Issues List */}
                  <div className="flex-1 overflow-y-auto space-y-2 p-4">
                    {issues.length === 0 ? (
                      <div className="text-center py-12 text-zinc-500 italic">
                        No issues found.
                      </div>
                    ) : (
                      issues.map((issue) => (
                        <div
                          key={issue.id}
                          className="border border-zinc-800 bg-zinc-900/40 rounded-lg overflow-hidden"
                        >
                          <div
                            className={cn(
                              "p-4 cursor-pointer hover:bg-zinc-900/60 transition-colors flex items-start gap-4 border-l-4",
                              issue.status === "open"
                                ? "border-l-red-500"
                                : "border-l-emerald-500",
                            )}
                            onClick={() =>
                              setExpandedIssue(
                                expandedIssue === issue.id ? null : issue.id,
                              )
                            }
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {issue.status === "open" ? (
                                  <span className="text-xs font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase">
                                    Error
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                                    Resolved
                                  </span>
                                )}
                                <h3 className="font-mono text-sm font-medium text-zinc-200 truncate">
                                  {issue.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span>
                                  Occurrences:{" "}
                                  <strong className="text-zinc-300">
                                    {issue.occurrence_count}
                                  </strong>
                                </span>
                                <span>
                                  First seen:{" "}
                                  {new Date(issue.first_seen).toLocaleString()}
                                </span>
                                <span>
                                  Last seen:{" "}
                                  {new Date(issue.last_seen).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <ChevronDown
                              className={cn(
                                "w-5 h-5 text-zinc-600 transition-transform",
                                expandedIssue === issue.id ? "rotate-180" : "",
                              )}
                            />
                          </div>

                          {expandedIssue === issue.id && (
                            <div className="border-t border-zinc-800 bg-zinc-950 p-4 animate-in slide-in-from-top-2 duration-200">
                              <div className="flex justify-end mb-4">
                                {issue.status === "open" ? (
                                  <button
                                    onClick={() =>
                                      resolveIssue(issue.id, "resolved")
                                    }
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
                                  >
                                    Mark as Resolved
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      resolveIssue(issue.id, "open")
                                    }
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded transition-colors"
                                  >
                                    Reopen Issue
                                  </button>
                                )}
                              </div>

                              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                                Recent Occurrences
                              </div>
                              <div className="space-y-1 font-mono text-xs">
                                {issueDetails?.logs?.map((log: any) => (
                                  <div
                                    key={log.id}
                                    className="bg-zinc-900/50 p-2 rounded text-zinc-400 break-all"
                                  >
                                    <span className="text-zinc-600 mr-2">
                                      [{new Date(log.timestamp).toISOString()}]
                                    </span>
                                    {log.content}
                                  </div>
                                ))}
                                {!issueDetails && (
                                  <div className="text-zinc-600 italic">
                                    Loading logs...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {/* end card */}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <LayoutGrid className="w-8 h-8 text-zinc-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Project Selected
              </h3>
              <p className="text-zinc-400 max-w-sm">
                Select a project from the top menu or create a new one to get
                started with Loghead.
              </p>
            </div>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors border border-zinc-800"
            >
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateProjectOpen && (
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
      )}

      {/* Create Stream Modal */}
      {isCreateStreamOpen && (
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
                  <option value="aws">AWS</option>
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
      )}

      {/* Rename Project Modal */}
      {isRenameProjectOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Rename Project</h3>
              <button
                onClick={() => setIsRenameProjectOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  New Name
                </label>
                <input
                  type="text"
                  value={renameProjectName}
                  onChange={(e) => setRenameProjectName(e.target.value)}
                  placeholder="Project Name"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && renameProject()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsRenameProjectOpen(false)}
                  className="px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={renameProject}
                  disabled={!renameProjectName.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Stream Modal */}
      {isRenameStreamOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Rename Stream</h3>
              <button
                onClick={() => setIsRenameStreamOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  New Name
                </label>
                <input
                  type="text"
                  value={renameStreamName}
                  onChange={(e) => setRenameStreamName(e.target.value)}
                  placeholder="Stream Name"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && renameStream()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsRenameStreamOpen(false)}
                  className="px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={renameStream}
                  disabled={!renameStreamName.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-semibold text-lg text-red-500 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Delete {deleteTarget.type === "project" ? "Project" : "Stream"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-zinc-300 text-sm">
                Are you sure you want to delete{" "}
                <span className="font-bold text-white">
                  "{deleteTarget.name}"
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 hover:bg-zinc-800 rounded text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-medium text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Modal */}
      {isConnectOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
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

            <div className="flex divide-x divide-zinc-800 max-h-[70vh]">
              {/* Left: Credentials */}
              <div className="p-6 space-y-6 w-80 shrink-0 overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Loghead API URL
                  </label>
                  <div className="relative">
                    <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm font-mono text-zinc-300 break-all pr-12 min-h-[60px]">
                      {apiBaseUrl || "Loading..."}
                    </div>
                    <button
                      onClick={() => {
                        if (apiBaseUrl) {
                          navigator.clipboard.writeText(apiBaseUrl);
                          setApiUrlCopied(true);
                          setTimeout(() => setApiUrlCopied(false), 2000);
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                      title="Copy URL"
                    >
                      {apiUrlCopied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
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
                    Use this token to authenticate your MCP client in the
                    selected platform.
                  </p>
                </div>
              </div>

              {/* Right: Setup Instructions */}
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Setup Instructions
                </div>

                <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-zinc-800">
                    {CONNECT_PLATFORM_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveConnectPlatform(tab.id)}
                        className={cn(
                          "px-3 py-2 text-xs font-medium transition-colors border-b-2",
                          activeConnectPlatform === tab.id
                            ? "text-white bg-zinc-900 border-green-500"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border-transparent",
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="text-sm font-semibold text-zinc-100">
                      {activeGuide.title}
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400">
                      {activeGuide.steps.map((step, index) => (
                        <li key={`${activeConnectPlatform}-${index}`}>
                          {step}
                        </li>
                      ))}
                    </ol>

                    {activeGuide.snippet && (
                      <div className="relative group">
                        <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                          {activeGuide.snippetLabel}
                        </div>
                        <div className="relative">
                          <pre className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 whitespace-pre-wrap break-words pr-12">
                            {activeGuide.snippet}
                          </pre>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                activeGuide.snippet,
                              );
                              setSnippetCopied(true);
                              setTimeout(() => setSnippetCopied(false), 2000);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Copy snippet"
                          >
                            {snippetCopied ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
      />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-5 p-6 animate-in fade-in duration-200">
          {/* Close */}
          <button
            onClick={() => setShowOnboarding(false)}
            className="absolute top-4 right-4 p-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00FF94]/10">
              <img
                src="https://www.loghead.dev/logo.svg"
                alt="Loghead"
                className="h-5 w-5 object-contain rotate-[30deg]"
              />
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold text-white">Loghead</div>
              <div className="text-xs text-zinc-500">Infra reasoning layer</div>
            </div>
          </div>

          <div className="w-full animate-in zoom-in-95 duration-200">
            <Onboarding
              apiUrl={apiBaseUrl}
              token={connectionInfo?.token || ""}
              initialStep={onboardingInitialStep}
              initialStreamType={onboardingInitialStreamType}
              initialStreamId={onboardingInitialStreamId}
              onDone={() => setShowOnboarding(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
