/** Player position on the field. */
export type Position = 'goalkeeper' | 'line'

/** Player speed category. */
export type Speed = 'slow' | 'medium' | 'fast'

/** Player slot type within a pelada roster. */
export type SlotType = 'goalkeeper' | 'line'

/** Player lifecycle status (soft delete via status column). */
export type PlayerStatus = 'active' | 'inactive'

/** Financial record direction. */
export type FinancialRecordType = 'credit' | 'debit'
