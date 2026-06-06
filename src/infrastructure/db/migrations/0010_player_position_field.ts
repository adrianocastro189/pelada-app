import type { Migration } from '../MigrationRunner'

/**
 * Replaces the binary `position` (goalkeeper/line) plus the redundant
 * `default_type` (goalkeeper/line) with a single 4-value position field:
 * goalkeeper | defense | midfield | attack.
 *
 * The goalkeeper value drives goalkeeper behaviour (roster slot + draw),
 * while defense/midfield/attack feed positional balancing in the draw.
 * Existing line players are migrated to 'midfield' (a neutral default);
 * goalkeepers keep their value. The `default_type` column is dropped, since
 * the roster slot is now derived from the position (goalkeeper → goalkeeper
 * slot, otherwise → line slot).
 */
export const migration: Migration = {
  id: '0010_player_position_field',
  up: `
    ALTER TABLE players ALTER COLUMN position DROP DEFAULT;

    ALTER TYPE player_position RENAME TO player_position_old;
    CREATE TYPE player_position AS ENUM ('goalkeeper', 'defense', 'midfield', 'attack');

    ALTER TABLE players
      ALTER COLUMN position TYPE player_position
      USING (
        CASE WHEN position::text = 'goalkeeper' THEN 'goalkeeper' ELSE 'midfield' END
      )::player_position;

    ALTER TABLE players ALTER COLUMN position SET DEFAULT 'midfield';

    DROP TYPE player_position_old;

    ALTER TABLE players DROP COLUMN default_type;
  `,
}
