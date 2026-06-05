import { describe, it, expect } from 'vitest';
import { DeletePeladaUseCase } from './DeletePeladaUseCase';
import { FakePeladaRepository } from './testing/FakePeladaRepository';

describe('DeletePeladaUseCase', () => {
  it('deletes an existing pelada', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new DeletePeladaUseCase(repo);

    const created = await repo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    await useCase.execute(created.id);

    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('throws if pelada not found', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new DeletePeladaUseCase(repo);

    await expect(useCase.execute('non-existent')).rejects.toThrow('Pelada not found');
  });
});
