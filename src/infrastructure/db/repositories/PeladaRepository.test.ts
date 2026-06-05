import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresPeladaRepository } from './PostgresPeladaRepository';
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor';
import { PeladaRecord } from '@ports/repositories/PeladaRepository';

class MockPeladaSqlExecutor implements SqlExecutor {
  private data: Map<string, PeladaRecord> = new Map();
  private nextId = 1;

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const rows: T[] = [];

    if (sql.includes('INSERT INTO peladas') && !sql.includes('SELECT')) {
      const id = `${this.nextId++}`;
      const record: PeladaRecord = {
        id,
        profile_id: params?.[0] as string,
        date: new Date(params?.[1] as string),
        time: params?.[2] as string | null,
        location: params?.[3] as string | null,
        players_per_team: params?.[4] as number,
        max_goalkeepers: params?.[5] as number,
        cost_per_player: params?.[6] as number,
        goalkeeper_pays: params?.[7] as boolean,
        created_at: new Date(),
      };
      this.data.set(id, record);
      rows.push(record as T);
    } else if (sql.includes('DELETE FROM peladas')) {
      const id = params?.[0] as string;
      const existed = this.data.has(id);
      if (existed) this.data.delete(id);
      if (existed) rows.push({ id } as T);
    } else if (sql.includes('SELECT') && sql.includes('WHERE id = $1')) {
      const id = params?.[0] as string;
      const record = this.data.get(id);
      if (record) rows.push(record as T);
    }

    return { rows };
  }
}

describe('PostgresPeladaRepository', () => {
  let repo: PostgresPeladaRepository;
  let mockDb: MockPeladaSqlExecutor;

  beforeEach(() => {
    mockDb = new MockPeladaSqlExecutor();
    repo = new PostgresPeladaRepository(mockDb);
  });

  it('creates a pelada and returns with id', async () => {
    const result = await repo.create('profile-1', {
      date: new Date('2026-06-10'),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: true,
    });
    expect(result.id).toBeDefined();
    expect(result.players_per_team).toBe(5);
  });

  it('findById returns null for non-existent pelada', async () => {
    const result = await repo.findById('non-existent');
    expect(result).toBeNull();
  });

  it('delete returns true if pelada exists', async () => {
    const created = await repo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: true,
    });
    const result = await repo.delete(created.id);
    expect(result).toBe(true);
  });
});
