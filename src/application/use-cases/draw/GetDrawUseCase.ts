import { PeladaTeamRepository, PeladaTeamRecord } from '@ports/repositories/PeladaTeamRepository';
import { DrawAssignmentRepository, DrawAssignmentRecord } from '@ports/repositories/DrawAssignmentRepository';

export interface DrawResult {
  team: PeladaTeamRecord;
  players: DrawAssignmentRecord[];
}

/**
 * Retrieves the current draw for a pelada.
 */
export class GetDrawUseCase {
  constructor(
    private readonly teamRepo: PeladaTeamRepository,
    private readonly drawRepo: DrawAssignmentRepository
  ) {}

  async execute(peladaId: string): Promise<DrawResult[]> {
    const teams = await this.teamRepo.listByPeladaId(peladaId);
    const assignments = await this.drawRepo.listByPeladaId(peladaId);

    return teams.map((team) => ({
      team,
      players: assignments.filter((a) => a.pelada_team_id === team.id),
    }));
  }
}
