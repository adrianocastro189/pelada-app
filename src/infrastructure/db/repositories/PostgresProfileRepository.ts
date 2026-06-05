import { ProfileRepository, ProfileRecord } from '@ports/repositories/ProfileRepository';
import { SqlExecutor } from '@ports/SqlExecutor';

/**
 * PostgreSQL implementation of ProfileRepository.
 * Uses injected SqlExecutor for all database operations.
 */
export class PostgresProfileRepository implements ProfileRepository {
  constructor(private sqlExecutor: SqlExecutor) {}

  async create(profile: { name: string; convocation_template?: string }): Promise<ProfileRecord> {
    const convocationTemplate = profile.convocation_template ?? '';
    const sql = `
      INSERT INTO profiles (name, convocation_template)
      VALUES ($1, $2)
      RETURNING id, name, convocation_template, created_at
    `;
    const result = await this.sqlExecutor.query<ProfileRecord>(sql, [profile.name, convocationTemplate]);
    const record = result.rows[0];
    if (!record) throw new Error('Failed to insert profile');
    return {
      ...record,
      created_at: new Date(record.created_at),
    };
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM profiles WHERE id = $1';
    await this.sqlExecutor.query<{ id: string }>(sql, [id]);
    return true;
  }

  async findById(id: string): Promise<ProfileRecord | null> {
    const sql = 'SELECT id, name, convocation_template, created_at FROM profiles WHERE id = $1';
    const result = await this.sqlExecutor.query<ProfileRecord>(sql, [id]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return {
      ...record,
      created_at: new Date(record.created_at),
    };
  }

  async listAll(): Promise<ProfileRecord[]> {
    const sql = 'SELECT id, name, convocation_template, created_at FROM profiles ORDER BY created_at DESC';
    const result = await this.sqlExecutor.query<ProfileRecord>(sql, []);
    return result.rows.map((record) => ({
      ...record,
      created_at: new Date(record.created_at),
    }));
  }

  async update(
    id: string,
    data: { name?: string; convocation_template?: string }
  ): Promise<ProfileRecord | null> {
    const updates: string[] = [];
    const values: (string | undefined)[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex += 1;
    }

    if (data.convocation_template !== undefined) {
      updates.push(`convocation_template = $${paramIndex}`);
      values.push(data.convocation_template);
      paramIndex += 1;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `
      UPDATE profiles
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, convocation_template, created_at
    `;

    const result = await this.sqlExecutor.query<ProfileRecord>(sql, values);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return {
      ...record,
      created_at: new Date(record.created_at),
    };
  }
}
