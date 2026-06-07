import { describe, expect, it } from 'vitest'
import { computeTeamStats } from './TeamStats'
import type { TeamStatsPlayer } from './TeamStats'

describe('computeTeamStats', () => {
  it('aggregates total/average stars, positions and speeds', () => {
    const players: TeamStatsPlayer[] = [
      { stars: 5, position: 'goalkeeper', speed: 'slow' },
      { stars: 4, position: 'defense', speed: 'medium' },
      { stars: 3, position: 'midfield', speed: 'fast' },
      { stars: 0, position: 'attack', speed: 'fast' },
    ]

    const stats = computeTeamStats(players)

    expect(stats.count).toBe(4)
    expect(stats.totalStars).toBe(12)
    expect(stats.averageStars).toBe(3)
    expect(stats.positionCounts).toEqual({ goalkeeper: 1, defense: 1, midfield: 1, attack: 1 })
    expect(stats.speedCounts).toEqual({ slow: 1, medium: 1, fast: 2 })
  })

  it('returns zeros for an empty team without dividing by zero', () => {
    const stats = computeTeamStats([])

    expect(stats.count).toBe(0)
    expect(stats.totalStars).toBe(0)
    expect(stats.averageStars).toBe(0)
    expect(stats.positionCounts).toEqual({ goalkeeper: 0, defense: 0, midfield: 0, attack: 0 })
    expect(stats.speedCounts).toEqual({ slow: 0, medium: 0, fast: 0 })
  })
})
