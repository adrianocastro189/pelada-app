import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { v4 as uuid } from 'uuid';
import { PostgresPeladaPlayerRepository } from './PostgresPeladaPlayerRepository';
import { PgSqlExecutor } from '../PgSqlExecutor';
import { MigrationRunner } from '../MigrationRunner';
import { ALL_MIGRATIONS } from '../migrations';

const DATABASE_URL =
  process.env['DATABASE_URL'] ?? 'postgresql://pelada:pelada_test@localhost:5432/pelada_test';

async function resetSchema(executor: PgSqlExecutor): Promise<void> {
  await executor.query('DROP SCHEMA public CASCADE');
  await executor.query('CREATE SCHEMA public');
}

describe('PostgresPeladaPlayerRepository (Integration)', () => {
  let repo: PostgresPeladaPlayerRepository;
  let executor: PgSqlExecutor;
  let profileId: string;
  let peladaId: string;
  let playerId: string;

  beforeAll(async () => {
    executor = new PgSqlExecutor(DATABASE_URL);
  });

  beforeEach(async () => {
    await resetSchema(executor);
    await new MigrationRunner(executor).migrate(ALL_MIGRATIONS);
    repo = new PostgresPeladaPlayerRepository(executor);

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

    // Create test player
    playerId = uuid();
    const playerResult = await executor.query(
      'INSERT INTO players (id, profile_id, name, stars, position, speed, default_type, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id',
      [playerId, profileId, 'João', 3, 'line', 'medium', 'line', 'active']
    );
  });

  afterAll(async () => {
    await executor.dispose();
  });

  it('addToRoster adds player to roster', async () => {
    const result = await repo.addToRoster(peladaId, playerId, 'line');

    expect(result.id).toBeDefined();
    expect(result.pelada_id).toBe(peladaId);
    expect(result.player_id).toBe(playerId);
    expect(result.slot_type).toBe('line');
    expect(result.paid).toBe(false);
  });

  it('addToRoster enforces UNIQUE constraint on (pelada_id, player_id)', async () => {
    await repo.addToRoster(peladaId, playerId, 'line');

    // Try to add same player again - should fail
    await expect(repo.addToRoster(peladaId, playerId, 'line')).rejects.toThrow();
  });

  it('findByPeladaAndPlayer returns entry if exists', async () => {
    const added = await repo.addToRoster(peladaId, playerId, 'line');

    const result = await repo.findByPeladaAndPlayer(peladaId, playerId);
    expect(result?.id).toBe(added.id);
  });

  it('findByPeladaAndPlayer returns null if not exists', async () => {
    const result = await repo.findByPeladaAndPlayer(peladaId, uuid());
    expect(result).toBeNull();
  });

  it('listByPeladaId returns all roster entries for pelada', async () => {
    const playerId2 = uuid();
    const player2Result = await executor.query(
      'INSERT INTO players (id, profile_id, name, stars, position, speed, default_type, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id',
      [playerId2, profileId, 'Pedro', 2, 'goalkeeper', 'slow', 'goalkeeper', 'active']
    );

    const entry1 = await repo.addToRoster(peladaId, playerId, 'line');
    const entry2 = await repo.addToRoster(peladaId, playerId2, 'goalkeeper');

    const result = await repo.listByPeladaId(peladaId);
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toContain(entry1.id);
    expect(result.map((e) => e.id)).toContain(entry2.id);
  });

  it('setPaid updates paid flag', async () => {
    const entry = await repo.addToRoster(peladaId, playerId, 'line');

    const paid = await repo.setPaid(peladaId, playerId, true);
    expect(paid?.paid).toBe(true);

    const unpaid = await repo.setPaid(peladaId, playerId, false);
    expect(unpaid?.paid).toBe(false);
  });

  it('setPaid returns null if player not in roster', async () => {
    const result = await repo.setPaid(peladaId, uuid(), true);
    expect(result).toBeNull();
  });

  it('removeFromRoster deletes entry', async () => {
    await repo.addToRoster(peladaId, playerId, 'line');

    const result = await repo.removeFromRoster(peladaId, playerId);
    expect(result).toBe(true);

    const found = await repo.findByPeladaAndPlayer(peladaId, playerId);
    expect(found).toBeNull();
  });

  it('removeFromRoster returns false if player not in roster', async () => {
    const result = await repo.removeFromRoster(peladaId, uuid());
    expect(result).toBe(false);
  });
});
