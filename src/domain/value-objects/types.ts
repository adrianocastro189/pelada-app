/**
 * Player position on the field. The `goalkeeper` value also defines the
 * goalkeeper behaviour (roster slot + separate draw handling); the remaining
 * values are line positions used for positional balancing in the draw.
 */
export type Position = 'goalkeeper' | 'defense' | 'midfield' | 'attack'

/** Player speed category. */
export type Speed = 'slow' | 'medium' | 'fast'

/** Player slot type within a pelada roster. */
export type SlotType = 'goalkeeper' | 'line'

/** Derives the roster slot a player defaults to, based on their position. */
export function positionToSlotType(position: Position): SlotType {
  return position === 'goalkeeper' ? 'goalkeeper' : 'line'
}

/** Player lifecycle status (soft delete via status column). */
export type PlayerStatus = 'active' | 'inactive'

/** Financial record direction. */
export type FinancialRecordType = 'credit' | 'debit'
