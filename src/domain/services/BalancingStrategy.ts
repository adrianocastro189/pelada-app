/** Strategy for computing a balance metric for a set of players (a team). */
export interface BalancingStrategy {
  /** Computes the balance metric given the star ratings of the team's players. */
  score(playerStars: number[]): number
}

/** Balances by total star count. Suited to fixed-size teams. */
export class TotalStarsStrategy implements BalancingStrategy {
  /** Returns the sum of all player star ratings. */
  score(playerStars: number[]): number {
    return playerStars.reduce((sum, s) => sum + s, 0)
  }
}

/** Balances by average star rating. Suited to variable-size teams. */
export class AverageStarsStrategy implements BalancingStrategy {
  /** Returns the mean star rating, or 0 for an empty team. */
  score(playerStars: number[]): number {
    if (playerStars.length === 0) return 0
    return playerStars.reduce((sum, s) => sum + s, 0) / playerStars.length
  }
}
