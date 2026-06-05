import { PeladaRepository, PeladaRecord, CreatePeladaInput, UpdatePeladaInput } from '@ports/repositories/PeladaRepository';
import { SqlExecutor } from '@ports/SqlExecutor';

export class PostgresPeladaRepository implements PeladaRepository {
  constructor(private sqlExecutor: SqlExecutor) {}

  async create(profileId: string, pelada: CreatePeladaInput): Promise<PeladaRecord> {
    const sql = `
      INSERT INTO peladas (profile_id, date, time, location, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, profile_id, date, time, location, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays, created_at
    `;
    const result = await this.sqlExecutor.query<PeladaRecord>(sql, [
      profileId,
      pelada.date,
      pelada.time ?? null,
      pelada.location ?? null,
      pelada.players_per_team,
      pelada.max_goalkeepers,
      pelada.cost_per_player,
      pelada.goalkeeper_pays,
    ]);
    const record = result.rows[0];
    if (!record) throw new Error('Failed to insert pelada');
    return { ...record, date: new Date(record.date), created_at: new Date(record.created_at) };
  }

  async clone(id: string, newDate: Date): Promise<PeladaRecord> {
    const sql = `
      INSERT INTO peladas (profile_id, date, time, location, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays)
      SELECT profile_id, $1, time, location, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays
      FROM peladas WHERE id = $2
      RETURNING id, profile_id, date, time, location, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays, created_at
    `;
    const result = await this.sqlExecutor.query<PeladaRecord>(sql, [newDate, id]);
    const record = result.rows[0];
    if (!record) throw new Error('Failed to clone pelada');
    return { ...record, date: new Date(record.date), created_at: new Date(record.created_at) };
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM peladas WHERE id = $1 RETURNING id';
    const result = await this.sqlExecutor.query<{ id: string }>(sql, [id]);
    return result.rows.length > 0;
  }

  async findById(id: string): Promise<PeladaRecord | null> {
    const sql = `
      SELECT id, profile_id, date, time, location, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays, created_at
      FROM peladas WHERE id = $1
    `;
    const result = await this.sqlExecutor.query<PeladaRecord>(sql, [id]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, date: new Date(record.date), created_at: new Date(record.created_at) };
  }

  async listByProfileId(profileId: string): Promise<PeladaRecord[]> {
    const sql = `
      SELECT id, profile_id, date, time, location, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays, created_at
      FROM peladas WHERE profile_id = $1 ORDER BY date DESC
    `;
    const result = await this.sqlExecutor.query<PeladaRecord>(sql, [profileId]);
    return result.rows.map((r) => ({ ...r, date: new Date(r.date), created_at: new Date(r.created_at) }));
  }

  async update(id: string, data: UpdatePeladaInput): Promise<PeladaRecord | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(data.date);
    }
    if (data.time !== undefined) {
      updates.push(`time = $${paramIndex++}`);
      values.push(data.time);
    }
    if (data.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(data.location);
    }
    if (data.players_per_team !== undefined) {
      updates.push(`players_per_team = $${paramIndex++}`);
      values.push(data.players_per_team);
    }
    if (data.max_goalkeepers !== undefined) {
      updates.push(`max_goalkeepers = $${paramIndex++}`);
      values.push(data.max_goalkeepers);
    }
    if (data.cost_per_player !== undefined) {
      updates.push(`cost_per_player = $${paramIndex++}`);
      values.push(data.cost_per_player);
    }
    if (data.goalkeeper_pays !== undefined) {
      updates.push(`goalkeeper_pays = $${paramIndex++}`);
      values.push(data.goalkeeper_pays);
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    const sql = `
      UPDATE peladas SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, profile_id, date, time, location, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays, created_at
    `;

    const result = await this.sqlExecutor.query<PeladaRecord>(sql, values);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, date: new Date(record.date), created_at: new Date(record.created_at) };
  }
}
