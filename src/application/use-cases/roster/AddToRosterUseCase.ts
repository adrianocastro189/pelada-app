import { PeladaRepository } from '@ports/repositories/PeladaRepository';
import { PeladaPlayerRepository, PeladaPlayerRecord } from '@ports/repositories/PeladaPlayerRepository';

/**
 * Adds a player to a pelada's roster.
 */
export class AddToRosterUseCase {
  constructor(
    private readonly peladaRepo: PeladaRepository,
    private readonly rosterRepo: PeladaPlayerRepository
  ) {}

  async execute(
    peladaId: string,
    playerId: string,
    slotType: 'goalkeeper' | 'line'
  ): Promise<PeladaPlayerRecord> {
    // Verify pelada exists
    const pelada = await this.peladaRepo.findById(peladaId);
    if (!pelada) {
      throw new Error('Pelada not found');
    }

    // Check if player already in roster
    const existing = await this.rosterRepo.findByPeladaAndPlayer(peladaId, playerId);
    if (existing) {
      throw new Error('Player already in roster');
    }

    // Check capacity
    const roster = await this.rosterRepo.listByPeladaId(peladaId);

    if (slotType === 'line') {
      const lineCount = roster.filter((e) => e.slot_type === 'line').length;
      if (lineCount >= pelada.players_per_team) {
        throw new Error('Line slots are full');
      }
    } else {
      const gkCount = roster.filter((e) => e.slot_type === 'goalkeeper').length;
      if (gkCount >= pelada.max_goalkeepers) {
        throw new Error('Goalkeeper slots are full');
      }
    }

    return this.rosterRepo.addToRoster(peladaId, playerId, slotType);
  }
}
