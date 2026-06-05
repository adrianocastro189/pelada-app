import type { Migration } from '../MigrationRunner'

export const migration: Migration = {
  id: '0003_create_players',
  up: `
    CREATE TABLE players (
      id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id    UUID              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name          TEXT              NOT NULL,
      nickname      TEXT,
      phone         TEXT,
      stars         NUMERIC(2, 1)     NOT NULL DEFAULT 3.0
                                      CHECK (stars >= 0.0 AND stars <= 5.0),
      position      player_position   NOT NULL DEFAULT 'line',
      speed         player_speed      NOT NULL DEFAULT 'medium',
      default_type  slot_type         NOT NULL DEFAULT 'line',
      invited_by_id UUID              REFERENCES players(id) ON DELETE SET NULL,
      status        player_status     NOT NULL DEFAULT 'active',
      created_at    TIMESTAMPTZ       NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_players_profile_id ON players(profile_id);
    CREATE INDEX idx_players_status     ON players(profile_id, status);
  `,
}
