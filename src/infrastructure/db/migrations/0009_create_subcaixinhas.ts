import type { Migration } from '../MigrationRunner'

export const migration: Migration = {
  id: '0009_create_subcaixinhas',
  up: `
    CREATE TABLE subcaixinhas (
      id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name           TEXT        NOT NULL,
      goal           BIGINT      CHECK (goal IS NULL OR goal > 0),
      current_value  BIGINT      NOT NULL DEFAULT 0,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_subcaixinhas_profile_id ON subcaixinhas(profile_id);
  `,
}
