import { describe, expect, it } from 'vitest'
import { Stars } from './Stars'

describe('Stars', () => {
  it('creates from a valid decimal value', () => {
    expect(Stars.fromValue(3.5).toNumber()).toBe(3.5)
  })

  it('creates from boundary values 0 and 5', () => {
    expect(Stars.fromValue(0).toNumber()).toBe(0)
    expect(Stars.fromValue(5).toNumber()).toBe(5)
  })

  it('throws for values below 0', () => {
    expect(() => Stars.fromValue(-0.1)).toThrow()
  })

  it('throws for values above 5', () => {
    expect(() => Stars.fromValue(5.1)).toThrow()
  })

  it('rounds to one decimal place', () => {
    expect(Stars.fromValue(3.14).toNumber()).toBe(3.1)
    expect(Stars.fromValue(3.15).toNumber()).toBe(3.2)
  })

  it('equals is true for the same value', () => {
    expect(Stars.fromValue(3.0).equals(Stars.fromValue(3.0))).toBe(true)
  })

  it('equals is false for different values', () => {
    expect(Stars.fromValue(3.0).equals(Stars.fromValue(4.0))).toBe(false)
  })

  it('greaterThan and lessThan work correctly', () => {
    expect(Stars.fromValue(4.0).greaterThan(Stars.fromValue(3.0))).toBe(true)
    expect(Stars.fromValue(3.0).lessThan(Stars.fromValue(4.0))).toBe(true)
  })
})
