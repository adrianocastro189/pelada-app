import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresProfileRepository } from './PostgresProfileRepository';
import type { SqlExecutor, QueryResult } from '@ports/SqlExecutor';
import { ProfileRecord } from '@ports/repositories/ProfileRepository';

/**
 * Mock SqlExecutor for unit testing.
 */
class MockSqlExecutor implements SqlExecutor {
  private data: Map<string, ProfileRecord> = new Map();
  private nextId = 1;

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const rows: T[] = [];

    // CREATE
    if (sql.includes('INSERT INTO profiles')) {
      const id = `${this.nextId++}`;
      const record: ProfileRecord = {
        id,
        name: params?.[0] as string,
        convocation_template: params?.[1] as string,
        created_at: new Date(),
      };
      this.data.set(id, record);
      rows.push(record as T);
    }
    // SELECT by id
    else if (sql.includes('WHERE id = $1')) {
      const id = params?.[0] as string;
      const record = this.data.get(id);
      if (record) rows.push(record as T);
    }
    // SELECT all
    else if (sql.includes('ORDER BY created_at DESC')) {
      rows.push(...(Array.from(this.data.values()) as T[]));
    }
    // UPDATE
    else if (sql.includes('UPDATE profiles')) {
      const id = params?.[params.length - 1] as string;
      const record = this.data.get(id);
      if (record) {
        let paramIdx = 0;
        if (sql.includes('name = $1')) {
          record.name = params?.[paramIdx] as string;
          paramIdx += 1;
        }
        if (sql.includes('convocation_template =')) {
          record.convocation_template = params?.[paramIdx] as string;
        }
        rows.push(record as T);
      }
    }
    // DELETE
    else if (sql.includes('DELETE FROM profiles')) {
      const id = params?.[0] as string;
      this.data.delete(id);
    }

    return { rows };
  }
}

describe('PostgresProfileRepository', () => {
  let repo: PostgresProfileRepository;
  let mockDb: MockSqlExecutor;

  beforeEach(() => {
    mockDb = new MockSqlExecutor();
    repo = new PostgresProfileRepository(mockDb);
  });

  it('creates a profile and returns it with id and created_at', async () => {
    const result = await repo.create({ name: 'Test Profile', convocation_template: 'Template' });
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test Profile');
    expect(result.convocation_template).toBe('Template');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('creates with empty convocation_template if not provided', async () => {
    const result = await repo.create({ name: 'Test Profile' });
    expect(result.convocation_template).toBe('');
  });

  it('findById returns null for non-existent profile', async () => {
    const result = await repo.findById('non-existent');
    expect(result).toBeNull();
  });

  it('listAll returns all profiles', async () => {
    await repo.create({ name: 'Profile 1' });
    await repo.create({ name: 'Profile 2' });
    const result = await repo.listAll();
    expect(result).toHaveLength(2);
  });

  it('update modifies name and convocation_template independently', async () => {
    const created = await repo.create({ name: 'Original', convocation_template: 'Original Template' });
    const updated = await repo.update(created.id, { name: 'Updated' });
    expect(updated?.name).toBe('Updated');
    expect(updated?.convocation_template).toBe('Original Template');
  });

  it('delete returns false if profile not found', async () => {
    const result = await repo.delete('non-existent');
    expect(result).toBe(false);
  });

  it('delete returns true if profile exists', async () => {
    const created = await repo.create({ name: 'Profile to Delete' });
    const result = await repo.delete(created.id);
    expect(result).toBe(true);
  });

  it('findById after delete returns null', async () => {
    const created = await repo.create({ name: 'Profile' });
    await repo.delete(created.id);
    const result = await repo.findById(created.id);
    expect(result).toBeNull();
  });
});
