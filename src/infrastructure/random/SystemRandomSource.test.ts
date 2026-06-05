import { describe, expect, it } from 'vitest'
import { SystemRandomSource } from './SystemRandomSource'

describe('SystemRandomSource', () => {
  const rng = new SystemRandomSource()

  it('nextInt returns an integer in [0, maxExclusive)', () => {
    for (let i = 0; i < 200; i++) {
      const v = rng.nextInt(10)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(10)
    }
  })

  it('shuffle returns a new array with the same elements', () => {
    const original = [1, 2, 3, 4, 5]
    const shuffled = rng.shuffle(original)
    expect(shuffled).toHaveLength(original.length)
    expect([...shuffled].sort((a, b) => a - b)).toEqual([...original].sort((a, b) => a - b))
  })

  it('shuffle does not mutate the input array', () => {
    const original = [1, 2, 3]
    const snapshot = [...original]
    rng.shuffle(original)
    expect(original).toEqual(snapshot)
  })

  it('shuffle handles an empty array', () => {
    expect(rng.shuffle([])).toEqual([])
  })

  it('shuffle handles a single element', () => {
    expect(rng.shuffle([42])).toEqual([42])
  })
})
