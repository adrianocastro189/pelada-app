import { PeladaPlayerRepository, PeladaPlayerRecord } from '@ports/repositories/PeladaPlayerRepository';
import { SqlExecutor } from '@ports/SqlExecutor';

export class PostgresPeladaPlayerRepository implements PeladaPlayerRepository {
  constructor(private sqlExecutor: SqlExecutor) {}

  async addToRoster(peladaId: string, playerId: string, slot_type: 'goalkeeper' | 'line'): Promise<PeladaPlayerRecord> {
    const sql = `
      INSERT INTO pelada_players (pelada_id, player_id, slot_type, paid)
      VALUES ($1, $2, $3, false)
      RETURNING id, pelada_id, player_id, slot_type, paid, created_at
    `;
    const result = await this.sqlExecutor.query<PeladaPlayerRecord>(sql, [peladaId, playerId, slot_type]);
    const record = result.rows[0];
    if (!record) throw new Error('Failed to add player to roster');
    return { ...record, created_at: new Date(record.created_at) };
  }

  async findByPeladaAndPlayer(peladaId: string, playerId: string): Promise<PeladaPlayerRecord | null> {
    const sql = `
      SELECT id, pelada_id, player_id, slot_type, paid, created_at
      FROM pelada_players WHERE pelada_id = $1 AND player_id = $2
    `;
    const result = await this.sqlExecutor.query<PeladaPlayerRecord>(sql, [peladaId, playerId]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, created_at: new Date(record.created_at) };
  }

  async listByPeladaId(peladaId: string): Promise<PeladaPlayerRecord[]> {
    const sql = `
      SELECT id, pelada_id, player_id, slot_type, paid, created_at
      FROM pelada_players WHERE pelada_id = $1
    `;
    const result = await this.sqlExecutor.query<PeladaPlayerRecord>(sql, [peladaId]);
    return result.rows.map((r) => ({ ...r, created_at: new Date(r.created_at) }));
  }

  async removeFromRoster(peladaId: string, playerId: string): Promise<boolean> {
    const sql = 'DELETE FROM pelada_players WHERE pelada_id = $1 AND player_id = $2';
    const result = await this.sqlExecutor.query<{ id: string }>(sql, [peladaId, playerId]);
    return result.rows.length > 0;
  }

  async setPaid(peladaId: string, playerId: string, paid: boolean): Promise<PeladaPlayerRecord | null> {
    const sql = `
      UPDATE pelada_players SET paid = $1
      WHERE pelada_id = $2 AND player_id = $3
      RETURNING id, pelada_id, player_id, slot_type, paid, created_at
    `;
    const result = await this.sqlExecutor.query<PeladaPlayerRecord>(sql, [paid, peladaId, playerId]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, created_at: new Date(record.created_at) };
  }
}
