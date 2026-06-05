import type { Clock } from '@ports/Clock'

/** Test clock that always returns a pre-configured fixed date. */
export class FixedClock implements Clock {
  private readonly _date: Date

  constructor(date: Date) {
    this._date = new Date(date)
  }

  /** Returns the fixed date provided at construction time. */
  today(): Date {
    return new Date(this._date)
  }
}
