import { Pool } from 'pg'
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor'

/**
 * Test-only SqlExecutor backed by node-postgres (pg).
 * Used exclusively in integration tests against a local Docker Postgres 16 container.
 * NEVER imported by the production composition root.
 *
 * See docker-compose.yml for the test database configuration.
 * See ARCHITECTURE.md ADR-5 for the rationale.
 */
export class PgSqlExecutor implements SqlExecutor {
  private readonly pool: Pool

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString })
  }

  /** Releases all pool connections. Call this in afterEach / afterAll. */
  async dispose(): Promise<void> {
    await this.pool.end()
  }

  /**
   * Executes a parameterized SQL query and returns typed rows.
   * Params are passed as-is to pg's query method.
   */
  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    // pg's pool.query<T> requires T extends QueryResultRow — we cast after the call
    // to keep our SqlExecutor port generic (no pg-specific constraint leaks into the domain).
    const result = await this.pool.query(sql, params)
    return { rows: result.rows as T[] }
  }
}
