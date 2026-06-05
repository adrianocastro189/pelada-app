import { PlayerRepository, CreatePlayerInput, PlayerRecord } from '@ports/repositories/PlayerRepository';

/**
 * Creates a new player.
 */
export class CreatePlayerUseCase {
  constructor(private readonly repo: PlayerRepository) {}

  async execute(profileId: string, input: CreatePlayerInput): Promise<PlayerRecord> {
    if (input.stars < 0 || input.stars > 5) {
      throw new Error('Stars must be between 0 and 5');
    }

    return this.repo.create(profileId, input);
  }
}
