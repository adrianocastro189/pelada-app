import { describe, it, expect } from 'vitest';
import { GetPeladaUseCase } from './GetPeladaUseCase';
import { FakePeladaRepository } from './testing/FakePeladaRepository';

describe('GetPeladaUseCase', () => {
  it('returns a pelada if it exists', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new GetPeladaUseCase(repo);

    const created = await repo.create('profile-1', {
      date: new Date('2026-06-15'),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    const result = await useCase.execute(created.id);

    expect(result).toEqual(created);
  });

  it('throws if pelada not found', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new GetPeladaUseCase(repo);

    await expect(useCase.execute('non-existent')).rejects.toThrow('Pelada not found');
  });
});
