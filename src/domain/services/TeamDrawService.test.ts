import { describe, expect, it } from 'vitest'
import { SeededRandomSource } from '@infrastructure/random/SeededRandomSource'
import { TotalStarsStrategy } from './BalancingStrategy'
import { TeamDrawService } from './TeamDrawService'
import type { DrawPlayer } from './TeamDrawService'

const strategy = new TotalStarsStrategy()

function makeLine(id: string, stars: number): DrawPlayer {
  return { id, stars, position: 'midfield', speed: 'medium', slotType: 'line' }
}

function makeGoalkeeper(id: string, stars: number): DrawPlayer {
  return { id, stars, position: 'goalkeeper', speed: 'medium', slotType: 'goalkeeper' }
}

function makePos(id: string, stars: number, position: DrawPlayer['position']): DrawPlayer {
  return { id, stars, position, speed: 'medium', slotType: 'line' }
}

describe('TeamDrawService', () => {
  const service = new TeamDrawService()

  it('distributes 14 players across 3 teams as 5/5/4', () => {
    const players = Array.from({ length: 14 }, (_, i) => makeLine(`p${i}`, 3.0))
    const result = service.draw(players, { teamCount: 3 }, new SeededRandomSource(42), strategy)
    const sizes = result.map(t => t.playerIds.length).sort((a, b) => b - a)
    expect(sizes).toEqual([5, 5, 4])
  })

  it('distributes 13 players across 3 teams as 5/4/4', () => {
    const players = Array.from({ length: 13 }, (_, i) => makeLine(`p${i}`, 3.0))
    const result = service.draw(players, { teamCount: 3 }, new SeededRandomSource(42), strategy)
    const sizes = result.map(t => t.playerIds.length).sort((a, b) => b - a)
    expect(sizes).toEqual([5, 4, 4])
  })

  it('includes all players exactly once', () => {
    const players = Array.from({ length: 10 }, (_, i) => makeLine(`p${i}`, i % 5 + 1))
    const result = service.draw(players, { teamCount: 3 }, new SeededRandomSource(1), strategy)
    const allIds = result.flatMap(t => t.playerIds)
    expect(new Set(allIds).size).toBe(10)
    expect(allIds).toHaveLength(10)
  })

  it('assigns one goalkeeper per team when count equals teamCount', () => {
    const goalkeepers = [makeGoalkeeper('gk0', 3.0), makeGoalkeeper('gk1', 3.0)]
    const linePlayers = Array.from({ length: 8 }, (_, i) => makeLine(`p${i}`, 3.0))
    const result = service.draw([...goalkeepers, ...linePlayers], { teamCount: 2 }, new SeededRandomSource(7), strategy)
    const gkIds = new Set(goalkeepers.map(g => g.id))
    result.forEach(team => {
      const gkCount = team.playerIds.filter(id => gkIds.has(id)).length
      expect(gkCount).toBe(1)
    })
  })

  it('excludes goalkeepers from the draw when count does not match teamCount', () => {
    const gk = makeGoalkeeper('gk0', 5.0)
    const linePlayers = Array.from({ length: 4 }, (_, i) => makeLine(`p${i}`, 3.0))
    const result = service.draw([gk, ...linePlayers], { teamCount: 3 }, new SeededRandomSource(1), strategy)
    const allIds = result.flatMap(t => t.playerIds)
    // Goalkeeper is left out entirely (manual decision on the field).
    expect(allIds).not.toContain('gk0')
    expect(allIds).toHaveLength(4)
  })

  it('balances teams by total stars when possible', () => {
    const players = [
      makeLine('a', 5.0),
      makeLine('b', 5.0),
      makeLine('c', 1.0),
      makeLine('d', 1.0),
    ]
    const result = service.draw(players, { teamCount: 2 }, new SeededRandomSource(42), strategy)
    const scores = result.map(t =>
      strategy.score(t.playerIds.map(id => players.find(p => p.id === id)?.stars ?? 0))
    )
    expect(scores[0]).toBeCloseTo(scores[1], 5)
  })

  it('spreads positions across teams when stars are tied (criterion #2)', () => {
    // 2 defenders + 2 attackers, all equal stars: each team should end up with
    // one of each position rather than doubling up.
    const players = [
      makePos('d1', 3.0, 'defense'),
      makePos('d2', 3.0, 'defense'),
      makePos('a1', 3.0, 'attack'),
      makePos('a2', 3.0, 'attack'),
    ]
    const result = service.draw(players, { teamCount: 2 }, new SeededRandomSource(3), strategy)
    const posOf = (id: string) => players.find(p => p.id === id)?.position
    result.forEach(team => {
      const defenders = team.playerIds.filter(id => posOf(id) === 'defense').length
      const attackers = team.playerIds.filter(id => posOf(id) === 'attack').length
      expect(defenders).toBe(1)
      expect(attackers).toBe(1)
    })
  })

  it('is deterministic for the same seed', () => {
    const players = Array.from({ length: 10 }, (_, i) => makeLine(`p${i}`, (i % 5) + 1))
    const r1 = service.draw(players, { teamCount: 2 }, new SeededRandomSource(42), strategy)
    const r2 = service.draw(players, { teamCount: 2 }, new SeededRandomSource(42), strategy)
    expect(r1).toEqual(r2)
  })

  it('produces different draws for different seeds', () => {
    const players = Array.from({ length: 10 }, (_, i) => makeLine(`p${i}`, 3.0))
    const r1 = service.draw(players, { teamCount: 2 }, new SeededRandomSource(1), strategy)
    const r2 = service.draw(players, { teamCount: 2 }, new SeededRandomSource(99999), strategy)
    const ids1 = r1[0].playerIds.join(',')
    const ids2 = r2[0].playerIds.join(',')
    expect(ids1).not.toBe(ids2)
  })

  it('handles an empty player list', () => {
    const result = service.draw([], { teamCount: 2 }, new SeededRandomSource(1), strategy)
    expect(result).toHaveLength(2)
    result.forEach(t => expect(t.playerIds).toHaveLength(0))
  })

  it('returns one team assignment per team with the correct teamIndex values', () => {
    const players = Array.from({ length: 6 }, (_, i) => makeLine(`p${i}`, 3.0))
    const result = service.draw(players, { teamCount: 3 }, new SeededRandomSource(1), strategy)
    expect(result.map(t => t.teamIndex)).toEqual([0, 1, 2])
  })

  it('does not mutate the input player array', () => {
    const players = [makeLine('p0', 3.0), makeLine('p1', 4.0)]
    const snapshot = JSON.stringify(players)
    service.draw(players, { teamCount: 2 }, new SeededRandomSource(1), strategy)
    expect(JSON.stringify(players)).toBe(snapshot)
  })
})
