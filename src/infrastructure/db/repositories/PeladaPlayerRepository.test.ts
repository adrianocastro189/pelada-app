import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresPeladaPlayerRepository } from './PostgresPeladaPlayerRepository';
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor';

class MockPeladaPlayerSqlExecutor implements SqlExecutor {
  private data: Map<string, unknown> = new Map();

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const rows: T[] = [];

    if (sql.includes('INSERT INTO pelada_players')) {
      const id = `${Object.keys(this.data).length + 1}`;
      const record = { id, pelada_id: params?.[0], player_id: params?.[1], slot_type: params?.[2], paid: false, created_at: new Date() };
      this.data.set(id, record);
      rows.push(record as T);
    } else if (sql.includes('DELETE')) {
      const key = `${params?.[0]}-${params?.[1]}`;
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

describe('PostgresPeladaPlayerRepository', () => {
  let repo: PostgresPeladaPlayerRepository;

  beforeEach(() => {
    repo = new PostgresPeladaPlayerRepository(new MockPeladaPlayerSqlExecutor());
  });

  it('addToRoster creates a roster entry', async () => {
    const result = await repo.addToRoster('pelada-1', 'player-1', 'line');
    expect(result.id).toBeDefined();
    expect(result.paid).toBe(false);
  });

  it('removeFromRoster deletes a player', async () => {
    await repo.addToRoster('pelada-1', 'player-1', 'line');
    const result = await repo.removeFromRoster('pelada-1', 'player-1');
    expect(result).toBe(true);
  });
});
