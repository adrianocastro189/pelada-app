import { PlayerRepository, PlayerRecord } from '@ports/repositories/PlayerRepository';

/**
 * Retrieves a player by id.
 */
export class GetPlayerUseCase {
  constructor(private readonly repo: PlayerRepository) {}

  async execute(id: string): Promise<PlayerRecord> {
    const player = await this.repo.findById(id);
    if (!player) {
      throw new Error('Player not found');
    }
    return player;
  }
}
