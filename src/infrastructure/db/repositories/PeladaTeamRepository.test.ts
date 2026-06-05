import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresPeladaTeamRepository } from './PostgresPeladaTeamRepository';
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor';

class MockTeamSqlExecutor implements SqlExecutor {
  private data: Map<string, unknown> = new Map();
  private nextId = 1;

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const rows: T[] = [];

    if (sql.includes('INSERT INTO pelada_teams')) {
      const record = { id: `${this.nextId++}`, pelada_id: params?.[0], name: params?.[1], sort_order: params?.[2] ?? 0, created_at: new Date() };
      this.data.set(record.id, record);
      rows.push(record as T);
    } else if (sql.includes('DELETE')) {
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

describe('PostgresPeladaTeamRepository', () => {
  let repo: PostgresPeladaTeamRepository;

  beforeEach(() => {
    repo = new PostgresPeladaTeamRepository(new MockTeamSqlExecutor());
  });

  it('create a team and returns with id', async () => {
    const result = await repo.create('pelada-1', 'Team A', 1);
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Team A');
    expect(result.sort_order).toBe(1);
  });

  it('delete removes a team', async () => {
    const created = await repo.create('pelada-1', 'Team A');
    const result = await repo.delete(created.id);
    expect(result).toBe(true);
  });
});
