import type { Migration } from '../MigrationRunner'

export const migration: Migration = {
  id: '0001_create_enums',
  up: `
    CREATE TYPE player_position AS ENUM ('goalkeeper', 'line');
    CREATE TYPE player_speed    AS ENUM ('slow', 'medium', 'fast');
    CREATE TYPE slot_type       AS ENUM ('goalkeeper', 'line');
    CREATE TYPE player_status   AS ENUM ('active', 'inactive');
    CREATE TYPE financial_record_type AS ENUM ('credit', 'debit');
  `,
}
