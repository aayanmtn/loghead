import { Client } from "@libsql/client";
import { DatabaseAdapter } from "./adapter";

export class LibSqlClientAdapter implements DatabaseAdapter {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const resultSet = await this.client.execute({ sql, args: params });
    return resultSet.rows as unknown as T[];
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    const resultSet = await this.client.execute({ sql, args: params });
    if (resultSet.rows.length === 0) return undefined;
    return resultSet.rows[0] as unknown as T;
  }

  async run(
    sql: string,
    params: any[] = [],
  ): Promise<{ lastInsertRowid?: number | bigint; changes?: number }> {
    const resultSet = await this.client.execute({ sql, args: params });
    return {
      lastInsertRowid: resultSet.lastInsertRowid,
      changes: resultSet.rowsAffected,
    };
  }

  async exec(sql: string): Promise<void> {
    await this.client.execute(sql);
  }

  async transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    // Check if client supports transaction() method (it should for @libsql/client)
    if (typeof (this.client as any).transaction === "function") {
      const tx = await (this.client as any).transaction("write");

      // Create a lightweight adapter for the transaction
      const txAdapter: DatabaseAdapter = {
        query: async <TResult>(sql, params = []) => {
          const rs = await tx.execute({ sql, args: params });
          return rs.rows as unknown as TResult[];
        },
        get: async <TResult>(sql, params = []) => {
          const rs = await tx.execute({ sql, args: params });
          if (rs.rows.length === 0) return undefined;
          return rs.rows[0] as unknown as TResult;
        },
        run: async (sql, params = []) => {
          const rs = await tx.execute({ sql, args: params });
          return {
            lastInsertRowid: rs.lastInsertRowid,
            changes: rs.rowsAffected,
          };
        },
        exec: async (sql) => {
          await tx.execute(sql);
        },
        transaction: async (innerFn) => {
          // Flatten nested transactions for now
          return innerFn(txAdapter);
        },
        close: async () => {
          // Do nothing for transaction adapter close
        },
      };

      try {
        const result = await fn(txAdapter);
        await tx.commit();
        return result;
      } catch (e) {
        try {
          await tx.rollback();
        } catch (rollbackError) {
          // console.warn("Rollback failed:", rollbackError);
        }
        throw e;
      } finally {
        tx.close();
      }
    }

    // Fallback for clients without transaction() support (e.g. older versions or different implementations)
    // This is risky for concurrent usage on shared connection but maintains backward compatibility logic
    await this.client.execute("BEGIN");
    try {
      const result = await fn(this);
      await this.client.execute("COMMIT");
      return result;
    } catch (e) {
      try {
        await this.client.execute("ROLLBACK");
      } catch (rollbackError) {
        // console.warn("Rollback failed:", rollbackError);
      }
      throw e;
    }
  }

  async close(): Promise<void> {
    this.client.close();
  }
}
