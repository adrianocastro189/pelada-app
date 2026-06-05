/** Star rating value object: a decimal in [0.0, 5.0] rounded to one decimal place. */
export class Stars {
  private readonly _value: number

  private constructor(value: number) {
    const rounded = Math.round(value * 10) / 10
    if (rounded < 0 || rounded > 5) {
      throw new Error(`Stars must be in [0.0, 5.0]; received ${value}`)
    }
    this._value = rounded
  }

  /** Creates a Stars from a decimal value in [0.0, 5.0]. */
  static fromValue(value: number): Stars {
    return new Stars(value)
  }

  /** Returns true if this and other have the same value. */
  equals(other: Stars): boolean {
    return this._value === other._value
  }

  /** Returns true if this is strictly greater than other. */
  greaterThan(other: Stars): boolean {
    return this._value > other._value
  }

  /** Returns true if this is strictly less than other. */
  lessThan(other: Stars): boolean {
    return this._value < other._value
  }

  /** Returns the decimal star value (one decimal place). */
  toNumber(): number {
    return this._value
  }
}
