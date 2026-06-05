import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { v4 as uuid } from 'uuid';
import { PostgresPeladaTeamRepository } from './PostgresPeladaTeamRepository';
import { PgSqlExecutor } from '../PgSqlExecutor';
import { MigrationRunner } from '../MigrationRunner';
import { ALL_MIGRATIONS } from '../migrations';

const DATABASE_URL =
  process.env['DATABASE_URL'] ?? 'postgresql://pelada:pelada_test@localhost:5432/pelada_test';

async function resetSchema(executor: PgSqlExecutor): Promise<void> {
  await executor.query('DROP SCHEMA public CASCADE');
  await executor.query('CREATE SCHEMA public');
}

describe('PostgresPeladaTeamRepository (Integration)', () => {
  let repo: PostgresPeladaTeamRepository;
  let executor: PgSqlExecutor;
  let profileId: string;
  let peladaId: string;

  beforeAll(async () => {
    executor = new PgSqlExecutor(DATABASE_URL);
  });

  beforeEach(async () => {
    await resetSchema(executor);
    await new MigrationRunner(executor).migrate(ALL_MIGRATIONS);
    repo = new PostgresPeladaTeamRepository(executor);

    // Create test profile
    profileId = uuid();
    const profileResult = await executor.query(
      'INSERT INTO profiles (id, name, convocation_template, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [profileId, 'Test Profile', 'template']
    );

    // Create test pelada
    peladaId = uuid();
    const peladaResult = await executor.query(
      'INSERT INTO peladas (id, profile_id, date, players_per_team, max_goalkeepers, cost_per_player, goalkeeper_pays, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id',
      [peladaId, profileId, new Date('2026-06-15'), 11, 1, 5000, true]
    );
  });

  afterAll(async () => {
    await executor.dispose();
  });

  it('creates a team with sort_order', async () => {
    const result = await repo.create(peladaId, 'Team A', 1);

    expect(result.id).toBeDefined();
    expect(result.pelada_id).toBe(peladaId);
    expect(result.name).toBe('Team A');
    expect(result.sort_order).toBe(1);
  });

  it('findById returns null for non-existent team', async () => {
    const result = await repo.findById(uuid());
    expect(result).toBeNull();
  });

  it('listByPeladaId returns teams ordered by sort_order', async () => {
    const team1 = await repo.create(peladaId, 'Team A', 2);
    const team2 = await repo.create(peladaId, 'Team B', 1);
    const team3 = await repo.create(peladaId, 'Team C', 3);

    const result = await repo.listByPeladaId(peladaId);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(team2.id); // sort_order 1
    expect(result[1].id).toBe(team1.id); // sort_order 2
    expect(result[2].id).toBe(team3.id); // sort_order 3
  });

  it('update modifies team name', async () => {
    const team = await repo.create(peladaId, 'Original Name', 1);

    const updated = await repo.update(team.id, 'New Name');
    expect(updated?.name).toBe('New Name');
    expect(updated?.pelada_id).toBe(peladaId); // unchanged
  });

  it('update returns null for non-existent team', async () => {
    const result = await repo.update(uuid(), 'New Name');
    expect(result).toBeNull();
  });

  it('delete removes team', async () => {
    const team = await repo.create(peladaId, 'Team A', 1);

    const result = await repo.delete(team.id);
    expect(result).toBe(true);

    const found = await repo.findById(team.id);
    expect(found).toBeNull();
  });

  it('delete returns false for non-existent team', async () => {
    const result = await repo.delete(uuid());
    expect(result).toBe(false);
  });

  it('deleteAllByPeladaId removes all teams for pelada', async () => {
    await repo.create(peladaId, 'Team A', 1);
    await repo.create(peladaId, 'Team B', 2);
    await repo.create(peladaId, 'Team C', 3);

    const result = await repo.deleteAllByPeladaId(peladaId);
    expect(result).toBe(3);

    const teams = await repo.listByPeladaId(peladaId);
    expect(teams).toHaveLength(0);
  });

  it('deleteAllByPeladaId returns 0 for pelada with no teams', async () => {
    const result = await repo.deleteAllByPeladaId(peladaId);
    expect(result).toBe(0);
  });
});
