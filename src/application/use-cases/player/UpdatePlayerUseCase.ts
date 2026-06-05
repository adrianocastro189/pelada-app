import { PlayerRepository, UpdatePlayerInput, PlayerRecord } from '@ports/repositories/PlayerRepository';

/**
 * Updates a player.
 */
export class UpdatePlayerUseCase {
  constructor(private readonly repo: PlayerRepository) {}

  async execute(id: string, data: UpdatePlayerInput): Promise<PlayerRecord> {
    if (data.stars !== undefined && (data.stars < 0 || data.stars > 5)) {
      throw new Error('Stars must be between 0 and 5');
    }

    const player = await this.repo.update(id, data);
    if (!player) {
      throw new Error('Player not found');
    }

    return player;
  }
}
