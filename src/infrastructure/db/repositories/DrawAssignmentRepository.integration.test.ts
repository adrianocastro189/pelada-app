import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { v4 as uuid } from 'uuid';
import { PostgresDrawAssignmentRepository } from './PostgresDrawAssignmentRepository';
import { PgSqlExecutor } from '../PgSqlExecutor';
import { MigrationRunner } from '../MigrationRunner';
import { ALL_MIGRATIONS } from '../migrations';

const DATABASE_URL =
  process.env['DATABASE_URL'] ?? 'postgresql://pelada:pelada_test@localhost:5432/pelada_test';

async function resetSchema(executor: PgSqlExecutor): Promise<void> {
  await executor.query('DROP SCHEMA public CASCADE');
  await executor.query('CREATE SCHEMA public');
}

describe('PostgresDrawAssignmentRepository (Integration)', () => {
  let repo: PostgresDrawAssignmentRepository;
  let executor: PgSqlExecutor;
  let profileId: string;
  let peladaId: string;
  let teamId1: string;
  let teamId2: string;
  let playerId1: string;
  let playerId2: string;

  beforeAll(async () => {
    executor = new PgSqlExecutor(DATABASE_URL);
  });

  beforeEach(async () => {
    await resetSchema(executor);
    await new MigrationRunner(executor).migrate(ALL_MIGRATIONS);
    repo = new PostgresDrawAssignmentRepository(executor);

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

    // Create test teams
    teamId1 = uuid();
    const team1Result = await executor.query(
      'INSERT INTO pelada_teams (id, pelada_id, name, sort_order, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [teamId1, peladaId, 'Team A', 1]
    );

    teamId2 = uuid();
    const team2Result = await executor.query(
      'INSERT INTO pelada_teams (id, pelada_id, name, sort_order, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [teamId2, peladaId, 'Team B', 2]
    );

    // Create test players
    playerId1 = uuid();
    const player1Result = await executor.query(
      'INSERT INTO players (id, profile_id, name, stars, position, speed, default_type, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id',
      [playerId1, profileId, 'João', 3, 'line', 'medium', 'line', 'active']
    );

    playerId2 = uuid();
    const player2Result = await executor.query(
      'INSERT INTO players (id, profile_id, name, stars, position, speed, default_type, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id',
      [playerId2, profileId, 'Pedro', 2, 'goalkeeper', 'slow', 'goalkeeper', 'active']
    );
  });

  afterAll(async () => {
    await executor.dispose();
  });

  it('assign creates draw assignment', async () => {
    const result = await repo.assign(peladaId, teamId1, playerId1);

    expect(result.id).toBeDefined();
    expect(result.pelada_id).toBe(peladaId);
    expect(result.pelada_team_id).toBe(teamId1);
    expect(result.player_id).toBe(playerId1);
  });

  it('listByPeladaId returns all assignments for pelada', async () => {
    const a1 = await repo.assign(peladaId, teamId1, playerId1);
    const a2 = await repo.assign(peladaId, teamId2, playerId2);

    const result = await repo.listByPeladaId(peladaId);
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.id)).toContain(a1.id);
    expect(result.map((a) => a.id)).toContain(a2.id);
  });

  it('findPlayerTeamInPelada returns assignment for player', async () => {
    const assignment = await repo.assign(peladaId, teamId1, playerId1);

    const result = await repo.findPlayerTeamInPelada(peladaId, playerId1);
    expect(result?.id).toBe(assignment.id);
    expect(result?.pelada_team_id).toBe(teamId1);
  });

  it('findPlayerTeamInPelada returns null if player not assigned', async () => {
    const result = await repo.findPlayerTeamInPelada(peladaId, uuid());
    expect(result).toBeNull();
  });

  it('clearByPeladaId deletes all assignments for pelada', async () => {
    await repo.assign(peladaId, teamId1, playerId1);
    await repo.assign(peladaId, teamId2, playerId2);

    const result = await repo.clearByPeladaId(peladaId);
    expect(result).toBe(2);

    const assignments = await repo.listByPeladaId(peladaId);
    expect(assignments).toHaveLength(0);
  });

  it('clearByPeladaId returns 0 if no assignments', async () => {
    const result = await repo.clearByPeladaId(peladaId);
    expect(result).toBe(0);
  });

  it('replaceDrawForPelada clears old and inserts new', async () => {
    // First draw: assign both players to team 1
    await repo.assign(peladaId, teamId1, playerId1);
    await repo.assign(peladaId, teamId1, playerId2);

    let assignments = await repo.listByPeladaId(peladaId);
    expect(assignments).toHaveLength(2);

    // Replace with new draw: player1 in team1, player2 in team2
    await repo.replaceDrawForPelada(peladaId, [
      { peladaTeamId: teamId1, playerId: playerId1 },
      { peladaTeamId: teamId2, playerId: playerId2 },
    ]);

    assignments = await repo.listByPeladaId(peladaId);
    expect(assignments).toHaveLength(2);

    const a1 = await repo.findPlayerTeamInPelada(peladaId, playerId1);
    const a2 = await repo.findPlayerTeamInPelada(peladaId, playerId2);

    expect(a1?.pelada_team_id).toBe(teamId1);
    expect(a2?.pelada_team_id).toBe(teamId2);
  });

  it('replaceDrawForPelada with empty array clears all', async () => {
    await repo.assign(peladaId, teamId1, playerId1);
    await repo.assign(peladaId, teamId2, playerId2);

    await repo.replaceDrawForPelada(peladaId, []);

    const assignments = await repo.listByPeladaId(peladaId);
    expect(assignments).toHaveLength(0);
  });
});
