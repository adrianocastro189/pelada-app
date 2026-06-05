import { PeladaPlayerRepository, PeladaPlayerRecord } from '@ports/repositories/PeladaPlayerRepository';

/**
 * Marks a player as paid or unpaid in a pelada.
 */
export class SetPlayerPaidUseCase {
  constructor(private readonly repo: PeladaPlayerRepository) {}

  async execute(peladaId: string, playerId: string, paid: boolean): Promise<PeladaPlayerRecord> {
    const record = await this.repo.setPaid(peladaId, playerId, paid);
    if (!record) {
      throw new Error('Player not in roster');
    }
    return record;
  }
}
