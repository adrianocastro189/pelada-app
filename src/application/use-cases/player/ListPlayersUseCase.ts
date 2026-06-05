import { PlayerRepository, PlayerRecord } from '@ports/repositories/PlayerRepository';

/**
 * Lists all players in a profile (active by default, or all if includeInactive = true).
 */
export class ListPlayersUseCase {
  constructor(private readonly repo: PlayerRepository) {}

  async execute(profileId: string, includeInactive?: boolean): Promise<PlayerRecord[]> {
    if (includeInactive) {
      return this.repo.listAllByProfileId(profileId);
    }
    return this.repo.listActiveByProfileId(profileId);
  }
}
