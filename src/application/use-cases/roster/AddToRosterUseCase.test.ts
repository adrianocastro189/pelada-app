import { describe, it, expect } from 'vitest';
import { AddToRosterUseCase } from './AddToRosterUseCase';
import { FakePeladaRepository } from '../pelada/testing/FakePeladaRepository';
import { FakePeladaPlayerRepository } from './testing/FakePeladaPlayerRepository';
import { FakePeladaTeamRepository } from '../draw/testing/FakePeladaTeamRepository';

const baseInput = {
  date: new Date(),
  players_per_team: 5,
  max_goalkeepers: 1,
  cost_per_player: 5000,
  goalkeeper_pays: false,
};

/** Builds the use case with its repos and creates `teamCount` teams for a pelada. */
const setup = () => {
  const peladaRepo = new FakePeladaRepository();
  const rosterRepo = new FakePeladaPlayerRepository();
  const teamRepo = new FakePeladaTeamRepository();
  const useCase = new AddToRosterUseCase(peladaRepo, rosterRepo, teamRepo);
  const createPelada = async (input = baseInput, teamCount = 2) => {
    const pelada = await peladaRepo.create('profile-1', input);
    for (let i = 0; i < teamCount; i++) {
      await teamRepo.create(pelada.id, `Time ${i + 1}`, i);
    }
    return pelada;
  };
  return { peladaRepo, rosterRepo, teamRepo, useCase, createPelada };
};

describe('AddToRosterUseCase', () => {
  it('adds a player to roster', async () => {
    const { useCase, createPelada } = setup();
    const pelada = await createPelada();

    const result = await useCase.execute(pelada.id, 'player-1', 'line');

    expect(result.pelada_id).toBe(pelada.id);
    expect(result.player_id).toBe('player-1');
    expect(result.slot_type).toBe('line');
  });

  it('throws if pelada not found', async () => {
    const { useCase } = setup();

    await expect(useCase.execute('non-existent', 'player-1', 'line')).rejects.toThrow(
      'Pelada not found'
    );
  });

  it('throws if player already in roster', async () => {
    const { useCase, rosterRepo, createPelada } = setup();
    const pelada = await createPelada();

    await rosterRepo.addToRoster(pelada.id, 'player-1', 'line');

    await expect(useCase.execute(pelada.id, 'player-1', 'line')).rejects.toThrow(
      'Player already in roster'
    );
  });

  it('allows players_per_team × number of teams line players', async () => {
    const { useCase, createPelada } = setup();
    // 3 teams × 5 per team = 15 line slots.
    const pelada = await createPelada({ ...baseInput, players_per_team: 5 }, 3);

    for (let i = 0; i < 15; i++) {
      await useCase.execute(pelada.id, `p${i}`, 'line');
    }

    await expect(useCase.execute(pelada.id, 'p15', 'line')).rejects.toThrow(
      'Line slots are full'
    );
  });

  it('throws if line slots are full', async () => {
    const { useCase, rosterRepo, createPelada } = setup();
    // 1 team × 2 per team = 2 line slots.
    const pelada = await createPelada({ ...baseInput, players_per_team: 2 }, 1);

    await rosterRepo.addToRoster(pelada.id, 'p1', 'line');
    await rosterRepo.addToRoster(pelada.id, 'p2', 'line');

    await expect(useCase.execute(pelada.id, 'p3', 'line')).rejects.toThrow(
      'Line slots are full'
    );
  });

  it('throws if goalkeeper slots are full', async () => {
    const { useCase, rosterRepo, createPelada } = setup();
    const pelada = await createPelada();

    await rosterRepo.addToRoster(pelada.id, 'gk1', 'goalkeeper');

    await expect(useCase.execute(pelada.id, 'gk2', 'goalkeeper')).rejects.toThrow(
      'Goalkeeper slots are full'
    );
  });
});
