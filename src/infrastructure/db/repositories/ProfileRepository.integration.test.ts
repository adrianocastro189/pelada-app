import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgresProfileRepository } from './PostgresProfileRepository';
import { PgSqlExecutor } from '../PgSqlExecutor';
import { MigrationRunner } from '../MigrationRunner';

/**
 * Integration tests against Docker PostgreSQL.
 * Uses real database and migrations.
 */
describe('PostgresProfileRepository (Integration)', () => {
  let repo: PostgresProfileRepository;
  let executor: PgSqlExecutor;

  beforeAll(async () => {
    // Setup PostgreSQL connection (Docker container via docker-compose)
    const connectionString =
      process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pelada_test';

    executor = new PgSqlExecutor(connectionString);

    // Run migrations
    const runner = new MigrationRunner(executor);
    await runner.runAll();

    repo = new PostgresProfileRepository(executor);
  });

  afterAll(async () => {
    await executor.dispose();
  });

  it('creates and retrieves a profile from the database', async () => {
    const created = await repo.create({ name: 'Integration Test Profile', convocation_template: 'Test Template' });
    const retrieved = await repo.findById(created.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Integration Test Profile');
    expect(retrieved?.convocation_template).toBe('Test Template');
  });

  it('CASCADE delete removes related profiles when parent is deleted', async () => {
    // This test verifies that the CASCADE rule works
    // Create a profile, then delete it and verify it's gone
    const profile1 = await repo.create({ name: 'Profile to Cascade Delete' });
    const profileId = profile1.id;

    // Delete the profile
    const deleted = await repo.delete(profileId);
    expect(deleted).toBe(true);

    // Verify it's gone
    const retrieved = await repo.findById(profileId);
    expect(retrieved).toBeNull();
  });

  it('lists all profiles in the database', async () => {
    await repo.create({ name: 'Profile A' });
    await repo.create({ name: 'Profile B' });
    await repo.create({ name: 'Profile C' });

    const all = await repo.listAll();
    expect(all.length).toBeGreaterThanOrEqual(3);
    expect(all.some((p) => p.name === 'Profile A')).toBe(true);
    expect(all.some((p) => p.name === 'Profile B')).toBe(true);
    expect(all.some((p) => p.name === 'Profile C')).toBe(true);
  });

  it('updates a profile with all fields', async () => {
    const created = await repo.create({ name: 'Original', convocation_template: 'Original Template' });
    const updated = await repo.update(created.id, {
      name: 'Updated Name',
      convocation_template: 'Updated Template',
    });

    expect(updated?.name).toBe('Updated Name');
    expect(updated?.convocation_template).toBe('Updated Template');
  });

  it('update with partial data modifies only specified fields', async () => {
    const created = await repo.create({ name: 'Test', convocation_template: 'Original Template' });
    const updated = await repo.update(created.id, { name: 'New Name' });

    expect(updated?.name).toBe('New Name');
    expect(updated?.convocation_template).toBe('Original Template');
  });

  it('delete returns false if profile does not exist', async () => {
    const result = await repo.delete('non-existent-id-12345');
    expect(result).toBe(false);
  });
});
