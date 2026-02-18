import { DatabaseAdapter } from "./adapter.js";
import { OllamaService } from "./ollama-service.js";
import { AuthService } from "./auth-service.js";
import { Project, Stream, Log, SearchResult } from "./types.js";
export declare class DbService {
    private db;
    readonly auth: AuthService;
    private ollama;
    private warnedLastInsertRowidFallback;
    constructor(db: DatabaseAdapter, auth: AuthService, ollama: OllamaService);
    createProject(name: string): Promise<Project>;
    getProject(id: string): Promise<Project | undefined>;
    deleteProject(id: string): Promise<boolean>;
    listProjects(): Promise<Project[]>;
    createStream(projectId: string, type: string, name: string, config?: Record<string, unknown>): Promise<Stream & {
        token: string;
    }>;
    getStream(id: string): Promise<Stream | undefined>;
    deleteStream(id: string): Promise<boolean>;
    listStreams(projectId: string): Promise<Stream[]>;
    cleanupOldLogs(days?: number): Promise<void>;
    addLog(streamId: string, content: string, metadata?: Record<string, unknown>): Promise<{
        id: string;
    }>;
    searchLogs(query: string, streamId?: string, limit?: number): Promise<SearchResult[]>;
    getRecentLogs(streamId: string, limit?: number, offset?: number): Promise<Log[]>;
    close(): Promise<void>;
    private processErrorGrouping;
    private generateFingerprint;
    getIssues(projectId: string, status?: string, limit?: number): Promise<any[]>;
    getIssue(id: string): Promise<any>;
    updateIssueStatus(id: string, status: 'open' | 'resolved'): Promise<void>;
}
