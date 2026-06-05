/** Injected randomness port. Keeps Math.random() out of the domain. */
export interface RandomSource {
  /** Returns an integer in [0, maxExclusive). */
  nextInt(maxExclusive: number): number
  /** Returns a new shuffled copy (Fisher-Yates) without mutating input. */
  shuffle<T>(items: readonly T[]): T[]
}
