import { SubcaixinhaRepository, SubcaixinhaRecord, CreateSubcaixinhaInput, UpdateSubcaixinhaInput } from '@ports/repositories/SubcaixinhaRepository';
import { SqlExecutor } from '@ports/SqlExecutor';

export class PostgresSubcaixinhaRepository implements SubcaixinhaRepository {
  constructor(private sqlExecutor: SqlExecutor) {}

  async adjustBalance(id: string, delta: number): Promise<SubcaixinhaRecord | null> {
    const sql = `
      UPDATE subcaixinhas SET current_value = current_value + $1
      WHERE id = $2
      RETURNING id, profile_id, name, goal, current_value, created_at
    `;
    const result = await this.sqlExecutor.query<SubcaixinhaRecord>(sql, [delta, id]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, created_at: new Date(record.created_at) };
  }

  async create(profileId: string, subcaixinha: CreateSubcaixinhaInput): Promise<SubcaixinhaRecord> {
    const sql = `
      INSERT INTO subcaixinhas (profile_id, name, goal, current_value)
      VALUES ($1, $2, $3, $4)
      RETURNING id, profile_id, name, goal, current_value, created_at
    `;
    const result = await this.sqlExecutor.query<SubcaixinhaRecord>(sql, [
      profileId,
      subcaixinha.name,
      subcaixinha.goal ?? null,
      subcaixinha.current_value ?? 0,
    ]);
    const record = result.rows[0];
    if (!record) throw new Error('Failed to create subcaixinha');
    return { ...record, created_at: new Date(record.created_at) };
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM subcaixinhas WHERE id = $1 AND current_value = 0';
    await this.sqlExecutor.query<{ id: string }>(sql, [id]);
    return true;
  }

  async findById(id: string): Promise<SubcaixinhaRecord | null> {
    const sql = 'SELECT id, profile_id, name, goal, current_value, created_at FROM subcaixinhas WHERE id = $1';
    const result = await this.sqlExecutor.query<SubcaixinhaRecord>(sql, [id]);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, created_at: new Date(record.created_at) };
  }

  async listByProfileId(profileId: string): Promise<SubcaixinhaRecord[]> {
    const sql = 'SELECT id, profile_id, name, goal, current_value, created_at FROM subcaixinhas WHERE profile_id = $1 ORDER BY name ASC';
    const result = await this.sqlExecutor.query<SubcaixinhaRecord>(sql, [profileId]);
    return result.rows.map((r) => ({ ...r, created_at: new Date(r.created_at) }));
  }

  async update(id: string, data: UpdateSubcaixinhaInput): Promise<SubcaixinhaRecord | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.goal !== undefined) {
      updates.push(`goal = $${paramIndex++}`);
      values.push(data.goal);
    }
    if (data.current_value !== undefined) {
      updates.push(`current_value = $${paramIndex++}`);
      values.push(data.current_value);
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    const sql = `
      UPDATE subcaixinhas SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, profile_id, name, goal, current_value, created_at
    `;

    const result = await this.sqlExecutor.query<SubcaixinhaRecord>(sql, values);
    if (result.rows.length === 0) return null;
    const record = result.rows[0];
    return { ...record, created_at: new Date(record.created_at) };
  }
}
