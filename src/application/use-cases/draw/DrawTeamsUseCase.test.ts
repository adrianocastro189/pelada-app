import { describe, it, expect } from 'vitest';
import { DrawTeamsUseCase } from './DrawTeamsUseCase';
import { FakePeladaRepository } from '../pelada/testing/FakePeladaRepository';
import { TeamDrawService } from '@domain/services/TeamDrawService';
import { SystemRandomSource } from '@infrastructure/random/SystemRandomSource';
import { TotalStarsStrategy } from '@domain/services/BalancingStrategy';
import { FakePeladaTeamRepository } from './testing/FakePeladaTeamRepository';
import { FakePeladaPlayerRepository } from '../roster/testing/FakePeladaPlayerRepository';
import { FakePlayerRepository } from '../player/testing/FakePlayerRepository';
import { FakeDrawAssignmentRepository } from './testing/FakeDrawAssignmentRepository';

describe('DrawTeamsUseCase', () => {
  it('performs team draw and persists assignments', async () => {
    const peladaRepo = new FakePeladaRepository();
    const teamRepo = new FakePeladaTeamRepository();
    const rosterRepo = new FakePeladaPlayerRepository();
    const playerRepo = new FakePlayerRepository();
    const drawRepo = new FakeDrawAssignmentRepository();
    const drawService = new TeamDrawService();
    const random = new SystemRandomSource();
    const strategy = new TotalStarsStrategy();
    const useCase = new DrawTeamsUseCase(
      peladaRepo,
      teamRepo,
      rosterRepo,
      playerRepo,
      drawRepo,
      drawService,
      random,
      strategy
    );

    // Setup
    const pelada = await peladaRepo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    await teamRepo.create(pelada.id, 'Azuis', 0);
    await teamRepo.create(pelada.id, 'Vermelhos', 1);

    const player1 = await playerRepo.create('profile-1', {
      name: 'Player 1',
      stars: 3,
      position: 'line',
      speed: 'medium',
      default_type: 'line',
    });

    await rosterRepo.addToRoster(pelada.id, player1.id, 'line');

    // Execute
    await useCase.execute(pelada.id);

    // Verify
    const assignments = await drawRepo.listByPeladaId(pelada.id);
    expect(assignments.length).toBeGreaterThan(0);
  });

  it('throws if pelada not found', async () => {
    const peladaRepo = new FakePeladaRepository();
    const teamRepo = new FakePeladaTeamRepository();
    const rosterRepo = new FakePeladaPlayerRepository();
    const playerRepo = new FakePlayerRepository();
    const drawRepo = new FakeDrawAssignmentRepository();
    const drawService = new TeamDrawService();
    const random = new SystemRandomSource();
    const strategy = new TotalStarsStrategy();
    const useCase = new DrawTeamsUseCase(
      peladaRepo,
      teamRepo,
      rosterRepo,
      playerRepo,
      drawRepo,
      drawService,
      random,
      strategy
    );

    await expect(useCase.execute('non-existent')).rejects.toThrow('Pelada not found');
  });

  it('throws if no teams defined', async () => {
    const peladaRepo = new FakePeladaRepository();
    const teamRepo = new FakePeladaTeamRepository();
    const rosterRepo = new FakePeladaPlayerRepository();
    const playerRepo = new FakePlayerRepository();
    const drawRepo = new FakeDrawAssignmentRepository();
    const drawService = new TeamDrawService();
    const random = new SystemRandomSource();
    const strategy = new TotalStarsStrategy();
    const useCase = new DrawTeamsUseCase(
      peladaRepo,
      teamRepo,
      rosterRepo,
      playerRepo,
      drawRepo,
      drawService,
      random,
      strategy
    );

    const pelada = await peladaRepo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    await expect(useCase.execute(pelada.id)).rejects.toThrow(
      'No teams defined for this pelada'
    );
  });

  it('throws if roster empty', async () => {
    const peladaRepo = new FakePeladaRepository();
    const teamRepo = new FakePeladaTeamRepository();
    const rosterRepo = new FakePeladaPlayerRepository();
    const playerRepo = new FakePlayerRepository();
    const drawRepo = new FakeDrawAssignmentRepository();
    const drawService = new TeamDrawService();
    const random = new SystemRandomSource();
    const strategy = new TotalStarsStrategy();
    const useCase = new DrawTeamsUseCase(
      peladaRepo,
      teamRepo,
      rosterRepo,
      playerRepo,
      drawRepo,
      drawService,
      random,
      strategy
    );

    const pelada = await peladaRepo.create('profile-1', {
      date: new Date(),
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    await teamRepo.create(pelada.id, 'Azuis', 0);

    await expect(useCase.execute(pelada.id)).rejects.toThrow('Roster is empty');
  });
});
