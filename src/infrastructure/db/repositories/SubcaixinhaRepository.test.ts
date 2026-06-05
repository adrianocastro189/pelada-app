import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresSubcaixinhaRepository } from './PostgresSubcaixinhaRepository';
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor';

class MockSubcaixinhaSqlExecutor implements SqlExecutor {
  private data: Map<string, unknown> = new Map();
  private nextId = 1;

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const rows: T[] = [];

    if (sql.includes('INSERT INTO subcaixinhas')) {
      const record = { id: `${this.nextId++}`, profile_id: params?.[0], name: params?.[1], goal: params?.[2], current_value: params?.[3] ?? 0, created_at: new Date() };
      this.data.set(record.id, record);
      rows.push(record as T);
    } else if (sql.includes('UPDATE subcaixinhas SET current_value')) {
      const id = params?.[1] as string;
      const record = this.data.get(id) as any;
      if (record) {
        record.current_value = (record.current_value ?? 0) + (params?.[0] as number);
        rows.push(record as T);
      }
    } else if (sql.includes('DELETE FROM subcaixinhas')) {
      Array.from(this.data.entries()).forEach(([k, v]: [string, unknown]) => {
        if (JSON.stringify(v).includes(params?.[0] as string)) {
          this.data.delete(k);
          rows.push({ id: k } as T);
        }
      });
    }

    return { rows };
  }
}

describe('PostgresSubcaixinhaRepository', () => {
  let repo: PostgresSubcaixinhaRepository;

  beforeEach(() => {
    repo = new PostgresSubcaixinhaRepository(new MockSubcaixinhaSqlExecutor());
  });

  it('create a subcaixinha with goal', async () => {
    const result = await repo.create('profile-1', { name: 'Emergency Fund', goal: 50000, current_value: 0 });
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Emergency Fund');
    expect(result.goal).toBe(50000);
  });

  it('adjustBalance updates current_value', async () => {
    const created = await repo.create('profile-1', { name: 'Fund', goal: 10000 });
    const result = await repo.adjustBalance(created.id, 5000);
    expect(result?.current_value).toBe(5000);
  });
});
