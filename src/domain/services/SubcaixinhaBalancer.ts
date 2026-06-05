/**
 * Pure domain service for subcaixinha balancing logic.
 * All monetary values are integer cents (ADR-4).
 */
export class SubcaixinhaBalancer {
  /**
   * Returns the sum of current_value across all subcaixinhas (in cents).
   *
   * @param currentValues Array of current_value (cents) for each subcaixinha.
   */
  calculateSubcaixinhaTotal(currentValues: number[]): number {
    return currentValues.reduce((sum, v) => sum + v, 0)
  }

  /**
   * Returns delta = cashBoxBalance - subcaixinhaTotal.
   * Positive delta means there is unallocated cash in the box.
   * Negative delta means subcaixinhas hold more than the cash box (over-allocated).
   *
   * @param cashBoxBalance   General balance of the cash box (cents).
   * @param subcaixinhaTotal Sum of all subcaixinha current_value fields (cents).
   */
  calculateDelta(cashBoxBalance: number, subcaixinhaTotal: number): number {
    return cashBoxBalance - subcaixinhaTotal
  }

  /**
   * Returns true when delta is exactly 0 (i.e., all cash is fully allocated).
   * Safe to use with integer cents — no floating-point drift (ADR-4).
   */
  isDeltaZero(delta: number): boolean {
    return delta === 0
  }

  /**
   * Returns the allocation amounts in cents for [10, 25, 50, 75, 100]% of delta.
   * Used to populate the allocation popup when delta is positive.
   * Returns an empty array for zero or negative delta.
   *
   * @param delta Unallocated amount in cents (must be positive to produce options).
   */
  allocationOptions(delta: number): number[] {
    if (delta <= 0) return []
    return [0.1, 0.25, 0.5, 0.75, 1.0].map(pct => Math.round(delta * pct))
  }
}
