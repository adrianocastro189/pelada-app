/** Immutable monetary value stored as integer cents. Never use float for money (ADR-4). */
export class Money {
  private readonly _cents: number

  private constructor(cents: number) {
    if (!Number.isInteger(cents)) {
      throw new Error(`Money requires an integer number of cents; received ${cents}`)
    }
    this._cents = cents
  }

  /** Creates a Money from an integer cent amount. */
  static fromCents(cents: number): Money {
    return new Money(cents)
  }

  /** Returns a new Money equal to the sum of this and other. */
  add(other: Money): Money {
    return new Money(this._cents + other._cents)
  }

  /** Returns true if this and other represent the same cent amount. */
  equals(other: Money): boolean {
    return this._cents === other._cents
  }

  /** Returns true if this is strictly greater than other. */
  greaterThan(other: Money): boolean {
    return this._cents > other._cents
  }

  /** Returns true if the cent amount is negative. */
  isNegative(): boolean {
    return this._cents < 0
  }

  /** Returns true if the cent amount is strictly positive. */
  isPositive(): boolean {
    return this._cents > 0
  }

  /** Returns true if the cent amount is zero. */
  isZero(): boolean {
    return this._cents === 0
  }

  /** Returns true if this is strictly less than other. */
  lessThan(other: Money): boolean {
    return this._cents < other._cents
  }

  /**
   * Returns a new Money multiplied by factor, rounded to the nearest cent.
   * Useful for percentage allocations (e.g. 0.10 for 10%).
   */
  multiply(factor: number): Money {
    return new Money(Math.round(this._cents * factor))
  }

  /** Returns a new Money equal to this minus other. */
  subtract(other: Money): Money {
    return new Money(this._cents - other._cents)
  }

  /** Returns the raw integer cent value. */
  toCents(): number {
    return this._cents
  }
}
