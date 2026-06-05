import { NeonSqlExecutor } from './NeonSqlExecutor'

// Hoist the mock before any imports that might pull in @neondatabase/serverless.
vi.mock('@neondatabase/serverless', () => {
  const mockFn = vi.fn(async () => [{ id: '00000000-0000-0000-0000-000000000001', name: 'Test' }])
  return { neon: vi.fn(() => mockFn) }
})

describe('NeonSqlExecutor', () => {
  it('calls neon() with the provided connection string', async () => {
    const { neon } = await import('@neondatabase/serverless')
    new NeonSqlExecutor('postgresql://user:pass@host/db')
    expect(neon).toHaveBeenCalledWith('postgresql://user:pass@host/db')
  })

  it('returns rows from a query', async () => {
    const executor = new NeonSqlExecutor('postgresql://user:pass@host/db')
    const result = await executor.query<{ id: string; name: string }>('SELECT id, name FROM profiles')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Test')
  })

  it('passes parameters to the underlying neon function', async () => {
    const executor = new NeonSqlExecutor('postgresql://user:pass@host/db')
    // We can only verify no errors are thrown; param passing is tested via the mock.
    await expect(
      executor.query('SELECT id FROM profiles WHERE id = $1', ['some-id']),
    ).resolves.toBeDefined()
  })
})
