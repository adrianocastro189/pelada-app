import { describe, expect, it } from 'vitest'
import { SubcaixinhaBalancer } from './SubcaixinhaBalancer'

describe('SubcaixinhaBalancer', () => {
  const balancer = new SubcaixinhaBalancer()

  // calculateDelta
  describe('calculateDelta', () => {
    it('returns a positive delta when cashbox exceeds subcaixinha total', () => {
      expect(balancer.calculateDelta(10000, 6000)).toBe(4000)
    })

    it('returns a negative delta when subcaixinha total exceeds cashbox', () => {
      expect(balancer.calculateDelta(5000, 8000)).toBe(-3000)
    })

    it('returns 0 when perfectly balanced', () => {
      expect(balancer.calculateDelta(5000, 5000)).toBe(0)
    })

    it('returns the full cashbox when subcaixinha total is 0', () => {
      expect(balancer.calculateDelta(7500, 0)).toBe(7500)
    })
  })

  // isDeltaZero
  describe('isDeltaZero', () => {
    it('returns true for delta exactly 0', () => {
      expect(balancer.isDeltaZero(0)).toBe(true)
    })

    it('returns false for a positive delta', () => {
      expect(balancer.isDeltaZero(1)).toBe(false)
    })

    it('returns false for a negative delta', () => {
      expect(balancer.isDeltaZero(-1)).toBe(false)
    })
  })

  // allocationOptions
  describe('allocationOptions', () => {
    it('returns 5 options for a positive delta: [10, 25, 50, 75, 100]%', () => {
      const opts = balancer.allocationOptions(1000)
      expect(opts).toEqual([100, 250, 500, 750, 1000])
    })

    it('returns an empty array for delta = 0', () => {
      expect(balancer.allocationOptions(0)).toEqual([])
    })

    it('returns an empty array for a negative delta', () => {
      expect(balancer.allocationOptions(-500)).toEqual([])
    })

    it('rounds to the nearest cent', () => {
      const opts = balancer.allocationOptions(333)
      expect(opts[0]).toBe(33)  // 10% of 333 = 33.3 → 33
      expect(opts[1]).toBe(83)  // 25% of 333 = 83.25 → 83
    })

    it('always returns 100% of delta as the last option', () => {
      const delta = 1234
      const opts = balancer.allocationOptions(delta)
      expect(opts[opts.length - 1]).toBe(delta)
    })
  })

  // calculateSubcaixinhaTotal helper coverage
  describe('calculateSubcaixinhaTotal', () => {
    it('sums current values of all subcaixinhas', () => {
      expect(balancer.calculateSubcaixinhaTotal([1000, 2000, 500])).toBe(3500)
    })

    it('returns 0 for an empty list', () => {
      expect(balancer.calculateSubcaixinhaTotal([])).toBe(0)
    })
  })
})
