import type { Clock } from '@ports/Clock'

/** Production clock that returns the current wall-clock date with time zeroed to midnight. */
export class SystemClock implements Clock {
  /** Returns today's date with hours, minutes, seconds, and milliseconds set to zero. */
  today(): Date {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }
}
