import type { Migration } from '../MigrationRunner'

export const migration: Migration = {
  id: '0005_create_pelada_teams',
  up: `
    CREATE TABLE pelada_teams (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      pelada_id   UUID        NOT NULL REFERENCES peladas(id) ON DELETE CASCADE,
      name        TEXT        NOT NULL,
      sort_order  SMALLINT    NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_pelada_teams_pelada_id ON pelada_teams(pelada_id);
  `,
}
