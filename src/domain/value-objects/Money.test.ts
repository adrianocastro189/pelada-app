import { describe, expect, it } from 'vitest'
import { Money } from './Money'

describe('Money', () => {
  it('creates from integer cents', () => {
    expect(Money.fromCents(1050).toCents()).toBe(1050)
  })

  it('throws when created from a non-integer', () => {
    expect(() => Money.fromCents(10.5)).toThrow()
  })

  it('allows zero cents', () => {
    expect(Money.fromCents(0).isZero()).toBe(true)
  })

  it('allows negative cents', () => {
    expect(Money.fromCents(-100).isNegative()).toBe(true)
  })

  it('add returns new instance with summed cents', () => {
    expect(Money.fromCents(100).add(Money.fromCents(200)).toCents()).toBe(300)
  })

  it('subtract returns new instance with difference', () => {
    expect(Money.fromCents(300).subtract(Money.fromCents(100)).toCents()).toBe(200)
  })

  it('subtract can produce a negative result', () => {
    expect(Money.fromCents(0).subtract(Money.fromCents(50)).isNegative()).toBe(true)
  })

  it('multiply rounds to the nearest cent', () => {
    expect(Money.fromCents(1000).multiply(0.1).toCents()).toBe(100)
    expect(Money.fromCents(1000).multiply(0.25).toCents()).toBe(250)
    expect(Money.fromCents(333).multiply(0.1).toCents()).toBe(33)
  })

  it('equals is true for the same amount', () => {
    expect(Money.fromCents(100).equals(Money.fromCents(100))).toBe(true)
  })

  it('equals is false for a different amount', () => {
    expect(Money.fromCents(100).equals(Money.fromCents(200))).toBe(false)
  })

  it('greaterThan and lessThan work correctly', () => {
    expect(Money.fromCents(200).greaterThan(Money.fromCents(100))).toBe(true)
    expect(Money.fromCents(100).lessThan(Money.fromCents(200))).toBe(true)
  })

  it('isPositive is true only for positive amounts', () => {
    expect(Money.fromCents(1).isPositive()).toBe(true)
    expect(Money.fromCents(0).isPositive()).toBe(false)
    expect(Money.fromCents(-1).isPositive()).toBe(false)
  })

  it('add does not mutate the original instances', () => {
    const a = Money.fromCents(100)
    const b = Money.fromCents(200)
    a.add(b)
    expect(a.toCents()).toBe(100)
    expect(b.toCents()).toBe(200)
  })
})
