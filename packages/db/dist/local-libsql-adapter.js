export class LocalLibSqlAdapter {
    db;
    constructor(db) {
        this.db = db;
    }
    async query(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.all(params);
    }
    async get(sql, params = []) {
        const stmt = this.db.prepare(sql);
        return stmt.get(params);
    }
    async run(sql, params = []) {
        const stmt = this.db.prepare(sql);
        const info = stmt.run(params);
        return {
            lastInsertRowid: info.lastInsertRowid,
            changes: info.changes
        };
    }
    async exec(sql) {
        await this.db.exec(sql);
    }
    async transaction(fn) {
        await this.db.exec("BEGIN");
        try {
            const result = await fn();
            await this.db.exec("COMMIT");
            return result;
        }
        catch (e) {
            await this.db.exec("ROLLBACK");
            throw e;
        }
    }
    async close() {
        this.db.close();
    }
}
