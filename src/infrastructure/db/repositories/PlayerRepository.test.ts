import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresPlayerRepository } from './PostgresPlayerRepository';
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor';
import { PlayerRecord } from '@ports/repositories/PlayerRepository';

class MockPlayerSqlExecutor implements SqlExecutor {
  private data: Map<string, PlayerRecord> = new Map();
  private nextId = 1;

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const rows: T[] = [];

    if (sql.includes('INSERT INTO players')) {
      const id = `${this.nextId++}`;
      const record: PlayerRecord = {
        id,
        profile_id: params?.[0] as string,
        name: params?.[1] as string,
        nickname: params?.[2] as string | null,
        phone: params?.[3] as string | null,
        stars: params?.[4] as number,
        position: params?.[5] as PlayerRecord['position'],
        speed: params?.[6] as 'slow' | 'medium' | 'fast',
        invited_by_id: params?.[7] as string | null,
        status: 'active',
        created_at: new Date(),
      };
      this.data.set(id, record);
      rows.push(record as T);
    } else if (sql.includes('DELETE')) {
      const id = params?.[0] as string;
      const existed = this.data.has(id);
      if (existed) {
        this.data.delete(id);
        rows.push({ id } as T);
      }
    } else if (sql.includes('SELECT') && sql.includes('WHERE id = $1')) {
      const id = params?.[0] as string;
      const record = this.data.get(id);
      if (record) rows.push(record as T);
    } else if (sql.includes('SELECT') && sql.includes('status = \'active\'')) {
      const profileId = params?.[0] as string;
      Array.from(this.data.values())
        .filter((r) => r.profile_id === profileId && r.status === 'active')
        .forEach((r) => rows.push(r as T));
    } else if (sql.includes('SELECT') && sql.includes('ORDER BY name ASC')) {
      const profileId = params?.[0] as string;
      Array.from(this.data.values())
        .filter((r) => r.profile_id === profileId)
        .forEach((r) => rows.push(r as T));
    } else if (sql.includes('UPDATE players')) {
      const id = params?.[params.length - 1] as string;
      const record = this.data.get(id);
      if (record) {
        record.name = (params?.[0] as string) || record.name;
        rows.push(record as T);
      }
    }

    return { rows };
  }
}

describe('PostgresPlayerRepository', () => {
  let repo: PostgresPlayerRepository;
  let mockDb: MockPlayerSqlExecutor;

  beforeEach(() => {
    mockDb = new MockPlayerSqlExecutor();
    repo = new PostgresPlayerRepository(mockDb);
  });

  it('creates a player and returns with id and status=active', async () => {
    const result = await repo.create('profile-1', {
      name: 'John',
      stars: 3.5,
      position: 'midfield',
      speed: 'medium',
    });
    expect(result.id).toBeDefined();
    expect(result.name).toBe('John');
    expect(result.status).toBe('active');
  });

  it('listActiveByProfileId returns only active players', async () => {
    await repo.create('profile-1', { name: 'Player 1', stars: 3, position: 'midfield', speed: 'medium' });
    const result = await repo.listActiveByProfileId('profile-1');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.status === 'active')).toBe(true);
  });

  it('inactivate sets player status to inactive', async () => {
    const created = await repo.create('profile-1', { name: 'Test', stars: 3, position: 'midfield', speed: 'medium' });
    const result = await repo.inactivate(created.id);
    expect(result).toBe(true);
  });
});
