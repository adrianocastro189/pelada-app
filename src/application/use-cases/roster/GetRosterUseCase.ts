import { PeladaPlayerRepository, PeladaPlayerRecord } from '@ports/repositories/PeladaPlayerRepository';

/**
 * Retrieves the roster for a pelada.
 */
export class GetRosterUseCase {
  constructor(private readonly repo: PeladaPlayerRepository) {}

  async execute(peladaId: string): Promise<PeladaPlayerRecord[]> {
    return this.repo.listByPeladaId(peladaId);
  }
}
