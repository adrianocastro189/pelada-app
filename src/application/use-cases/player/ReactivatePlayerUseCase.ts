import { PlayerRepository } from '@ports/repositories/PlayerRepository';

/**
 * Reactivates an inactive player.
 */
export class ReactivatePlayerUseCase {
  constructor(private readonly repo: PlayerRepository) {}

  async execute(id: string): Promise<void> {
    const reactivated = await this.repo.reactivate(id);
    if (!reactivated) {
      throw new Error('Player not found');
    }
  }
}
