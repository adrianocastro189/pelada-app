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
    this.execute = neon(connectionString, { disableWarningInBrowsers: true })
  }

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    // .query() returns rows directly (FullResults defaults to false)
    const rows = await this.execute.query<T>(sql, params ?? []) as unknown as T[]
    return { rows }
  }
}
