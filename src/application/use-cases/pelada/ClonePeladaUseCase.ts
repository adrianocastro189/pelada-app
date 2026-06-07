import { PeladaRepository, PeladaRecord } from '@ports/repositories/PeladaRepository';
import { PeladaTeamRepository } from '@ports/repositories/PeladaTeamRepository';

/**
 * Clones a pelada with a new date, copying its team names (clonable per spec).
 */
export class ClonePeladaUseCase {
  constructor(
    private readonly repo: PeladaRepository,
    private readonly teamRepo: PeladaTeamRepository,
  ) {}

  async execute(id: string, newDate: Date): Promise<PeladaRecord> {
    const teams = await this.teamRepo.listByPeladaId(id);
    const cloned = await this.repo.clone(id, newDate);
    await Promise.all(
      teams.map((t) => this.teamRepo.create(cloned.id, t.name, t.sort_order)),
    );
    return cloned;
  }
}
