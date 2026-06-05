import { describe, it, expect } from 'vitest';
import { SetPlayerPaidUseCase } from './SetPlayerPaidUseCase';
import { FakePeladaPlayerRepository } from './testing/FakePeladaPlayerRepository';

describe('SetPlayerPaidUseCase', () => {
  it('marks player as paid', async () => {
    const repo = new FakePeladaPlayerRepository();
    const useCase = new SetPlayerPaidUseCase(repo);

    await repo.addToRoster('pelada-1', 'player-1', 'line');

    const result = await useCase.execute('pelada-1', 'player-1', true);

    expect(result.paid).toBe(true);
  });

  it('marks player as unpaid', async () => {
    const repo = new FakePeladaPlayerRepository();
    const useCase = new SetPlayerPaidUseCase(repo);

    await repo.addToRoster('pelada-1', 'player-1', 'line');
    await repo.setPaid('pelada-1', 'player-1', true);

    const result = await useCase.execute('pelada-1', 'player-1', false);

    expect(result.paid).toBe(false);
  });

  it('throws if player not in roster', async () => {
    const repo = new FakePeladaPlayerRepository();
    const useCase = new SetPlayerPaidUseCase(repo);

    await expect(useCase.execute('pelada-1', 'player-1', true)).rejects.toThrow(
      'Player not in roster'
    );
  });
});
