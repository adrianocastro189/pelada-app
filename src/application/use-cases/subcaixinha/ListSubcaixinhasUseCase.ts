import { SubcaixinhaRepository, SubcaixinhaRecord } from '@ports/repositories/SubcaixinhaRepository';

/**
 * Lists all subcaixinhas for a profile.
 */
export class ListSubcaixinhasUseCase {
  constructor(private readonly repo: SubcaixinhaRepository) {}

  async execute(profileId: string): Promise<SubcaixinhaRecord[]> {
    return this.repo.listByProfileId(profileId);
  }
}
