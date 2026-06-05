import { PeladaPlayerRepository } from '@ports/repositories/PeladaPlayerRepository';

/**
 * Removes a player from a pelada's roster.
 */
export class RemoveFromRosterUseCase {
  constructor(private readonly repo: PeladaPlayerRepository) {}

  async execute(peladaId: string, playerId: string): Promise<void> {
    const removed = await this.repo.removeFromRoster(peladaId, playerId);
    if (!removed) {
      throw new Error('Player not in roster');
    }
  }
}
