import { describe, expect, it } from 'vitest'
import { SeededRandomSource } from './SeededRandomSource'

describe('SeededRandomSource', () => {
  it('same seed produces identical sequences', () => {
    const a = new SeededRandomSource(42)
    const b = new SeededRandomSource(42)
    const seqA = Array.from({ length: 20 }, () => a.nextInt(100))
    const seqB = Array.from({ length: 20 }, () => b.nextInt(100))
    expect(seqA).toEqual(seqB)
  })

  it('nextInt returns an integer in [0, maxExclusive)', () => {
    const rng = new SeededRandomSource(99)
    for (let i = 0; i < 100; i++) {
      const v = rng.nextInt(7)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(7)
    }
  })

  it('shuffle does not mutate the input array', () => {
    const rng = new SeededRandomSource(1)
    const original = [1, 2, 3, 4, 5]
    const snapshot = [...original]
    rng.shuffle(original)
    expect(original).toEqual(snapshot)
  })

  it('shuffle with the same seed produces the same result', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(new SeededRandomSource(42).shuffle(arr)).toEqual(new SeededRandomSource(42).shuffle(arr))
  })

  it('different seeds produce different shuffles', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(new SeededRandomSource(1).shuffle(arr)).not.toEqual(new SeededRandomSource(999).shuffle(arr))
  })

  it('shuffle handles an empty array', () => {
    expect(new SeededRandomSource(1).shuffle([])).toEqual([])
  })
})
