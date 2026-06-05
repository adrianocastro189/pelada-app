import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresFinancialRecordRepository } from './PostgresFinancialRecordRepository';
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor';

class MockFinancialSqlExecutor implements SqlExecutor {
  private data: Map<string, unknown> = new Map();
  private nextId = 1;

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const rows: T[] = [];

    if (sql.includes('INSERT INTO financial_records')) {
      const record = { id: `${this.nextId++}`, profile_id: params?.[0], date: params?.[1], description: params?.[2], value: params?.[3], type: params?.[4], created_at: new Date() };
      this.data.set(record.id, record);
      rows.push(record as T);
    } else if (sql.includes('DELETE FROM financial_records')) {
      Array.from(this.data.entries()).forEach(([k, v]: [string, unknown]) => {
        if (JSON.stringify(v).includes(params?.[0] as string)) {
          this.data.delete(k);
          rows.push({ id: k } as T);
        }
      });
    }

    return { rows };
  }
}

describe('PostgresFinancialRecordRepository', () => {
  let repo: PostgresFinancialRecordRepository;

  beforeEach(() => {
    repo = new PostgresFinancialRecordRepository(new MockFinancialSqlExecutor());
  });

  it('create a financial record', async () => {
    const result = await repo.create('profile-1', { date: new Date(), description: 'Test', value: 1000, type: 'credit' });
    expect(result.id).toBeDefined();
    expect(result.value).toBe(1000);
    expect(result.type).toBe('credit');
  });

  it('delete removes a record', async () => {
    const created = await repo.create('profile-1', { date: new Date(), description: 'Test', value: 1000, type: 'debit' });
    const result = await repo.delete(created.id);
    expect(result).toBe(true);
  });
});
