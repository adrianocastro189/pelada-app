/** A single financial record passed to the calculator. Value is always positive integer cents. */
export interface FinancialEntry {
  date: Date
  value: number
  type: 'credit' | 'debit'
}

/** Pure domain service for computing cash-box balances (ADR-4: all values in integer cents). */
export class BalanceCalculator {
  /**
   * Returns the general balance: sum of all credits minus sum of all debits (in cents).
   * Returns 0 for an empty list.
   */
  calculateGeneralBalance(records: FinancialEntry[]): number {
    return records.reduce((sum, r) => sum + (r.type === 'credit' ? r.value : -r.value), 0)
  }

  /**
   * Returns the balance for a specific year and month (0-indexed JS month convention).
   * Filters records by date and delegates to calculateGeneralBalance.
   *
   * @param records Full list of financial records.
   * @param year    Four-digit year (e.g. 2026).
   * @param month   Zero-indexed month (0 = January, 11 = December).
   */
  calculateMonthBalance(records: FinancialEntry[], year: number, month: number): number {
    const filtered = records.filter(
      r => r.date.getFullYear() === year && r.date.getMonth() === month,
    )
    return this.calculateGeneralBalance(filtered)
  }

  /**
   * Returns the balance of all records NOT present in windowRecords.
   * Used for the cash-box communication message to show the balance prior to
   * the current display window (e.g. last 3 weeks).
   *
   * @param allRecords    Complete list of records.
   * @param windowRecords The subset to exclude (identified by reference equality).
   */
  calculatePreviousBalance(allRecords: FinancialEntry[], windowRecords: FinancialEntry[]): number {
    const windowSet = new Set(windowRecords)
    return this.calculateGeneralBalance(allRecords.filter(r => !windowSet.has(r)))
  }
}
