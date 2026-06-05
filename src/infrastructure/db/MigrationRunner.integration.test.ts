import { PgSqlExecutor } from './PgSqlExecutor'
import { MigrationRunner } from './MigrationRunner'
import { ALL_MIGRATIONS } from './migrations'

const DATABASE_URL =
  process.env['DATABASE_URL'] ?? 'postgresql://pelada:pelada_test@localhost:5432/pelada_test'

/** Reset the public schema to a clean state before each test. */
async function resetSchema(executor: PgSqlExecutor): Promise<void> {
  await executor.query('DROP SCHEMA public CASCADE')
  await executor.query('CREATE SCHEMA public')
}

describe('MigrationRunner (integration)', () => {
  let executor: PgSqlExecutor

  beforeEach(async () => {
    executor = new PgSqlExecutor(DATABASE_URL)
    await resetSchema(executor)
  })

  afterEach(async () => {
    await executor.dispose()
  })

  it('applies all migrations and creates the expected tables', async () => {
    const runner = new MigrationRunner(executor)
    await runner.migrate(ALL_MIGRATIONS)

    const result = await executor.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
    )
    const tables = result.rows.map(r => r.tablename).sort()

    expect(tables).toEqual(
      expect.arrayContaining([
        'draw_assignments',
        'financial_records',
        'pelada_players',
        'pelada_teams',
        'peladas',
        'players',
        'profiles',
        'schema_migrations',
        'subcaixinhas',
      ]),
    )
  })

  it('creates all expected custom enum types', async () => {
    const runner = new MigrationRunner(executor)
    await runner.migrate(ALL_MIGRATIONS)

    const result = await executor.query<{ typname: string }>(
      "SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname",
    )
    const types = result.rows.map(r => r.typname).sort()

    expect(types).toEqual(
      expect.arrayContaining([
        'financial_record_type',
        'player_position',
        'player_speed',
        'player_status',
        'slot_type',
      ]),
    )
  })

  it('records exactly one entry per migration in schema_migrations', async () => {
    const runner = new MigrationRunner(executor)
    await runner.migrate(ALL_MIGRATIONS)

    const result = await executor.query<{ id: string }>(
      'SELECT id FROM schema_migrations ORDER BY id',
    )
    expect(result.rows).toHaveLength(ALL_MIGRATIONS.length)
    expect(result.rows.map(r => r.id)).toEqual(ALL_MIGRATIONS.map(m => m.id))
  })

  it('is idempotent — running twice applies each migration exactly once', async () => {
    const runner = new MigrationRunner(executor)
    await runner.migrate(ALL_MIGRATIONS)
    // Second run must not throw or duplicate entries
    await runner.migrate(ALL_MIGRATIONS)

    const result = await executor.query<{ id: string }>(
      'SELECT id FROM schema_migrations ORDER BY id',
    )
    expect(result.rows).toHaveLength(ALL_MIGRATIONS.length)
  })

  it('deleting a pelada cascades to teams, players and draw assignments but not financial_records', async () => {
    const runner = new MigrationRunner(executor)
    await runner.migrate(ALL_MIGRATIONS)

    // Insert a profile
    const profileResult = await executor.query<{ id: string }>(
      "INSERT INTO profiles (name) VALUES ('Test Profile') RETURNING id",
    )
    const profileId = profileResult.rows[0].id

    // Insert a player
    const playerResult = await executor.query<{ id: string }>(
      "INSERT INTO players (profile_id, name) VALUES ($1, 'Player One') RETURNING id",
      [profileId],
    )
    const playerId = playerResult.rows[0].id

    // Insert a pelada
    const peladaResult = await executor.query<{ id: string }>(
      `INSERT INTO peladas (profile_id, date, players_per_team)
       VALUES ($1, CURRENT_DATE, 5) RETURNING id`,
      [profileId],
    )
    const peladaId = peladaResult.rows[0].id

    // Insert a team
    const teamResult = await executor.query<{ id: string }>(
      "INSERT INTO pelada_teams (pelada_id, name) VALUES ($1, 'Time A') RETURNING id",
      [peladaId],
    )
    const teamId = teamResult.rows[0].id

    // Insert a pelada_player and draw_assignment
    await executor.query(
      "INSERT INTO pelada_players (pelada_id, player_id, slot_type) VALUES ($1, $2, 'line')",
      [peladaId, playerId],
    )
    await executor.query(
      'INSERT INTO draw_assignments (pelada_id, pelada_team_id, player_id) VALUES ($1, $2, $3)',
      [peladaId, teamId, playerId],
    )

    // Insert a financial_record (must survive the pelada delete)
    await executor.query(
      `INSERT INTO financial_records (profile_id, date, description, value, type)
       VALUES ($1, CURRENT_DATE, 'Entry', 1000, 'credit')`,
      [profileId],
    )

    // Delete the pelada — cascade must kick in
    await executor.query('DELETE FROM peladas WHERE id = $1', [peladaId])

    // pelada_teams, pelada_players, draw_assignments must be gone
    const teams = await executor.query('SELECT id FROM pelada_teams WHERE pelada_id = $1', [peladaId])
    expect(teams.rows).toHaveLength(0)

    const peladaPlayers = await executor.query('SELECT id FROM pelada_players WHERE pelada_id = $1', [peladaId])
    expect(peladaPlayers.rows).toHaveLength(0)

    const draws = await executor.query('SELECT id FROM draw_assignments WHERE pelada_id = $1', [peladaId])
    expect(draws.rows).toHaveLength(0)

    // financial_records must be intact (ADR-6: completely independent of peladas)
    const financials = await executor.query(
      'SELECT id FROM financial_records WHERE profile_id = $1',
      [profileId],
    )
    expect(financials.rows).toHaveLength(1)

    // players must be intact (soft-delete only)
    const players = await executor.query('SELECT id FROM players WHERE id = $1', [playerId])
    expect(players.rows).toHaveLength(1)
  })
})
