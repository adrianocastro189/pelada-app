import { PeladaRepository, CreatePeladaInput, PeladaRecord } from '@ports/repositories/PeladaRepository';

/**
 * Creates a new pelada.
 */
export class CreatePeladaUseCase {
  constructor(private readonly repo: PeladaRepository) {}

  async execute(profileId: string, input: CreatePeladaInput): Promise<PeladaRecord> {
    if (input.players_per_team < 1) {
      throw new Error('players_per_team must be at least 1');
    }
    if (input.max_goalkeepers < 0) {
      throw new Error('max_goalkeepers must be at least 0');
    }
    if (input.cost_per_player < 0) {
      throw new Error('cost_per_player must be at least 0');
    }

    return this.repo.create(profileId, input);
  }
}
