import { describe, expect, it } from 'vitest'
import { SystemClock } from './SystemClock'

describe('SystemClock', () => {
  it('today returns a Date with the current calendar date', () => {
    const clock = new SystemClock()
    const now = new Date()
    const today = clock.today()
    expect(today.getFullYear()).toBe(now.getFullYear())
    expect(today.getMonth()).toBe(now.getMonth())
    expect(today.getDate()).toBe(now.getDate())
  })

  it('today returns a Date with the time component zeroed to midnight', () => {
    const today = new SystemClock().today()
    expect(today.getHours()).toBe(0)
    expect(today.getMinutes()).toBe(0)
    expect(today.getSeconds()).toBe(0)
    expect(today.getMilliseconds()).toBe(0)
  })
})
