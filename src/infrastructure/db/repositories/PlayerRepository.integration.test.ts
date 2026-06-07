import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { v4 as uuid } from 'uuid';
import { PostgresPlayerRepository } from './PostgresPlayerRepository';
import { PgSqlExecutor } from '../PgSqlExecutor';
import { MigrationRunner } from '../MigrationRunner';
import { ALL_MIGRATIONS } from '../migrations';

const DATABASE_URL =
  process.env['DATABASE_URL'] ?? 'postgresql://pelada:pelada_test@localhost:5432/pelada_test';

async function resetSchema(executor: PgSqlExecutor): Promise<void> {
  await executor.query('DROP SCHEMA public CASCADE');
  await executor.query('CREATE SCHEMA public');
}

describe('PostgresPlayerRepository (Integration)', () => {
  let repo: PostgresPlayerRepository;
  let executor: PgSqlExecutor;
  let profileId: string;

  beforeAll(async () => {
    executor = new PgSqlExecutor(DATABASE_URL);
  });

  beforeEach(async () => {
    await resetSchema(executor);
    await new MigrationRunner(executor).migrate(ALL_MIGRATIONS);
    repo = new PostgresPlayerRepository(executor);

    // Create test profile
    profileId = uuid();
    await executor.query(
      'INSERT INTO profiles (id, name, convocation_template, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [profileId, 'Test Profile', 'template']
    );
  });

  afterAll(async () => {
    await executor.dispose();
  });

  it('creates a player with all fields', async () => {
    const result = await repo.create(profileId, {
      name: 'João',
      nickname: 'Jão',
      phone: '11999999999',
      stars: 3.5,
      position: 'midfield',
      speed: 'fast',
      invited_by_id: null,
    });

    expect(result.id).toBeDefined();
    expect(result.profile_id).toBe(profileId);
    expect(result.name).toBe('João');
    expect(result.nickname).toBe('Jão');
    expect(result.stars).toBe(3.5);
    expect(result.status).toBe('active');
  });

  it('creates with nullable fields missing', async () => {
    const result = await repo.create(profileId, {
      name: 'João',
      stars: 3,
      position: 'goalkeeper',
      speed: 'medium',
    });

    expect(result.nickname).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.invited_by_id).toBeNull();
  });

  it('findById returns null for non-existent player', async () => {
    const result = await repo.findById(uuid());
    expect(result).toBeNull();
  });

  it('listActiveByProfileId excludes inactive', async () => {
    const active = await repo.create(profileId, {
      name: 'Active',
      stars: 3,
      position: 'midfield',
      speed: 'medium',
    });

    const inactive = await repo.create(profileId, {
      name: 'Inactive',
      stars: 2,
      position: 'goalkeeper',
      speed: 'slow',
    });

    await repo.inactivate(inactive.id);

    const active_list = await repo.listActiveByProfileId(profileId);
    expect(active_list).toHaveLength(1);
    expect(active_list[0].id).toBe(active.id);
  });

  it('listAllByProfileId returns both active and inactive', async () => {
    const active = await repo.create(profileId, {
      name: 'Active',
      stars: 3,
      position: 'midfield',
      speed: 'medium',
    });

    const inactive = await repo.create(profileId, {
      name: 'Inactive',
      stars: 2,
      position: 'goalkeeper',
      speed: 'slow',
    });

    await repo.inactivate(inactive.id);

    const all = await repo.listAllByProfileId(profileId);
    expect(all).toHaveLength(2);
    expect(all.map((p) => p.id)).toContain(active.id);
    expect(all.map((p) => p.id)).toContain(inactive.id);
  });

  it('inactivate sets status to inactive', async () => {
    const player = await repo.create(profileId, {
      name: 'Test',
      stars: 3,
      position: 'midfield',
      speed: 'medium',
    });

    const result = await repo.inactivate(player.id);
    expect(result).toBe(true);

    const updated = await repo.findById(player.id);
    expect(updated?.status).toBe('inactive');
  });

  it('inactivate returns false for non-existent player', async () => {
    const result = await repo.inactivate(uuid());
    expect(result).toBe(false);
  });

  it('reactivate sets status to active', async () => {
    const player = await repo.create(profileId, {
      name: 'Test',
      stars: 3,
      position: 'midfield',
      speed: 'medium',
    });

    await repo.inactivate(player.id);
    const result = await repo.reactivate(player.id);
    expect(result).toBe(true);

    const updated = await repo.findById(player.id);
    expect(updated?.status).toBe('active');
  });

  it('update modifies fields independently', async () => {
    const player = await repo.create(profileId, {
      name: 'Original',
      stars: 2,
      position: 'midfield',
      speed: 'medium',
    });

    const updated = await repo.update(player.id, { stars: 4.5 });
    expect(updated?.stars).toBe(4.5);
    expect(updated?.name).toBe('Original');
  });

  it('searchByNameInProfile is case-insensitive and returns active only', async () => {
    const active = await repo.create(profileId, {
      name: 'João Silva',
      stars: 3,
      position: 'midfield',
      speed: 'medium',
    });

    const inactive = await repo.create(profileId, {
      name: 'João Santos',
      stars: 2,
      position: 'goalkeeper',
      speed: 'slow',
    });

    await repo.inactivate(inactive.id);

    const result = await repo.searchByNameInProfile(profileId, 'joão');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(active.id);
  });
});
