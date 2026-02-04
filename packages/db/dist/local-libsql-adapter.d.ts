import { DatabaseAdapter } from "./adapter.js";
export declare class LocalLibSqlAdapter implements DatabaseAdapter {
    private db;
    constructor(db: any);
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    get<T>(sql: string, params?: any[]): Promise<T | undefined>;
    run(sql: string, params?: any[]): Promise<{
        lastInsertRowid?: number | bigint;
        changes?: number;
    }>;
    exec(sql: string): Promise<void>;
    transaction<T>(fn: () => Promise<T>): Promise<T>;
    close(): Promise<void>;
}
