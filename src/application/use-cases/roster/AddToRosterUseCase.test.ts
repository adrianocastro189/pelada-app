import { describe, it, expect } from 'vitest';
import { AddToRosterUseCase } from './AddToRosterUseCase';
import { FakePeladaRepository } from '../pelada/testing/FakePeladaRepository';
import { FakePeladaPlayerRepository } from './testing/FakePeladaPlayerRepository';

describe('AddToRosterUseCase', () => {
  it('adds a player to roster', async () => {
    const peladaRepo = new FakePeladaRepository();
    const rosterRepo = new FakePeladaPlayerRepository();
    const useCase = new AddToRosterUseCase(peladaRepo, rosterRepo);

    const pelada = await peladaRepo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    const result = await useCase.execute(pelada.id, 'player-1', 'line');

    expect(result.pelada_id).toBe(pelada.id);
    expect(result.player_id).toBe('player-1');
    expect(result.slot_type).toBe('line');
  });

  it('throws if pelada not found', async () => {
    const peladaRepo = new FakePeladaRepository();
    const rosterRepo = new FakePeladaPlayerRepository();
    const useCase = new AddToRosterUseCase(peladaRepo, rosterRepo);

    await expect(useCase.execute('non-existent', 'player-1', 'line')).rejects.toThrow(
      'Pelada not found'
    );
  });

  it('throws if player already in roster', async () => {
    const peladaRepo = new FakePeladaRepository();
    const rosterRepo = new FakePeladaPlayerRepository();
    const useCase = new AddToRosterUseCase(peladaRepo, rosterRepo);

    const pelada = await peladaRepo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    await rosterRepo.addToRoster(pelada.id, 'player-1', 'line');

    await expect(useCase.execute(pelada.id, 'player-1', 'line')).rejects.toThrow(
      'Player already in roster'
    );
  });

  it('throws if line slots are full', async () => {
    const peladaRepo = new FakePeladaRepository();
    const rosterRepo = new FakePeladaPlayerRepository();
    const useCase = new AddToRosterUseCase(peladaRepo, rosterRepo);

    const pelada = await peladaRepo.create('profile-1', {
      date: new Date(),
      players_per_team: 2,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    await rosterRepo.addToRoster(pelada.id, 'p1', 'line');
    await rosterRepo.addToRoster(pelada.id, 'p2', 'line');

    await expect(useCase.execute(pelada.id, 'p3', 'line')).rejects.toThrow(
      'Line slots are full'
    );
  });

  it('throws if goalkeeper slots are full', async () => {
    const peladaRepo = new FakePeladaRepository();
    const rosterRepo = new FakePeladaPlayerRepository();
    const useCase = new AddToRosterUseCase(peladaRepo, rosterRepo);

    const pelada = await peladaRepo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    await rosterRepo.addToRoster(pelada.id, 'gk1', 'goalkeeper');

    await expect(useCase.execute(pelada.id, 'gk2', 'goalkeeper')).rejects.toThrow(
      'Goalkeeper slots are full'
    );
  });
});
