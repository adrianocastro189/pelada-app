import { PeladaRepository } from '@ports/repositories/PeladaRepository';

/**
 * Deletes a pelada (hard delete, cascades to teams, roster, draws per ADR-6).
 */
export class DeletePeladaUseCase {
  constructor(private readonly repo: PeladaRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new Error('Pelada not found');
    }
  }
}
