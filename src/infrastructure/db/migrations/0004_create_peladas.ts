import type { Migration } from '../MigrationRunner'

export const migration: Migration = {
  id: '0004_create_peladas',
  up: `
    CREATE TABLE peladas (
      id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      date              DATE        NOT NULL,
      time              TIME,
      location          TEXT,
      players_per_team  SMALLINT    NOT NULL CHECK (players_per_team > 0),
      max_goalkeepers   SMALLINT    NOT NULL DEFAULT 1
                                    CHECK (max_goalkeepers >= 0),
      cost_per_player   BIGINT      NOT NULL DEFAULT 0 CHECK (cost_per_player >= 0),
      goalkeeper_pays   BOOLEAN     NOT NULL DEFAULT true,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_peladas_profile_id ON peladas(profile_id);
    CREATE INDEX idx_peladas_date       ON peladas(profile_id, date DESC);
  `,
}
