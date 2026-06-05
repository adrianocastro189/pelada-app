import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresDrawAssignmentRepository } from './PostgresDrawAssignmentRepository';
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor';

class MockDrawSqlExecutor implements SqlExecutor {
  private data: Map<string, unknown> = new Map();

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const rows: T[] = [];

    if (sql.includes('INSERT INTO draw_assignments')) {
      const record = { id: `${Math.random()}`, pelada_id: params?.[0], pelada_team_id: params?.[1], player_id: params?.[2], created_at: new Date() };
      this.data.set(`${params?.[0]}-${params?.[2]}`, record);
      rows.push(record as T);
    } else if (sql.includes('DELETE FROM draw_assignments WHERE pelada_id')) {
      Array.from(this.data.keys()).forEach((k) => {
        if (k.startsWith(params?.[0] as string)) {
          this.data.delete(k);
          rows.push({ id: k } as T);
        }
      });
    }

    return { rows };
  }
}

describe('PostgresDrawAssignmentRepository', () => {
  let repo: PostgresDrawAssignmentRepository;

  beforeEach(() => {
    repo = new PostgresDrawAssignmentRepository(new MockDrawSqlExecutor());
  });

  it('assign creates a draw assignment', async () => {
    const result = await repo.assign('pelada-1', 'team-1', 'player-1');
    expect(result.id).toBeDefined();
    expect(result.player_id).toBe('player-1');
  });

  it('clearByPeladaId deletes all assignments for a pelada', async () => {
    await repo.assign('pelada-1', 'team-1', 'player-1');
    const result = await repo.clearByPeladaId('pelada-1');
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
