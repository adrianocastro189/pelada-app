import { FinancialRecordRepository, FinancialRecordRecord, CreateFinancialRecordInput, UpdateFinancialRecordInput } from '@ports/repositories/FinancialRecordRepository';
import { SqlExecutor } from '@ports/SqlExecutor';

export class PostgresFinancialRecordRepository implements FinancialRecordRepository {
  constructor(private sqlExecutor: SqlExecutor) {}

  async create(profileId: string, record: CreateFinancialRecordInput): Promise<FinancialRecordRecord> {
    const sql = `
      INSERT INTO financial_records (profile_id, date, description, value, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, profile_id, date, description, value, type, created_at
    `;
    const result = await this.sqlExecutor.query<FinancialRecordRecord>(sql, [
      profileId,
      record.date,
      record.description,
      record.value,
      record.type,
    ]);
    const row = result.rows[0];
    if (!row) throw new Error('Failed to insert financial record');
    return { ...row, date: new Date(row.date), created_at: new Date(row.created_at) };
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM financial_records WHERE id = $1';
    await this.sqlExecutor.query<{ id: string }>(sql, [id]);
    return true;
  }

  async findById(id: string): Promise<FinancialRecordRecord | null> {
    const sql = 'SELECT id, profile_id, date, description, value, type, created_at FROM financial_records WHERE id = $1';
    const result = await this.sqlExecutor.query<FinancialRecordRecord>(sql, [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { ...row, date: new Date(row.date), created_at: new Date(row.created_at) };
  }

  async listByProfileId(profileId: string): Promise<FinancialRecordRecord[]> {
    const sql = `
      SELECT id, profile_id, date, description, value, type, created_at
      FROM financial_records WHERE profile_id = $1 ORDER BY date DESC
    `;
    const result = await this.sqlExecutor.query<FinancialRecordRecord>(sql, [profileId]);
    return result.rows.map((r) => ({ ...r, date: new Date(r.date), created_at: new Date(r.created_at) }));
  }

  async listByProfileIdAndDateRange(profileId: string, startDate: Date, endDate: Date): Promise<FinancialRecordRecord[]> {
    const sql = `
      SELECT id, profile_id, date, description, value, type, created_at
      FROM financial_records WHERE profile_id = $1 AND date >= $2 AND date <= $3 ORDER BY date DESC
    `;
    const result = await this.sqlExecutor.query<FinancialRecordRecord>(sql, [profileId, startDate, endDate]);
    return result.rows.map((r) => ({ ...r, date: new Date(r.date), created_at: new Date(r.created_at) }));
  }

  async update(id: string, data: UpdateFinancialRecordInput): Promise<FinancialRecordRecord | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(data.date);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.value !== undefined) {
      updates.push(`value = $${paramIndex++}`);
      values.push(data.value);
    }
    if (data.type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      values.push(data.type);
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    const sql = `
      UPDATE financial_records SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, profile_id, date, description, value, type, created_at
    `;

    const result = await this.sqlExecutor.query<FinancialRecordRecord>(sql, values);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { ...row, date: new Date(row.date), created_at: new Date(row.created_at) };
  }
}
