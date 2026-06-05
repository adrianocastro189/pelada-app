import { describe, it, expect } from 'vitest';
import { RemoveFromRosterUseCase } from './RemoveFromRosterUseCase';
import { FakePeladaPlayerRepository } from './testing/FakePeladaPlayerRepository';

describe('RemoveFromRosterUseCase', () => {
  it('removes a player from roster', async () => {
    const repo = new FakePeladaPlayerRepository();
    const useCase = new RemoveFromRosterUseCase(repo);

    await repo.addToRoster('pelada-1', 'player-1', 'line');

    await useCase.execute('pelada-1', 'player-1');

    const found = await repo.findByPeladaAndPlayer('pelada-1', 'player-1');
    expect(found).toBeNull();
  });

  it('throws if player not in roster', async () => {
    const repo = new FakePeladaPlayerRepository();
    const useCase = new RemoveFromRosterUseCase(repo);

    await expect(useCase.execute('pelada-1', 'player-1')).rejects.toThrow(
      'Player not in roster'
    );
  });
});
