import { PlayerRepository } from '@ports/repositories/PlayerRepository';

/**
 * Deactivates (soft-deletes) a player.
 */
export class DeactivatePlayerUseCase {
  constructor(private readonly repo: PlayerRepository) {}

  async execute(id: string): Promise<void> {
    const inactivated = await this.repo.inactivate(id);
    if (!inactivated) {
      throw new Error('Player not found');
    }
  }
}
