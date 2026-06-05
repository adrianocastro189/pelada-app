import { PeladaRepository } from '@ports/repositories/PeladaRepository';
import { PeladaTeamRepository } from '@ports/repositories/PeladaTeamRepository';
import { PeladaPlayerRepository } from '@ports/repositories/PeladaPlayerRepository';
import { PlayerRepository } from '@ports/repositories/PlayerRepository';
import { DrawAssignmentRepository } from '@ports/repositories/DrawAssignmentRepository';
import { RandomSource } from '@ports/RandomSource';
import { BalancingStrategy } from '@domain/services/BalancingStrategy';
import { TeamDrawService, DrawPlayer } from '@domain/services/TeamDrawService';

/**
 * Performs the team draw for a pelada.
 */
export class DrawTeamsUseCase {
  constructor(
    private readonly peladaRepo: PeladaRepository,
    private readonly teamRepo: PeladaTeamRepository,
    private readonly rosterRepo: PeladaPlayerRepository,
    private readonly playerRepo: PlayerRepository,
    private readonly drawRepo: DrawAssignmentRepository,
    private readonly drawService: TeamDrawService,
    private readonly random: RandomSource,
    private readonly strategy: BalancingStrategy
  ) {}

  async execute(peladaId: string): Promise<void> {
    // Verify pelada exists
    const pelada = await this.peladaRepo.findById(peladaId);
    if (!pelada) {
      throw new Error('Pelada not found');
    }

    // Get teams
    const teams = await this.teamRepo.listByPeladaId(peladaId);
    if (teams.length === 0) {
      throw new Error('No teams defined for this pelada');
    }

    // Get roster
    const roster = await this.rosterRepo.listByPeladaId(peladaId);
    if (roster.length === 0) {
      throw new Error('Roster is empty');
    }

    // Get player details
    const drawPlayers: DrawPlayer[] = [];
    for (const rosterEntry of roster) {
      const player = await this.playerRepo.findById(rosterEntry.player_id);
      if (player) {
        drawPlayers.push({
          id: player.id,
          stars: player.stars,
          position: player.position,
          speed: player.speed,
          slotType: rosterEntry.slot_type,
        });
      }
    }

    // Perform draw
    const drawConfig = { teamCount: teams.length };
    const assignments = this.drawService.draw(drawPlayers, drawConfig, this.random, this.strategy);

    // Persist assignments
    const drawAssignments = assignments.flatMap((a) =>
      a.playerIds.map((playerId) => ({
        peladaTeamId: teams[a.teamIndex].id,
        playerId,
      }))
    );

    await this.drawRepo.replaceDrawForPelada(peladaId, drawAssignments);
  }
}
