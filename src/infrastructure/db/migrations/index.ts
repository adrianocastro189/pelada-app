import { migration as m0001 } from './0001_create_enums'
import { migration as m0002 } from './0002_create_profiles'
import { migration as m0003 } from './0003_create_players'
import { migration as m0004 } from './0004_create_peladas'
import { migration as m0005 } from './0005_create_pelada_teams'
import { migration as m0006 } from './0006_create_pelada_players'
import { migration as m0007 } from './0007_create_draw_assignments'
import { migration as m0008 } from './0008_create_financial_records'
import { migration as m0009 } from './0009_create_subcaixinhas'
import { migration as m0010 } from './0010_player_position_field'
import type { Migration } from '../MigrationRunner'

/**
 * All schema migrations in chronological order.
 * Add new migrations at the end; never reorder or modify existing entries.
 */
export const ALL_MIGRATIONS: readonly Migration[] = [
  m0001,
  m0002,
  m0003,
  m0004,
  m0005,
  m0006,
  m0007,
  m0008,
  m0009,
  m0010,
]
