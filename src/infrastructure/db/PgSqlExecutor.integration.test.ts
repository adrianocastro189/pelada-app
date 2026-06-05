import { PgSqlExecutor } from './PgSqlExecutor'

const DATABASE_URL =
  process.env['DATABASE_URL'] ?? 'postgresql://pelada:pelada_test@localhost:5432/pelada_test'

describe('PgSqlExecutor (integration)', () => {
  let executor: PgSqlExecutor

  beforeEach(() => {
    executor = new PgSqlExecutor(DATABASE_URL)
  })

  afterEach(async () => {
    await executor.dispose()
  })

  it('executes a simple query and returns rows', async () => {
    const result = await executor.query<{ value: number }>('SELECT 1 AS value')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].value).toBe(1)
  })

  it('supports parameterized queries', async () => {
    const result = await executor.query<{ answer: number }>(
      'SELECT $1::int AS answer',
      [42],
    )
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].answer).toBe(42)
  })

  it('returns an empty rows array for DDL statements', async () => {
    const result = await executor.query(
      'CREATE TEMP TABLE temp_test_pg (id SERIAL PRIMARY KEY)',
    )
    expect(result.rows).toEqual([])
  })

  it('returns multiple rows', async () => {
    const result = await executor.query<{ n: number }>(
      'SELECT generate_series(1, 3) AS n',
    )
    expect(result.rows).toHaveLength(3)
    expect(result.rows.map(r => r.n)).toEqual([1, 2, 3])
  })
})
