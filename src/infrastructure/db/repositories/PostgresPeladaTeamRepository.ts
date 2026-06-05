import { PeladaTeamRepository, PeladaTeamRecord } from '@ports/repositories/PeladaTeamRepository';
import { SqlExecutor } from '@ports/SqlExecutor';

export class PostgresPeladaTeamRepository implements PeladaTeamRepository {
  constructor(private sqlExecutor: SqlExecutor) {}

  async create(peladaId: string, name: string, sort_order?: number): Promise<PeladaTeamRecord> {
    const sql = `
      INSERT INTO pelada_teams (pelada_id, name, sort_order)
      VALUES ($1, $2, $3)
      RETURNING id, pelada_id, name, sort_order, created_at
    `;
    const result = await this.sqlExecutor.query<PeladaTeamRecord>(sql, [peladaId, name, sort_order ?? 0]);
    const record = result.rows[0];
    if (!record) throw new Error('Failed to create team');
    return { ...record, created_at: new Date(record.created_at) };
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM pelada_teams WHERE id = $1';
    const result = await this.sqlExecutor.query<{ id: string }>(sql, [id]);
    return result.rows.length > 0;
  }

  async deleteAllByPeladaId(peladaId: string): Promise<number> {
    const sql = 'DELETE FROM pelada_teams WHERE pelada_id = $1';
    const result = await this.sqlExecutor.query<{ id: string }>(sql, [peladaId]);
    return result.rows.length;
  }

  async findById(id: string): Promise<PeladaTeamRecord | null> {
    const sql = 'SELECT id, pelada_id, name, sort_order, created_at FROM pelada_teams WHERE id = $1';
    const result = await this.sqlExecutor.query<PeladaTeamRecord>(sql, [id]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, created_at: new Date(record.created_at) };
  }

  async listByPeladaId(peladaId: string): Promise<PeladaTeamRecord[]> {
    const sql = 'SELECT id, pelada_id, name, sort_order, created_at FROM pelada_teams WHERE pelada_id = $1 ORDER BY sort_order ASC';
    const result = await this.sqlExecutor.query<PeladaTeamRecord>(sql, [peladaId]);
    return result.rows.map((r) => ({ ...r, created_at: new Date(r.created_at) }));
  }

  async update(id: string, name: string): Promise<PeladaTeamRecord | null> {
    const sql = 'UPDATE pelada_teams SET name = $1 WHERE id = $2 RETURNING id, pelada_id, name, sort_order, created_at';
    const result = await this.sqlExecutor.query<PeladaTeamRecord>(sql, [name, id]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, created_at: new Date(record.created_at) };
  }
}
