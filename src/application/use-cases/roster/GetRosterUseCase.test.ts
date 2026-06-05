import { describe, it, expect } from 'vitest';
import { GetRosterUseCase } from './GetRosterUseCase';
import { FakePeladaPlayerRepository } from './testing/FakePeladaPlayerRepository';

describe('GetRosterUseCase', () => {
  it('returns roster for a pelada', async () => {
    const repo = new FakePeladaPlayerRepository();
    const useCase = new GetRosterUseCase(repo);

    const p1 = await repo.addToRoster('pelada-1', 'player-1', 'line');
    const p2 = await repo.addToRoster('pelada-1', 'player-2', 'goalkeeper');

    const result = await useCase.execute('pelada-1');

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(p1);
    expect(result).toContainEqual(p2);
  });

  it('returns empty array if roster empty', async () => {
    const repo = new FakePeladaPlayerRepository();
    const useCase = new GetRosterUseCase(repo);

    const result = await useCase.execute('pelada-1');

    expect(result).toEqual([]);
  });
});
