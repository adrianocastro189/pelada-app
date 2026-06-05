/** Result of a SQL query. */
export interface QueryResult<T> {
  rows: T[]
}

/**
 * Injected SQL transport port. Allows repositories to be tested against
 * Docker Postgres (PgSqlExecutor) while production uses the Neon serverless
 * driver (NeonSqlExecutor). The SQL is identical — only the transport differs.
 */
export interface SqlExecutor {
  /** Executes a parameterized SQL query and returns typed rows. */
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>
}
