import { neon } from '@neondatabase/serverless'
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor'

/**
 * Production SqlExecutor backed by the Neon serverless HTTP/WebSocket driver.
 * Connects directly from the browser; no backend server required.
 * The connection string must be built in memory at runtime (never stored in the repo).
 */
export class NeonSqlExecutor implements SqlExecutor {
  private readonly execute: ReturnType<typeof neon>

  constructor(connectionString: string) {
    this.execute = neon(connectionString)
  }

  /**
   * Executes a parameterized SQL query and returns typed rows.
   * Params are spread as positional arguments to match the neon variadic signature.
   */
  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    // neon accepts (sql, ...params) — we spread the array to match its variadic form.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (await (this.execute as any)(sql, ...(params ?? []))) as T[]
    return { rows }
  }
}
