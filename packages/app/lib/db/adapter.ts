export interface DatabaseAdapter {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  get<T>(sql: string, params?: any[]): Promise<T | undefined>;
  run(
    sql: string,
    params?: any[],
  ): Promise<{ lastInsertRowid?: number | bigint; changes?: number }>;
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
