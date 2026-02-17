import { DatabaseAdapter } from "./adapter.js";

export class LocalLibSqlAdapter implements DatabaseAdapter {
    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        const stmt = this.db.prepare(sql);
        return stmt.all(params) as T[];
    }

    async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        const stmt = this.db.prepare(sql);
        return stmt.get(params) as T | undefined;
    }

    async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid?: number | bigint; changes?: number }> {
        const stmt = this.db.prepare(sql);
        const info = stmt.run(params);
        return {
            lastInsertRowid: info.lastInsertRowid,
            changes: info.changes
        };
    }

    async exec(sql: string): Promise<void> {
        this.db.exec(sql);
    }

    async transaction<T>(fn: () => Promise<T>): Promise<T> {
        this.db.exec("BEGIN");
        try {
            const result = await fn();
            this.db.exec("COMMIT");
            return result;
        } catch (e) {
            this.db.exec("ROLLBACK");
            throw e;
        }
    }

    async close(): Promise<void> {
        this.db.close();
    }
}
