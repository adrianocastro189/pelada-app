import type { Migration } from '../MigrationRunner'

export const migration: Migration = {
  id: '0002_create_profiles',
  up: `
    CREATE TABLE profiles (
      id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      name                  TEXT        NOT NULL,
      convocation_template  TEXT        NOT NULL DEFAULT '',
      created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `,
}
