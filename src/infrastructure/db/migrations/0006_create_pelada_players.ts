import type { Migration } from '../MigrationRunner'

export const migration: Migration = {
  id: '0006_create_pelada_players',
  up: `
    CREATE TABLE pelada_players (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      pelada_id   UUID        NOT NULL REFERENCES peladas(id)  ON DELETE CASCADE,
      player_id   UUID        NOT NULL REFERENCES players(id)  ON DELETE CASCADE,
      slot_type   slot_type   NOT NULL,
      paid        BOOLEAN     NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

      UNIQUE (pelada_id, player_id)
    );

    CREATE INDEX idx_pelada_players_pelada_id ON pelada_players(pelada_id);
    CREATE INDEX idx_pelada_players_player_id ON pelada_players(player_id);
  `,
}
