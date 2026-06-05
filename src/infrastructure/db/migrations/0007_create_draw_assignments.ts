import type { Migration } from '../MigrationRunner'

export const migration: Migration = {
  id: '0007_create_draw_assignments',
  up: `
    CREATE TABLE draw_assignments (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      pelada_id       UUID        NOT NULL REFERENCES peladas(id)       ON DELETE CASCADE,
      pelada_team_id  UUID        NOT NULL REFERENCES pelada_teams(id)  ON DELETE CASCADE,
      player_id       UUID        NOT NULL REFERENCES players(id)       ON DELETE CASCADE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

      UNIQUE (pelada_id, player_id)
    );

    CREATE INDEX idx_draw_assignments_pelada_id ON draw_assignments(pelada_id);
  `,
}
