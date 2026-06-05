import type { RandomSource } from '@ports/RandomSource'

/**
 * Deterministic random source using the mulberry32 PRNG.
 * Fixed seed ensures reproducible results — useful in tests and for replaying draws.
 */
export class SeededRandomSource implements RandomSource {
  private seed: number

  constructor(seed: number) {
    this.seed = seed >>> 0
  }

  /** Returns an integer in [0, maxExclusive). */
  nextInt(maxExclusive: number): number {
    return Math.floor(this.nextFloat() * maxExclusive)
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

  /** Mulberry32 PRNG — returns a float in [0, 1). */
  private nextFloat(): number {
    this.seed = (this.seed + 0x6d2b79f5) >>> 0
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
