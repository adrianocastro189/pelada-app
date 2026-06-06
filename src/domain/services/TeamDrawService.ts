import type { RandomSource } from '@ports/RandomSource'
import type { BalancingStrategy } from './BalancingStrategy'

/** A player participating in the draw. */
export interface DrawPlayer {
  id: string
  stars: number
  position: 'goalkeeper' | 'defense' | 'midfield' | 'attack'
  speed: 'slow' | 'medium' | 'fast'
  slotType: 'goalkeeper' | 'line'
}

/** Configuration for a draw (number of teams to create). */
export interface DrawConfig {
  teamCount: number
}

/** Assignment of players to a single team. */
export interface TeamAssignment {
  /** Zero-based index — maps to pelada_teams.sort_order. */
  teamIndex: number
  /** IDs of all players assigned to this team (line + goalkeeper when applicable). */
  playerIds: string[]
}

/**
 * Pure domain service for drawing football teams.
 * No state, no I/O — all dependencies are injected.
 */
export class TeamDrawService {
  /**
   * Draws balanced teams from the supplied players.
   *
   * Algorithm:
   *  1. Goalkeepers are drawn separately (one per team) only when their count equals
   *     the number of teams; otherwise they are excluded from the draw entirely (they
   *     never appear in the result — manual decision on the field).
   *  2. Line players are shuffled (random), then stable-sorted by stars DESC so that
   *     players within the same star tier remain in random relative order.
   *  3. Players are assigned to teams with a greedy "lowest score first" rule driven
   *     by the injected BalancingStrategy, respecting per-team capacity limits so that
   *     team sizes differ by at most one (e.g. 14 players / 3 teams → 5 / 5 / 4).
   *     Ties on star score are broken by positional balance (spreading
   *     defense/midfield/attack evenly), then by team size.
   *  4. Shuffled goalkeepers are appended to teams in order.
   *
   * @param players  Full roster for the draw.
   * @param config   Draw settings (teamCount).
   * @param random   Injected random source (use SeededRandomSource for tests).
   * @param strategy Balance metric used when choosing which team receives each player.
   */
  draw(
    players: DrawPlayer[],
    config: DrawConfig,
    random: RandomSource,
    strategy: BalancingStrategy,
  ): TeamAssignment[] {
    const { teamCount } = config
    if (teamCount < 1) throw new Error('teamCount must be at least 1')

    const goalkeepers = players.filter(p => p.slotType === 'goalkeeper')
    const linePlayers = players.filter(p => p.slotType === 'line')

    // Goalkeepers are drawn (one per team) only when their count equals the number
    // of teams. Otherwise they are left out of the draw entirely (manual decision on
    // the field) — never mixed into the line draft.
    const drawGoaliesSeparately = goalkeepers.length === teamCount
    const draft = linePlayers

    // Shuffle introduces per-tier randomness; stable-sort then orders by stars DESC.
    const sorted = this.sortByBalance(random.shuffle(draft))

    // Per-team capacities: first (total % teamCount) teams get one extra slot.
    const total = sorted.length
    const base = Math.floor(total / teamCount)
    const extra = total % teamCount
    const capacities = Array.from({ length: teamCount }, (_, i) => base + (i < extra ? 1 : 0))

    const teams = Array.from({ length: teamCount }, (_, i): TeamSlot => ({
      teamIndex: i,
      playerIds: [],
      stars: [],
      positionCounts: {},
      capacity: capacities[i],
    }))

    // Greedy assignment: each player goes to the available team with the lowest score.
    for (const player of sorted) {
      const available = teams.filter(t => t.playerIds.length < t.capacity)
      if (available.length === 0) continue

      // Primary: lowest star score.
      const minScore = Math.min(...available.map(t => strategy.score(t.stars)))
      let tied = available.filter(t => strategy.score(t.stars) === minScore)

      // Tiebreak 1 (spec criterion #2): spread positions — prefer the team with the
      // fewest players already holding this player's position.
      const minPos = Math.min(...tied.map(t => t.positionCounts[player.position] ?? 0))
      tied = tied.filter(t => (t.positionCounts[player.position] ?? 0) === minPos)

      // Tiebreak 2: fewest players overall; if still tied, take the first (stable
      // relative to the pre-shuffle order, so still random).
      const minSize = Math.min(...tied.map(t => t.playerIds.length))
      const chosen = tied.find(t => t.playerIds.length === minSize) ?? tied[0]
      chosen.playerIds.push(player.id)
      chosen.stars.push(player.stars)
      chosen.positionCounts[player.position] = (chosen.positionCounts[player.position] ?? 0) + 1
    }

    // Append goalkeepers (shuffled) one per team when drawn separately.
    if (drawGoaliesSeparately) {
      random.shuffle(goalkeepers).forEach((gk, i) => {
        teams[i].playerIds.push(gk.id)
      })
    }

    return teams.map(({ teamIndex, playerIds }) => ({ teamIndex, playerIds }))
  }

  /** Stable-sorts players by stars DESC, then speed DESC for deterministic ordering. */
  private sortByBalance(players: DrawPlayer[]): DrawPlayer[] {
    const speedRank: Record<string, number> = { fast: 2, medium: 1, slow: 0 }
    return [...players].sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars
      return speedRank[b.speed] - speedRank[a.speed]
    })
  }
}

/** Internal helper that extends TeamAssignment with mutable tracking fields. */
interface TeamSlot {
  teamIndex: number
  playerIds: string[]
  stars: number[]
  /** Count of assigned players per position, for positional balancing. */
  positionCounts: Record<string, number>
  capacity: number
}
