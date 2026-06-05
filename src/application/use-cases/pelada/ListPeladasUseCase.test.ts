import { describe, it, expect } from 'vitest';
import { ListPeladasUseCase } from './ListPeladasUseCase';
import { FakePeladaRepository } from './testing/FakePeladaRepository';

describe('ListPeladasUseCase', () => {
  it('returns all peladas for a profile ordered by date DESC', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new ListPeladasUseCase(repo);

    const older = await repo.create('profile-1', {
      date: new Date('2026-06-01'),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    const newer = await repo.create('profile-1', {
      date: new Date('2026-06-15'),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    const result = await useCase.execute('profile-1');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(newer);
    expect(result[1]).toEqual(older);
  });

  it('returns empty array if no peladas exist', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new ListPeladasUseCase(repo);

    const result = await useCase.execute('profile-1');

    expect(result).toEqual([]);
  });
});
