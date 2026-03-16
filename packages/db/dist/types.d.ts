export interface Project {
    id: string;
    name: string;
    created_at?: string;
    streams?: Stream[];
}
export interface Stream {
    id: string;
    project_id: string;
    type: string;
    name: string;
    config: Record<string, unknown> | string;
    created_at?: string;
}
export interface Log {
    id: string;
    stream_id: string;
    content: string;
    timestamp: string;
    metadata: Record<string, unknown> | string;
}
export interface SearchResult {
    content: string;
    timestamp: string;
    similarity?: number;
    metadata?: Record<string, unknown>;
}
export interface Issue {
    id: string;
    project_id: string;
    fingerprint: string;
    title: string;
    status: "open" | "resolved";
    first_seen: string;
    last_seen: string;
    occurrence_count: number;
    created_at: string;
    embedding?: number[] | string | Buffer | null;
}
