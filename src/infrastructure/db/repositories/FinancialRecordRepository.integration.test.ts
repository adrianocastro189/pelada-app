import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { v4 as uuid } from 'uuid';
import { PostgresFinancialRecordRepository } from './PostgresFinancialRecordRepository';
import { PgSqlExecutor } from '../PgSqlExecutor';
import { MigrationRunner } from '../MigrationRunner';
import { ALL_MIGRATIONS } from '../migrations';

const DATABASE_URL =
  process.env['DATABASE_URL'] ?? 'postgresql://pelada:pelada_test@localhost:5432/pelada_test';

async function resetSchema(executor: PgSqlExecutor): Promise<void> {
  await executor.query('DROP SCHEMA public CASCADE');
  await executor.query('CREATE SCHEMA public');
}

describe('PostgresFinancialRecordRepository (Integration)', () => {
  let repo: PostgresFinancialRecordRepository;
  let executor: PgSqlExecutor;
  let profileId: string;

  beforeAll(async () => {
    executor = new PgSqlExecutor(DATABASE_URL);
  });

  beforeEach(async () => {
    await resetSchema(executor);
    await new MigrationRunner(executor).migrate(ALL_MIGRATIONS);
    repo = new PostgresFinancialRecordRepository(executor);

    // Create test profile
    profileId = uuid();
    const profileResult = await executor.query(
      'INSERT INTO profiles (id, name, convocation_template, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [profileId, 'Test Profile', 'template']
    );
  });

  afterAll(async () => {
    await executor.dispose();
  });

  it('creates a credit record', async () => {
    const date = new Date(2026, 5, 15); // June 15 (month 0-indexed)
    const result = await repo.create(profileId, {
      date,
      description: 'Payment received',
      value: 10000,
      type: 'credit',
    });

    expect(result.id).toBeDefined();
    expect(result.profile_id).toBe(profileId);
    // Compare dates at midnight UTC to avoid timezone issues
    expect(new Date(result.date).toISOString().split('T')[0]).toBe('2026-06-15');
    expect(result.description).toBe('Payment received');
    expect(Number(result.value)).toBe(10000); // integer cents
    expect(result.type).toBe('credit');
  });

  it('creates a debit record', async () => {
    const date = new Date('2026-06-15');
    const result = await repo.create(profileId, {
      date,
      description: 'Expense paid',
      value: 5000,
      type: 'debit',
    });

    expect(result.type).toBe('debit');
    expect(Number(result.value)).toBe(5000);
  });

  it('findById returns record if exists', async () => {
    const created = await repo.create(profileId, {
      date: new Date('2026-06-15'),
      description: 'Test record',
      value: 1000,
      type: 'credit',
    });

    const result = await repo.findById(created.id);
    expect(result?.id).toBe(created.id);
    expect(result?.description).toBe('Test record');
  });

  it('findById returns null if not exists', async () => {
    const result = await repo.findById(uuid());
    expect(result).toBeNull();
  });

  it('listByProfileId returns all records for profile', async () => {
    const record1 = await repo.create(profileId, {
      date: new Date('2026-06-15'),
      description: 'Record 1',
      value: 1000,
      type: 'credit',
    });

    const record2 = await repo.create(profileId, {
      date: new Date('2026-06-20'),
      description: 'Record 2',
      value: 2000,
      type: 'debit',
    });

    const result = await repo.listByProfileId(profileId);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toContain(record1.id);
    expect(result.map((r) => r.id)).toContain(record2.id);
  });

  it('listByProfileIdAndDateRange filters by date range', async () => {
    const record1 = await repo.create(profileId, {
      date: new Date(2026, 0, 15), // January
      description: 'January record',
      value: 1000,
      type: 'credit',
    });

    const record2 = await repo.create(profileId, {
      date: new Date(2026, 4, 15), // May
      description: 'May record',
      value: 2000,
      type: 'credit',
    });

    const record3 = await repo.create(profileId, {
      date: new Date(2026, 5, 15), // June
      description: 'June record',
      value: 3000,
      type: 'credit',
    });

    // Query May 1 to June 30
    const startDate = new Date(2026, 4, 1); // May 1
    const endDate = new Date(2026, 5, 30); // June 30

    const result = await repo.listByProfileIdAndDateRange(profileId, startDate, endDate);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toContain(record2.id);
    expect(result.map((r) => r.id)).toContain(record3.id);
    expect(result.map((r) => r.id)).not.toContain(record1.id);
  });

  it('update modifies fields independently', async () => {
    const record = await repo.create(profileId, {
      date: new Date('2026-06-15'),
      description: 'Original description',
      value: 1000,
      type: 'credit',
    });

    const updated = await repo.update(record.id, {
      value: 5000,
      description: 'Updated description',
    });

    expect(Number(updated?.value)).toBe(5000);
    expect(updated?.description).toBe('Updated description');
    expect(updated?.type).toBe('credit'); // unchanged
  });

  it('update returns null if not exists', async () => {
    const result = await repo.update(uuid(), {
      description: 'New description',
    });
    expect(result).toBeNull();
  });

  it('delete removes record', async () => {
    const record = await repo.create(profileId, {
      date: new Date('2026-06-15'),
      description: 'Test',
      value: 1000,
      type: 'credit',
    });

    const result = await repo.delete(record.id);
    expect(result).toBe(true);

    const found = await repo.findById(record.id);
    expect(found).toBeNull();
  });

  it('delete returns false if not exists', async () => {
    const result = await repo.delete(uuid());
    expect(result).toBe(false);
  });
});
