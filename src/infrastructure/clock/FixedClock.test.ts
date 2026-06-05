import { describe, expect, it } from 'vitest'
import { FixedClock } from './FixedClock'

describe('FixedClock', () => {
  it('today always returns the fixed date', () => {
    const fixed = new Date('2026-06-05T00:00:00.000Z')
    const clock = new FixedClock(fixed)
    expect(clock.today().getTime()).toBe(fixed.getTime())
  })

  it('today returns a new Date instance on each call', () => {
    const clock = new FixedClock(new Date('2026-06-05T00:00:00.000Z'))
    const a = clock.today()
    const b = clock.today()
    expect(a).not.toBe(b)
    expect(a.getTime()).toBe(b.getTime())
  })

  it('does not retain a reference to the constructor date', () => {
    const d = new Date('2026-06-05T00:00:00.000Z')
    const clock = new FixedClock(d)
    d.setFullYear(2000)
    expect(clock.today().getFullYear()).toBe(2026)
  })
})
