import { describe, it, expect } from 'vitest';
import { CreatePeladaUseCase } from './CreatePeladaUseCase';
import { FakePeladaRepository } from './testing/FakePeladaRepository';

describe('CreatePeladaUseCase', () => {
  it('creates a pelada with valid input', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new CreatePeladaUseCase(repo);

    const result = await useCase.execute('profile-1', {
      date: new Date('2026-06-15'),
      time: '19:00',
      location: 'Campo do Bom Retiro',
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    expect(result.id).toBeDefined();
    expect(result.date).toEqual(new Date('2026-06-15'));
    expect(result.time).toBe('19:00');
    expect(result.location).toBe('Campo do Bom Retiro');
    expect(result.profile_id).toBe('profile-1');
  });

  it('throws if players_per_team < 1', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new CreatePeladaUseCase(repo);

    await expect(
      useCase.execute('profile-1', {
        date: new Date(),
        players_per_team: 0,
        max_goalkeepers: 1,
        cost_per_player: 5000,
        goalkeeper_pays: false,
      })
    ).rejects.toThrow('players_per_team must be at least 1');
  });

  it('throws if cost_per_player < 0', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new CreatePeladaUseCase(repo);

    await expect(
      useCase.execute('profile-1', {
        date: new Date(),
        players_per_team: 5,
        max_goalkeepers: 1,
        cost_per_player: -100,
        goalkeeper_pays: false,
      })
    ).rejects.toThrow('cost_per_player must be at least 0');
  });

  it('throws if max_goalkeepers < 0', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new CreatePeladaUseCase(repo);

    await expect(
      useCase.execute('profile-1', {
        date: new Date(),
        players_per_team: 5,
        max_goalkeepers: -1,
        cost_per_player: 5000,
        goalkeeper_pays: false,
      })
    ).rejects.toThrow('max_goalkeepers must be at least 0');
  });
});
