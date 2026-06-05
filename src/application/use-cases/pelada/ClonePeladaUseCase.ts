import { PeladaRepository, PeladaRecord } from '@ports/repositories/PeladaRepository';

/**
 * Clones a pelada with a new date.
 */
export class ClonePeladaUseCase {
  constructor(private readonly repo: PeladaRepository) {}

  async execute(id: string, newDate: Date): Promise<PeladaRecord> {
    return this.repo.clone(id, newDate);
  }
}
