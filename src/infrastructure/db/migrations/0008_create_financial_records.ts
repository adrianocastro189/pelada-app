import type { Migration } from '../MigrationRunner'

export const migration: Migration = {
  id: '0008_create_financial_records',
  up: `
    CREATE TABLE financial_records (
      id          UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id  UUID                  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      date        DATE                  NOT NULL,
      description TEXT                  NOT NULL,
      value       BIGINT                NOT NULL CHECK (value > 0),
      type        financial_record_type NOT NULL,
      created_at  TIMESTAMPTZ           NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_financial_records_profile_id ON financial_records(profile_id);
    CREATE INDEX idx_financial_records_date       ON financial_records(profile_id, date DESC);
  `,
}
