import { PeladaRepository, CreatePeladaInput, PeladaRecord } from '@ports/repositories/PeladaRepository';
import { PeladaTeamRepository } from '@ports/repositories/PeladaTeamRepository';

/**
 * Creates a new pelada along with its teams.
 *
 * Per the spec, the pelada is configured with the *names* of its teams
 * (one per line), and the number of teams is derived from that list. The
 * teams must be persisted at creation time so the team draw has targets to
 * assign players to.
 */
export class CreatePeladaUseCase {
  constructor(
    private readonly repo: PeladaRepository,
    private readonly teamRepo: PeladaTeamRepository,
  ) {}

  async execute(
    profileId: string,
    input: CreatePeladaInput,
    teamNames: string[],
  ): Promise<PeladaRecord> {
    if (input.players_per_team < 1) {
      throw new Error('players_per_team must be at least 1');
    }
    if (input.max_goalkeepers < 0) {
      throw new Error('max_goalkeepers must be at least 0');
    }
    if (input.cost_per_player < 0) {
      throw new Error('cost_per_player must be at least 0');
    }

    const names = teamNames.map((n) => n.trim()).filter((n) => n.length > 0);
    if (names.length < 2) {
      throw new Error('At least 2 teams are required');
    }

    const pelada = await this.repo.create(profileId, input);
    await Promise.all(names.map((name, index) => this.teamRepo.create(pelada.id, name, index)));

    return pelada;
  }
}
