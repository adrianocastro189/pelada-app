import type { Position, Speed } from '../value-objects/types'

/** Minimal player shape needed to summarize a drawn team. */
export interface TeamStatsPlayer {
  stars: number
  position: Position
  speed: Speed
}

/** Internal, admin-only stats shown per team in the draw view (never in messages). */
export interface TeamStats {
  count: number
  totalStars: number
  averageStars: number
  positionCounts: Record<Position, number>
  speedCounts: Record<Speed, number>
}

/**
 * Aggregates the admin-only stats for a single drawn team: total and average
 * stars, count of players per position, and count per speed.
 *
 * @param players Players assigned to the team.
 */
export function computeTeamStats(players: TeamStatsPlayer[]): TeamStats {
  const positionCounts: Record<Position, number> = {
    goalkeeper: 0,
    defense: 0,
    midfield: 0,
    attack: 0,
  }
  const speedCounts: Record<Speed, number> = { slow: 0, medium: 0, fast: 0 }

  let totalStars = 0
  for (const player of players) {
    totalStars += player.stars
    positionCounts[player.position]++
    speedCounts[player.speed]++
  }

  return {
    count: players.length,
    totalStars,
    averageStars: players.length > 0 ? totalStars / players.length : 0,
    positionCounts,
    speedCounts,
  }
}
