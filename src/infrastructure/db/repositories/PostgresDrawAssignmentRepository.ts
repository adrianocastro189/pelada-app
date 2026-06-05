import { DrawAssignmentRepository, DrawAssignmentRecord } from '@ports/repositories/DrawAssignmentRepository';
import { SqlExecutor } from '@ports/SqlExecutor';

export class PostgresDrawAssignmentRepository implements DrawAssignmentRepository {
  constructor(private sqlExecutor: SqlExecutor) {}

  async assign(peladaId: string, peladaTeamId: string, playerId: string): Promise<DrawAssignmentRecord> {
    const sql = `
      INSERT INTO draw_assignments (pelada_id, pelada_team_id, player_id)
      VALUES ($1, $2, $3)
      RETURNING id, pelada_id, pelada_team_id, player_id, created_at
    `;
    const result = await this.sqlExecutor.query<DrawAssignmentRecord>(sql, [peladaId, peladaTeamId, playerId]);
    const record = result.rows[0];
    if (!record) throw new Error('Failed to assign player to team');
    return { ...record, created_at: new Date(record.created_at) };
  }

  async clearByPeladaId(peladaId: string): Promise<number> {
    const sql = 'DELETE FROM draw_assignments WHERE pelada_id = $1';
    const result = await this.sqlExecutor.query<{ id: string }>(sql, [peladaId]);
    return result.rows.length;
  }

  async findPlayerTeamInPelada(peladaId: string, playerId: string): Promise<DrawAssignmentRecord | null> {
    const sql = `
      SELECT id, pelada_id, pelada_team_id, player_id, created_at
      FROM draw_assignments WHERE pelada_id = $1 AND player_id = $2
    `;
    const result = await this.sqlExecutor.query<DrawAssignmentRecord>(sql, [peladaId, playerId]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, created_at: new Date(record.created_at) };
  }

  async listByPeladaId(peladaId: string): Promise<DrawAssignmentRecord[]> {
    const sql = `
      SELECT id, pelada_id, pelada_team_id, player_id, created_at
      FROM draw_assignments WHERE pelada_id = $1
    `;
    const result = await this.sqlExecutor.query<DrawAssignmentRecord>(sql, [peladaId]);
    return result.rows.map((r) => ({ ...r, created_at: new Date(r.created_at) }));
  }

  async replaceDrawForPelada(peladaId: string, assignments: Array<{ peladaTeamId: string; playerId: string }>): Promise<void> {
    await this.clearByPeladaId(peladaId);
    for (const assignment of assignments) {
      await this.assign(peladaId, assignment.peladaTeamId, assignment.playerId);
    }
  }
}
