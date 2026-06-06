import { PlayerRepository, PlayerRecord, CreatePlayerInput, UpdatePlayerInput } from '@ports/repositories/PlayerRepository';
import { SqlExecutor } from '@ports/SqlExecutor';

/**
 * PostgreSQL implementation of PlayerRepository.
 * Soft delete via status = 'inactive' (never hard delete).
 */
export class PostgresPlayerRepository implements PlayerRepository {
  constructor(private sqlExecutor: SqlExecutor) {}

  /**
   * Normalize a raw DB row into a PlayerRecord. The `stars` column is
   * NUMERIC, which the pg driver returns as a string to preserve precision,
   * so it must be coerced to a number to satisfy the port contract.
   */
  private mapRow(record: PlayerRecord): PlayerRecord {
    return {
      ...record,
      stars: Number(record.stars),
      created_at: new Date(record.created_at),
    };
  }

  async create(profileId: string, player: CreatePlayerInput): Promise<PlayerRecord> {
    const sql = `
      INSERT INTO players (profile_id, name, nickname, phone, stars, position, speed, invited_by_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      RETURNING id, profile_id, name, nickname, phone, stars, position, speed, invited_by_id, status, created_at
    `;
    const result = await this.sqlExecutor.query<PlayerRecord>(sql, [
      profileId,
      player.name,
      player.nickname ?? null,
      player.phone ?? null,
      player.stars,
      player.position,
      player.speed,
      player.invited_by_id ?? null,
    ]);
    const record = result.rows[0];
    if (!record) throw new Error('Failed to insert player');
    return this.mapRow(record);
  }

  async findById(id: string): Promise<PlayerRecord | null> {
    const sql = `
      SELECT id, profile_id, name, nickname, phone, stars, position, speed, invited_by_id, status, created_at
      FROM players WHERE id = $1
    `;
    const result = await this.sqlExecutor.query<PlayerRecord>(sql, [id]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return this.mapRow(record);
  }

  async listActiveByProfileId(profileId: string): Promise<PlayerRecord[]> {
    const sql = `
      SELECT id, profile_id, name, nickname, phone, stars, position, speed, invited_by_id, status, created_at
      FROM players WHERE profile_id = $1 AND status = 'active' ORDER BY name ASC
    `;
    const result = await this.sqlExecutor.query<PlayerRecord>(sql, [profileId]);
    return result.rows.map((r) => this.mapRow(r));
  }

  async listAllByProfileId(profileId: string): Promise<PlayerRecord[]> {
    const sql = `
      SELECT id, profile_id, name, nickname, phone, stars, position, speed, invited_by_id, status, created_at
      FROM players WHERE profile_id = $1 ORDER BY name ASC
    `;
    const result = await this.sqlExecutor.query<PlayerRecord>(sql, [profileId]);
    return result.rows.map((r) => this.mapRow(r));
  }

  async inactivate(id: string): Promise<boolean> {
    const sql = 'UPDATE players SET status = \'inactive\' WHERE id = $1 RETURNING id';
    const result = await this.sqlExecutor.query<{ id: string }>(sql, [id]);
    return result.rows.length > 0;
  }

  async reactivate(id: string): Promise<boolean> {
    const sql = 'UPDATE players SET status = \'active\' WHERE id = $1 AND status = \'inactive\' RETURNING id';
    const result = await this.sqlExecutor.query<{ id: string }>(sql, [id]);
    return result.rows.length > 0;
  }

  async searchByNameInProfile(profileId: string, query: string): Promise<PlayerRecord[]> {
    const sql = `
      SELECT id, profile_id, name, nickname, phone, stars, position, speed, invited_by_id, status, created_at
      FROM players WHERE profile_id = $1 AND status = 'active' AND name ILIKE $2
      ORDER BY name ASC
    `;
    const result = await this.sqlExecutor.query<PlayerRecord>(sql, [profileId, `%${query}%`]);
    return result.rows.map((r) => this.mapRow(r));
  }

  async update(id: string, data: UpdatePlayerInput): Promise<PlayerRecord | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.nickname !== undefined) {
      updates.push(`nickname = $${paramIndex++}`);
      values.push(data.nickname);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }
    if (data.stars !== undefined) {
      updates.push(`stars = $${paramIndex++}`);
      values.push(data.stars);
    }
    if (data.position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(data.position);
    }
    if (data.speed !== undefined) {
      updates.push(`speed = $${paramIndex++}`);
      values.push(data.speed);
    }
    if (data.invited_by_id !== undefined) {
      updates.push(`invited_by_id = $${paramIndex++}`);
      values.push(data.invited_by_id);
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    const sql = `
      UPDATE players SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, profile_id, name, nickname, phone, stars, position, speed, invited_by_id, status, created_at
    `;

    const result = await this.sqlExecutor.query<PlayerRecord>(sql, values);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return this.mapRow(record);
  }
}
