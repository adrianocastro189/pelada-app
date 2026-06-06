import { describe, it, expect } from 'vitest';
import { CreatePeladaUseCase } from './CreatePeladaUseCase';
import { FakePeladaRepository } from './testing/FakePeladaRepository';
import { FakePeladaTeamRepository } from '../draw/testing/FakePeladaTeamRepository';

const validInput = {
  date: new Date('2026-06-15'),
  time: '19:00',
  location: 'Campo do Bom Retiro',
  players_per_team: 5,
  max_goalkeepers: 1,
  cost_per_player: 5000,
  goalkeeper_pays: false,
};

const makeUseCase = () => {
  const repo = new FakePeladaRepository();
  const teamRepo = new FakePeladaTeamRepository();
  return { repo, teamRepo, useCase: new CreatePeladaUseCase(repo, teamRepo) };
};

describe('CreatePeladaUseCase', () => {
  it('creates a pelada with valid input', async () => {
    const { useCase } = makeUseCase();

    const result = await useCase.execute('profile-1', validInput, ['Time A', 'Time B']);

    expect(result.id).toBeDefined();
    expect(result.date).toEqual(new Date('2026-06-15'));
    expect(result.time).toBe('19:00');
    expect(result.location).toBe('Campo do Bom Retiro');
    expect(result.profile_id).toBe('profile-1');
  });

  it('creates teams from the provided names, in order', async () => {
    const { useCase, teamRepo } = makeUseCase();

    const pelada = await useCase.execute('profile-1', validInput, ['Verde', 'Azul', 'Vermelho']);
    const teams = await teamRepo.listByPeladaId(pelada.id);

    expect(teams.map(t => t.name)).toEqual(['Verde', 'Azul', 'Vermelho']);
    expect(teams.map(t => t.sort_order)).toEqual([0, 1, 2]);
  });

  it('ignores blank lines and surrounding whitespace in team names', async () => {
    const { useCase, teamRepo } = makeUseCase();

    const pelada = await useCase.execute('profile-1', validInput, ['  Verde  ', '', '  ', 'Azul']);
    const teams = await teamRepo.listByPeladaId(pelada.id);

    expect(teams.map(t => t.name)).toEqual(['Verde', 'Azul']);
  });

  it('throws if fewer than 2 teams are provided', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute('profile-1', validInput, ['Único']),
    ).rejects.toThrow('At least 2 teams are required');
  });

  it('throws if players_per_team < 1', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute('profile-1', { ...validInput, players_per_team: 0 }, ['Time A', 'Time B']),
    ).rejects.toThrow('players_per_team must be at least 1');
  });

  it('throws if cost_per_player < 0', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute('profile-1', { ...validInput, cost_per_player: -100 }, ['Time A', 'Time B']),
    ).rejects.toThrow('cost_per_player must be at least 0');
  });

  it('throws if max_goalkeepers < 0', async () => {
    const { useCase } = makeUseCase();

    await expect(
      useCase.execute('profile-1', { ...validInput, max_goalkeepers: -1 }, ['Time A', 'Time B']),
    ).rejects.toThrow('max_goalkeepers must be at least 0');
  });
});
