import type { RandomSource } from '@ports/RandomSource'

/** Production random source backed by Math.random. */
export class SystemRandomSource implements RandomSource {
  /** Returns an integer in [0, maxExclusive). */
  nextInt(maxExclusive: number): number {
    return Math.floor(Math.random() * maxExclusive)
  }

  /** Returns a new Fisher-Yates shuffled copy without mutating the input. */
  shuffle<T>(items: readonly T[]): T[] {
    const arr = [...items]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }
}
