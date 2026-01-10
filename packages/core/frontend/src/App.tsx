import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { Terminal, Activity, ChevronDown, Box, LayoutGrid, Plug, Copy, Check, X, Plus, AlertCircle } from 'lucide-react';
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
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

interface ConnectionInfo {
    token: string;
    mcpUrl: string;
}

function App() {
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
    const [logs, setLogs] = useState<string>('');
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll effect
    useEffect(() => {
        if (isAutoScroll && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, isAutoScroll]);

    // Connection state
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
    const [copied, setCopied] = useState(false);

    // Simple dropdown state
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [isStreamOpen, setIsStreamOpen] = useState(false);

    // Creation state
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [isCreateStreamOpen, setIsCreateStreamOpen] = useState(false);
    const [newStreamName, setNewStreamName] = useState('');
    const [newStreamType, setNewStreamType] = useState('http');

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setProjects(data);
            if (data.length > 0 && !selectedProject) {
                setSelectedProject(data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch projects', err);
        }
    };

    const fetchStreams = async (projectId: string) => {
        try {
            const res = await fetch(`/api/streams?projectId=${projectId}`);
            const data = await res.json();
            setStreams(data);
            if (data.length > 0) {
                setSelectedStream(data[0].id);
            } else {
                setSelectedStream(null);
            }
        } catch (err) {
            console.error('Failed to fetch streams', err);
        }
    };

    const fetchStreamToken = async (streamId: string) => {
        try {
            const res = await fetch(`/api/streams/${streamId}/token`);
            console.log('Token received:', res);
            setStreamToken((await res.json()).token);
        } catch (err) {
            console.error('Failed to fetch stream token', err);
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
                console.error('Logs API returned non-array data:', data);
                return;
            }

            const parseTimestamp = (ts: string | number) => {
                if (!ts) return new Date();
                // If it's a numeric string or number (likely Unix epoch/nano)
                if (!isNaN(Number(ts))) {
                    const num = Number(ts);
                    // Heuristic: if huge, probably nanoseconds (OTLP)
                    if (num > 1000000000000000) return new Date(num / 1000000);
                    // If reasonable size, probably milliseconds
                    return new Date(num);
                }
                // If string, assume SQL format or ISO
                if (typeof ts === 'string') {
                    // SQL timestamps often lack timezone info, assumed UTC
                    if (ts.includes(' ') && !ts.includes('Z') && !ts.includes('+')) {
                        return new Date(ts.replace(' ', 'T') + 'Z');
                    }
                }
                return new Date(ts);
            };

            // Format logs for display
            // Sort by timestamp ascending
            const sortedLogs = data.sort((a, b) => {
                return parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime();
            });

            const logString = sortedLogs.map(log => {
                const date = parseTimestamp(log.timestamp).toISOString();
                let metaString = '';
                if (log.metadata && Object.keys(log.metadata).length > 0) {
                    metaString = ` ${JSON.stringify(log.metadata)}`;
                }
                return `[${date}] ${log.content}${metaString}`;
            }).join('\n');

            setLogs(logString);
        } catch (err) {
            console.error('Failed to fetch logs', err);
        }
    };

    const createProject = async () => {
        if (!newProjectName.trim()) return;
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newProjectName })
            });
            const data = await res.json();
            setProjects([...projects, data]);
            setSelectedProject(data.id);
            setNewProjectName('');
            setIsCreateProjectOpen(false);
            setIsProjectOpen(false);
        } catch (err) {
            console.error('Failed to create project', err);
        }
    };

    const createStream = async () => {
        if (!newStreamName.trim() || !selectedProject) return;
        try {
            const res = await fetch('/api/streams/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: selectedProject,
                    name: newStreamName,
                    type: newStreamType
                })
            });
            const data = await res.json();
            setStreams([...streams, data]);
            setSelectedStream(data.id);
            setNewStreamName('');
            setIsCreateStreamOpen(false);
            setIsStreamOpen(false);
        } catch (err) {
            console.error('Failed to create stream', err);
        }
    };

    const fetchConnectionInfo = async () => {
        try {
            const res = await fetch('/api/connection');
            const data = await res.json();
            setConnectionInfo(data);
        } catch (err) {
            console.error('Failed to fetch connection info', err);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchStreams(selectedProject);
            setIsProjectOpen(false); // Close dropdown on select
        } else {
            setStreams([]);
        }
    }, [selectedProject]);

    useEffect(() => {
        if (selectedStream) {
            fetchStreamToken(selectedStream);
            fetchLogs(selectedStream);
            pollingInterval.current = setInterval(() => fetchLogs(selectedStream), 2000);
        } else {
            setStreamToken(null);
            setLogs('');
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        }
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [selectedStream]);

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

    const currentProject = projects.find(p => p.id === selectedProject);
    const currentStream = streams.find(s => s.id === selectedStream);

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans flex flex-col">
            {/* Vercel-like Header */}
            <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm font-medium">
                        {/* Logo */}
                        <div className="flex items-center gap-2 mr-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center">
                                <Terminal className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Loghead</span>
                        </div>

                        {/* Breadcrumb / Selectors */}
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="text-gray-600">/</span>

                            {/* Project Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => { setIsProjectOpen(!isProjectOpen); setIsStreamOpen(false); }}
                                    className="flex items-center gap-2 hover:bg-gray-900 px-2 py-1.5 rounded transition-colors hover:text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <LayoutGrid className="w-3 h-3" />
                                    </div>
                                    <span>{currentProject?.name || 'Select Project'}</span>
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </button>

                                {isProjectOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Projects
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {projects.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setSelectedProject(p.id)}
                                                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-800 transition-colors ${selectedProject === p.id ? 'text-blue-400' : 'text-gray-300'}`}
                                                >
                                                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {p.name}
                                                </button>
                                            ))}
                                            {projects.length === 0 && (
                                                <div className="px-3 py-2 text-sm text-gray-500">No projects found</div>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-800 mt-1 pt-1 p-2">
                                            <button
                                                onClick={() => { setIsCreateProjectOpen(true); setIsProjectOpen(false); }}
                                                className="w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition-colors text-sm"
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
                                    <span className="text-gray-600">/</span>

                                    {/* Stream Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => { setIsStreamOpen(!isStreamOpen); setIsProjectOpen(false); }}
                                            className="flex items-center gap-2 hover:bg-gray-900 px-2 py-1.5 rounded transition-colors hover:text-gray-200"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                                <Activity className="w-3 h-3" />
                                            </div>
                                            <span>{currentStream?.name || 'Select Stream'}</span>
                                            <ChevronDown className="w-4 h-4 opacity-50" />
                                        </button>

                                        {isStreamOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Streams
                                                </div>
                                                <div className="max-h-60 overflow-y-auto">
                                                    {streams.map(s => (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => { setSelectedStream(s.id); setIsStreamOpen(false); }}
                                                            className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-800 transition-colors ${selectedStream === s.id ? 'text-purple-400' : 'text-gray-300'}`}
                                                        >
                                                            <div className="w-4 h-4 rounded border border-current flex items-center justify-center text-[10px]">
                                                                <Box className="w-3 h-3" />
                                                            </div>
                                                            {s.name}
                                                        </button>
                                                    ))}
                                                    {streams.length === 0 && (
                                                        <div className="px-3 py-2 text-sm text-gray-500">No streams found</div>
                                                    )}
                                                </div>
                                                <div className="border-t border-gray-800 mt-1 pt-1 p-2">
                                                    <button
                                                        onClick={() => { setIsCreateStreamOpen(true); setIsStreamOpen(false); }}
                                                        className="w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition-colors text-sm"
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
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                fetchConnectionInfo();
                                setIsConnectOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-black hover:bg-gray-200 rounded text-sm font-medium transition-colors"
                        >
                            <Plug className="w-4 h-4" />
                            Connect
                        </button>
                    </div>
                </div>
            </header>

            {/* Create Project Modal */}
            {isCreateProjectOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Create Project</h3>
                            <button
                                onClick={() => setIsCreateProjectOpen(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="e.g., My Awesome App"
                                    className="w-full bg-gray-950 border border-gray-800 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && createProject()}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsCreateProjectOpen(false)}
                                    className="px-4 py-2 hover:bg-gray-800 rounded text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createProject}
                                    disabled={!newProjectName.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors"
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
                    <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Create Stream</h3>
                            <button
                                onClick={() => setIsCreateStreamOpen(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Stream Name
                                </label>
                                <input
                                    type="text"
                                    value={newStreamName}
                                    onChange={(e) => setNewStreamName(e.target.value)}
                                    placeholder="e.g., Production Logs"
                                    className="w-full bg-gray-950 border border-gray-800 rounded p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && createStream()}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Type
                                </label>
                                <select
                                    value={newStreamType}
                                    onChange={(e) => setNewStreamType(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded p-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                >
                                    <option value="http">HTTP</option>
                                    <option value="docker">Docker</option>
                                    <option value="file">File</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsCreateStreamOpen(false)}
                                    className="px-4 py-2 hover:bg-gray-800 rounded text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createStream}
                                    disabled={!newStreamName.trim()}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors"
                                >
                                    Create Stream
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Connection Modal */}
            {isConnectOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Plug className="w-5 h-5 text-green-500" />
                                Connect to Loghead
                            </h3>
                            <button
                                onClick={() => setIsConnectOpen(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    MCP Server URL
                                </label>
                                <div className="bg-gray-950 border border-gray-800 rounded p-3 text-sm font-mono text-gray-300 select-all">
                                    {connectionInfo?.mcpUrl || 'Loading...'}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Authentication Token
                                </label>
                                <div className="relative">
                                    <div className="bg-gray-950 border border-gray-800 rounded p-3 text-sm font-mono text-gray-300 break-all pr-12 min-h-[60px]">
                                        {connectionInfo?.token || 'Loading...'}
                                    </div>
                                    <button
                                        onClick={copyToken}
                                        className="absolute top-2 right-2 p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                        title="Copy Token"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Use this token to authenticate your MCP clients or direct API calls.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-950/50 border-t border-gray-800 flex justify-end">
                            <button
                                onClick={() => setIsConnectOpen(false)}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                {selectedProject ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{currentStream ? currentStream.name : 'Overview'}</h2>
                                <p className="text-gray-500 mt-1">
                                    {currentStream
                                        ? `Viewing logs and metrics for ${currentStream.name}`
                                        : `Select a stream to view details for ${currentProject?.name}`
                                    }
                                </p>
                            </div>
                            {currentStream && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-full text-xs font-mono text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    Live
                                </div>
                            )}
                        </div>

                        {currentStream ? (
                            <div className="space-y-4">
                                <div className="text-xs text-gray-500 font-mono bg-gray-900/50 p-2 rounded border border-gray-800 flex gap-4 items-center">
                                    <span>Stream ID: <span className="text-white">{currentStream.id}</span></span>
                                    <span>Logs: <span className="text-white">{logs ? logs.split('\n').length : 0}</span></span>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await fetch('/api/ingest', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${streamToken}`
                                                    },
                                                    body: JSON.stringify({
                                                        streamId: currentStream.id,
                                                        logs: [`Test log entry at ${new Date().toISOString()}`]
                                                    })
                                                });
                                                if (res.ok) {
                                                    console.log('Test log sent');
                                                    fetchLogs(currentStream.id);
                                                } else {
                                                    console.error('Failed to send test log', await res.text());
                                                }
                                            } catch (e) {
                                                console.error('Error sending test log', e);
                                            }
                                        }}
                                        className="px-2 py-1 bg-blue-900/50 hover:bg-blue-900 text-blue-200 rounded text-[10px] uppercase font-bold tracking-wider"
                                    >
                                        Send Test Log
                                    </button>
                                </div>

                                {streamTokenLoading && (
                                    <div className="text-sm text-gray-500 animate-pulse">Loading stream token...</div>
                                )}

                                {streamTokenError && (
                                    <div className="text-sm text-red-500">
                                        Error loading token: {streamTokenError}
                                    </div>
                                )}

                                {streamToken && (
                                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-left">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Stream Token
                                            </label>
                                            <span className="text-xs text-gray-600">
                                                Use this token to send logs to this stream
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-950 border border-gray-800 rounded p-2 text-sm font-mono text-gray-300 break-all">
                                                {streamToken}
                                            </div>
                                            <button
                                                onClick={copyStreamToken}
                                                className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                                title="Copy Stream Token"
                                            >
                                                {streamTokenCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden h-[600px] flex flex-col">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-950">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Logs</h3>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setIsAutoScroll(!isAutoScroll)}
                                                className={`text-xs px-2 py-1 rounded ${isAutoScroll ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                                            >
                                                {isAutoScroll ? 'Auto-scroll On' : 'Auto-scroll Off'}
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        ref={logContainerRef}
                                        className="flex-1 bg-[#1e1e1e] font-mono text-sm overflow-y-auto p-4 scroll-smooth"
                                    >
                                        <ErrorBoundary>
                                            {logs ? (
                                                <pre className="whitespace-pre-wrap text-gray-300 break-all font-mono leading-relaxed">
                                                    {logs}
                                                </pre>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-600 italic">
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
                                {streams.map(stream => (
                                    <button
                                        key={stream.id}
                                        onClick={() => setSelectedStream(stream.id)}
                                        className="group text-left p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 rounded-lg bg-gray-800 text-gray-300 group-hover:bg-gray-700 group-hover:text-white transition-colors">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-mono text-gray-500 bg-gray-950 px-2 py-1 rounded border border-gray-800">
                                                {stream.type}
                                            </span>
                                        </div>
                                        <div className="font-semibold text-gray-200 group-hover:text-white mb-1">
                                            {stream.name}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono truncate">
                                            {stream.id}
                                        </div>
                                    </button>
                                ))}
                                {streams.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-500">
                                        No streams found in this project.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-6">
                            <LayoutGrid className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-xl font-medium text-white mb-2">No Project Selected</p>
                        <p className="text-gray-500 max-w-sm text-center">
                            Select a project from the top navigation bar to view its streams and logs.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
