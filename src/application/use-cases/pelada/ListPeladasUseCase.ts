import { PeladaRepository, PeladaRecord } from '@ports/repositories/PeladaRepository';

/**
 * Lists all peladas for a profile (ordered by date DESC).
 */
export class ListPeladasUseCase {
  constructor(private readonly repo: PeladaRepository) {}

  async execute(profileId: string): Promise<PeladaRecord[]> {
    return this.repo.listByProfileId(profileId);
  }
}
