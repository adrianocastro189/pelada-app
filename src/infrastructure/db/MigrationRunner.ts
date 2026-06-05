import type { SqlExecutor } from '@ports/SqlExecutor'

/** A single schema migration. Each migration runs exactly once. */
export interface Migration {
  /** Unique identifier, e.g. "0001_create_enums". Chronological order is enforced. */
  readonly id: string
  /** Full SQL to execute when applying this migration. */
  readonly up: string
}

/**
 * Applies schema migrations in order, tracking which ones have already run.
 * Idempotent: safe to call multiple times — already-applied migrations are skipped.
 */
export class MigrationRunner {
  constructor(private readonly executor: SqlExecutor) {}

  /**
   * Ensures the tracking table exists, then applies any unapplied migrations
   * from the provided list, in the order they appear.
   */
  async migrate(migrations: readonly Migration[]): Promise<void> {
    await this.ensureMigrationsTable()
    const applied = await this.appliedIds()

    for (const migration of migrations) {
      if (!applied.includes(migration.id)) {
        await this.executor.query(migration.up)
        await this.executor.query(
          'INSERT INTO schema_migrations (id) VALUES ($1)',
          [migration.id],
        )
      }
    }
  }

  /** Returns IDs of all already-applied migrations in ascending order. */
  private async appliedIds(): Promise<string[]> {
    const result = await this.executor.query<{ id: string }>(
      'SELECT id FROM schema_migrations ORDER BY applied_at ASC',
    )
    return result.rows.map(r => r.id)
  }

  /** Creates the schema_migrations tracking table if it does not exist. */
  private async ensureMigrationsTable(): Promise<void> {
    await this.executor.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `)
  }
}
