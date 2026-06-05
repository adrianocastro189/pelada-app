import { PeladaRepository, UpdatePeladaInput, PeladaRecord } from '@ports/repositories/PeladaRepository';

/**
 * Updates a pelada.
 */
export class UpdatePeladaUseCase {
  constructor(private readonly repo: PeladaRepository) {}

  async execute(id: string, data: UpdatePeladaInput): Promise<PeladaRecord> {
    if (data.players_per_team !== undefined && data.players_per_team < 1) {
      throw new Error('players_per_team must be at least 1');
    }
    if (data.max_goalkeepers !== undefined && data.max_goalkeepers < 0) {
      throw new Error('max_goalkeepers must be at least 0');
    }
    if (data.cost_per_player !== undefined && data.cost_per_player < 0) {
      throw new Error('cost_per_player must be at least 0');
    }

    const pelada = await this.repo.update(id, data);
    if (!pelada) {
      throw new Error('Pelada not found');
    }

    return pelada;
  }
}
