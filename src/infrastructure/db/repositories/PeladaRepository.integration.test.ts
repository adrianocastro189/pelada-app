import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { v4 as uuid } from 'uuid';
import { PostgresPeladaRepository } from './PostgresPeladaRepository';
import { PgSqlExecutor } from '../PgSqlExecutor';
import { MigrationRunner } from '../MigrationRunner';
import { ALL_MIGRATIONS } from '../migrations';

const DATABASE_URL =
  process.env['DATABASE_URL'] ?? 'postgresql://pelada:pelada_test@localhost:5432/pelada_test';

async function resetSchema(executor: PgSqlExecutor): Promise<void> {
  await executor.query('DROP SCHEMA public CASCADE');
  await executor.query('CREATE SCHEMA public');
}

describe('PostgresPeladaRepository (Integration)', () => {
  let repo: PostgresPeladaRepository;
  let executor: PgSqlExecutor;
  let profileId: string;

  beforeAll(async () => {
    executor = new PgSqlExecutor(DATABASE_URL);
  });

  beforeEach(async () => {
    await resetSchema(executor);
    await new MigrationRunner(executor).migrate(ALL_MIGRATIONS);
    repo = new PostgresPeladaRepository(executor);

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

  it('creates a pelada with all fields', async () => {
    const date = new Date(2026, 5, 15); // June 15 (month 0-indexed)
    const result = await repo.create(profileId, {
      date,
      time: '19:00',
      location: 'Campo do Bom',
      players_per_team: 11,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: true,
    });

    expect(result.id).toBeDefined();
    expect(result.profile_id).toBe(profileId);
    // Compare date strings to avoid timezone issues
    expect(new Date(result.date).toISOString().split('T')[0]).toBe('2026-06-15');
    // Time might return with seconds: '19:00:00' so compare prefix
    expect(result.time?.substring(0, 5)).toBe('19:00');
    expect(result.location).toBe('Campo do Bom');
    expect(result.players_per_team).toBe(11);
    expect(result.max_goalkeepers).toBe(1);
    expect(Number(result.cost_per_player)).toBe(5000); // integer cents
    expect(result.goalkeeper_pays).toBe(true);
  });

  it('findById returns null for non-existent pelada', async () => {
    const result = await repo.findById(uuid());
    expect(result).toBeNull();
  });

  it('listByProfileId returns list ordered by date DESC', async () => {
    const date1 = new Date('2026-06-10');
    const date2 = new Date('2026-06-20');

    const p1 = await repo.create(profileId, {
      date: date1,
      players_per_team: 11,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    const p2 = await repo.create(profileId, {
      date: date2,
      players_per_team: 7,
      max_goalkeepers: 1,
      cost_per_player: 2500,
      goalkeeper_pays: true,
    });

    const result = await repo.listByProfileId(profileId);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(p2.id); // date2 should come first (DESC)
    expect(result[1].id).toBe(p1.id);
  });

  it('update modifies fields independently', async () => {
    const date1 = new Date(2026, 5, 15); // June 15
    const date2 = new Date(2026, 5, 20); // June 20

    const pelada = await repo.create(profileId, {
      date: date1,
      time: '19:00',
      location: 'Campo A',
      players_per_team: 11,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    const updated = await repo.update(pelada.id, {
      date: date2,
      players_per_team: 7,
    });

    // Compare date strings to avoid timezone issues
    expect(new Date(updated!.date).toISOString().split('T')[0]).toBe('2026-06-20');
    expect(updated?.players_per_team).toBe(7);
    expect(updated?.time?.substring(0, 5)).toBe('19:00'); // unchanged, may include seconds
    expect(updated?.location).toBe('Campo A'); // unchanged
  });

  it('delete removes pelada', async () => {
    const pelada = await repo.create(profileId, {
      date: new Date('2026-06-15'),
      players_per_team: 11,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    const result = await repo.delete(pelada.id);
    expect(result).toBe(true);

    const found = await repo.findById(pelada.id);
    expect(found).toBeNull();
  });

  it('delete returns false for non-existent pelada', async () => {
    const result = await repo.delete(uuid());
    expect(result).toBe(false);
  });

  it('clone creates independent copy with new date', async () => {
    const original = await repo.create(profileId, {
      date: new Date('2026-06-15'),
      time: '19:00',
      location: 'Campo do Bom',
      players_per_team: 11,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: true,
    });

    const newDate = new Date('2026-06-22');
    const cloned = await repo.clone(original.id, newDate);

    expect(cloned.id).not.toBe(original.id);
    // Compare date strings to avoid timezone issues
    expect(new Date(cloned.date).toISOString().split('T')[0]).toBe('2026-06-22');
    expect(cloned.time?.substring(0, 5)).toBe(original.time?.substring(0, 5));
    expect(cloned.location).toBe(original.location);
    expect(cloned.players_per_team).toBe(original.players_per_team);
  });
});
