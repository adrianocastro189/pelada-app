import { PlayerRepository, PlayerRecord } from '@ports/repositories/PlayerRepository';

/**
 * Searches for players by name in a profile (active only).
 */
export class SearchPlayersUseCase {
  constructor(private readonly repo: PlayerRepository) {}

  async execute(profileId: string, query: string): Promise<PlayerRecord[]> {
    return this.repo.searchByNameInProfile(profileId, query);
  }
}
