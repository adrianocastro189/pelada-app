import { MigrationRunner } from './MigrationRunner'
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor'
import type { Migration } from './MigrationRunner'

/** In-memory SqlExecutor fake for unit testing MigrationRunner. */
class FakeSqlExecutor implements SqlExecutor {
  readonly executedSql: string[] = []
  private responseQueue: Array<{ rows: Record<string, unknown>[] }> = []

  /** Enqueue a response that will be returned by the next query() call. */
  addResponse(rows: Record<string, unknown>[]): void {
    this.responseQueue.push({ rows })
  }

  async query<T>(sql: string): Promise<QueryResult<T>> {
    this.executedSql.push(sql.trim())
    const response = this.responseQueue.shift() ?? { rows: [] }
    return { rows: response.rows as T[] }
  }
}

const MIGRATION_A: Migration = { id: '0001_a', up: 'CREATE TABLE a (id UUID)' }
const MIGRATION_B: Migration = { id: '0002_b', up: 'CREATE TABLE b (id UUID)' }

describe('MigrationRunner', () => {
  let fake: FakeSqlExecutor
  let runner: MigrationRunner

  beforeEach(() => {
    fake = new FakeSqlExecutor()
    runner = new MigrationRunner(fake)
  })

  it('creates the schema_migrations tracking table on first run', async () => {
    await runner.migrate([])
    expect(fake.executedSql[0]).toContain('CREATE TABLE IF NOT EXISTS schema_migrations')
  })

  it('queries applied migrations after creating the tracking table', async () => {
    await runner.migrate([])
    expect(fake.executedSql[1]).toContain('SELECT id FROM schema_migrations')
  })

  it('applies unapplied migrations in order', async () => {
    // CREATE TABLE IF NOT EXISTS → { rows: [] }
    // SELECT applied              → { rows: [] } (none applied yet)
    await runner.migrate([MIGRATION_A, MIGRATION_B])

    expect(fake.executedSql).toContain(MIGRATION_A.up)
    expect(fake.executedSql).toContain(MIGRATION_B.up)
    const aIndex = fake.executedSql.indexOf(MIGRATION_A.up)
    const bIndex = fake.executedSql.indexOf(MIGRATION_B.up)
    expect(aIndex).toBeLessThan(bIndex)
  })

  it('records each applied migration in schema_migrations', async () => {
    await runner.migrate([MIGRATION_A])

    const insertCalls = fake.executedSql.filter(sql =>
      sql.includes('INSERT INTO schema_migrations'),
    )
    expect(insertCalls).toHaveLength(1)
  })

  it('skips already-applied migrations', async () => {
    // Simulate MIGRATION_A already applied
    fake.addResponse([]) // CREATE TABLE
    fake.addResponse([{ id: MIGRATION_A.id }]) // SELECT applied → A is done

    await runner.migrate([MIGRATION_A, MIGRATION_B])

    // MIGRATION_A.up must NOT appear in executed SQL
    expect(fake.executedSql).not.toContain(MIGRATION_A.up)
    // MIGRATION_B.up must appear
    expect(fake.executedSql).toContain(MIGRATION_B.up)
  })

  it('is idempotent when all migrations are already applied', async () => {
    fake.addResponse([]) // CREATE TABLE
    fake.addResponse([{ id: MIGRATION_A.id }, { id: MIGRATION_B.id }]) // all applied

    await runner.migrate([MIGRATION_A, MIGRATION_B])

    expect(fake.executedSql).not.toContain(MIGRATION_A.up)
    expect(fake.executedSql).not.toContain(MIGRATION_B.up)
  })

  it('runs no migration SQL when the list is empty', async () => {
    await runner.migrate([])
    // Only the two bookkeeping queries (CREATE TABLE + SELECT) should have run
    expect(fake.executedSql).toHaveLength(2)
  })
})
