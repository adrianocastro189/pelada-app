import { describe, expect, it } from 'vitest'
import { BalanceCalculator } from './BalanceCalculator'
import type { FinancialEntry } from './BalanceCalculator'

/** Creates a local-midnight Date to avoid UTC-vs-local month mismatches. */
function localDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function credit(value: number, date: string): FinancialEntry {
  return { value, type: 'credit', date: localDate(date) }
}

function debit(value: number, date: string): FinancialEntry {
  return { value, type: 'debit', date: localDate(date) }
}

describe('BalanceCalculator', () => {
  const calc = new BalanceCalculator()

  // calculateGeneralBalance
  describe('calculateGeneralBalance', () => {
    it('returns 0 for an empty list', () => {
      expect(calc.calculateGeneralBalance([])).toBe(0)
    })

    it('sums credits minus debits', () => {
      const records = [
        credit(1000, '2026-01-01'),
        debit(300, '2026-01-02'),
        credit(500, '2026-01-03'),
      ]
      expect(calc.calculateGeneralBalance(records)).toBe(1200)
    })

    it('returns negative when debits exceed credits', () => {
      expect(calc.calculateGeneralBalance([debit(500, '2026-01-01'), credit(100, '2026-01-02')])).toBe(-400)
    })

    it('works with credits only', () => {
      expect(calc.calculateGeneralBalance([credit(300, '2026-01-01'), credit(200, '2026-01-01')])).toBe(500)
    })

    it('works with debits only', () => {
      expect(calc.calculateGeneralBalance([debit(400, '2026-01-01')])).toBe(-400)
    })
  })

  // calculateMonthBalance
  describe('calculateMonthBalance', () => {
    const records = [
      credit(1000, '2026-06-01'),   // June 2026
      credit(500, '2026-06-15'),    // June 2026
      debit(200, '2026-06-20'),     // June 2026
      credit(800, '2026-07-01'),    // July 2026
      debit(100, '2026-05-31'),     // May 2026
    ]

    it('returns the correct balance for the requested month (0-indexed)', () => {
      // June = month 5 in JS Date
      expect(calc.calculateMonthBalance(records, 2026, 5)).toBe(1300)
    })

    it('excludes records from other months', () => {
      expect(calc.calculateMonthBalance(records, 2026, 6)).toBe(800)
    })

    it('returns 0 when no records exist for the month', () => {
      expect(calc.calculateMonthBalance(records, 2025, 0)).toBe(0)
    })
  })

  // calculatePreviousBalance
  describe('calculatePreviousBalance', () => {
    it('returns balance of records not in the window', () => {
      const old1 = credit(5000, '2026-01-01')
      const old2 = debit(1000, '2026-02-01')
      const recent1 = credit(2000, '2026-06-01')
      const recent2 = debit(500, '2026-06-15')
      const all = [old1, old2, recent1, recent2]
      const window = [recent1, recent2]
      expect(calc.calculatePreviousBalance(all, window)).toBe(4000)
    })

    it('returns 0 when all records are in the window', () => {
      const r = credit(1000, '2026-01-01')
      expect(calc.calculatePreviousBalance([r], [r])).toBe(0)
    })

    it('returns the full balance when the window is empty', () => {
      const r = credit(1000, '2026-01-01')
      expect(calc.calculatePreviousBalance([r], [])).toBe(1000)
    })

    it('equals general balance minus window balance', () => {
      const all = [credit(3000, '2026-01-01'), credit(1000, '2026-06-01'), debit(400, '2026-06-15')]
      const window = [all[1], all[2]]
      const expected = calc.calculateGeneralBalance(all) - calc.calculateGeneralBalance(window)
      expect(calc.calculatePreviousBalance(all, window)).toBe(expected)
    })
  })
})
