import { describe, it, expect } from 'vitest';
import { UpdatePeladaUseCase } from './UpdatePeladaUseCase';
import { FakePeladaRepository } from './testing/FakePeladaRepository';

describe('UpdatePeladaUseCase', () => {
  it('updates pelada fields', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new UpdatePeladaUseCase(repo);

    const created = await repo.create('profile-1', {
      date: new Date('2026-06-15'),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    const result = await useCase.execute(created.id, {
      players_per_team: 7,
      cost_per_player: 7000,
    });

    expect(result.players_per_team).toBe(7);
    expect(result.cost_per_player).toBe(7000);
    expect(result.date).toEqual(created.date);
  });

  it('throws if players_per_team < 1', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new UpdatePeladaUseCase(repo);

    const created = await repo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    await expect(useCase.execute(created.id, { players_per_team: 0 })).rejects.toThrow(
      'players_per_team must be at least 1'
    );
  });

  it('throws if cost_per_player < 0', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new UpdatePeladaUseCase(repo);

    const created = await repo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    await expect(useCase.execute(created.id, { cost_per_player: -100 })).rejects.toThrow(
      'cost_per_player must be at least 0'
    );
  });

  it('throws if pelada not found', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new UpdatePeladaUseCase(repo);

    await expect(useCase.execute('non-existent', { players_per_team: 7 })).rejects.toThrow(
      'Pelada not found'
    );
  });
});
