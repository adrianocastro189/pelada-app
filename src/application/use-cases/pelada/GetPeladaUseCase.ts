import { PeladaRepository, PeladaRecord } from '@ports/repositories/PeladaRepository';

/**
 * Retrieves a pelada by id.
 */
export class GetPeladaUseCase {
  constructor(private readonly repo: PeladaRepository) {}

  async execute(id: string): Promise<PeladaRecord> {
    const pelada = await this.repo.findById(id);
    if (!pelada) {
      throw new Error('Pelada not found');
    }
    return pelada;
  }
}
