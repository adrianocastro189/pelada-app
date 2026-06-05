import { describe, it, expect } from 'vitest';
import { GetDrawUseCase } from './GetDrawUseCase';
import { FakePeladaTeamRepository } from './testing/FakePeladaTeamRepository';
import { FakeDrawAssignmentRepository } from './testing/FakeDrawAssignmentRepository';

describe('GetDrawUseCase', () => {
  it('returns draw grouped by team', async () => {
    const teamRepo = new FakePeladaTeamRepository();
    const drawRepo = new FakeDrawAssignmentRepository();
    const useCase = new GetDrawUseCase(teamRepo, drawRepo);

    const team1 = await teamRepo.create('pelada-1', 'Azuis', 0);
    const team2 = await teamRepo.create('pelada-1', 'Vermelhos', 1);

    await drawRepo.assign('pelada-1', team1.id, 'player-1');
    await drawRepo.assign('pelada-1', team1.id, 'player-2');
    await drawRepo.assign('pelada-1', team2.id, 'player-3');

    const result = await useCase.execute('pelada-1');

    expect(result).toHaveLength(2);
    expect(result[0].team.id).toBe(team1.id);
    expect(result[0].players).toHaveLength(2);
    expect(result[1].team.id).toBe(team2.id);
    expect(result[1].players).toHaveLength(1);
  });

  it('returns empty array if no teams', async () => {
    const teamRepo = new FakePeladaTeamRepository();
    const drawRepo = new FakeDrawAssignmentRepository();
    const useCase = new GetDrawUseCase(teamRepo, drawRepo);

    const result = await useCase.execute('pelada-1');

    expect(result).toEqual([]);
  });
});
