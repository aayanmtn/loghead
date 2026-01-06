import { useState, useEffect } from 'react';
import { Terminal, Activity, ChevronDown, Box, LayoutGrid, Plug, Copy, Check, X } from 'lucide-react';

interface Project {
    id: string;
    name: string;
}

interface Stream {
    id: string;
    name: string;
    type: string;
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

    // Connection state
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
    const [copied, setCopied] = useState(false);

    // Simple dropdown state
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    const [isStreamOpen, setIsStreamOpen] = useState(false);

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

    const copyToken = () => {
        if (connectionInfo?.token) {
            navigator.clipboard.writeText(connectionInfo.token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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
                            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-12 text-center text-gray-500 border-dashed">
                                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">Log stream view coming soon...</p>
                                <p className="text-sm opacity-60">ID: {currentStream.id}</p>
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
