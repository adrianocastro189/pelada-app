import { describe, it, expect } from 'vitest';
import { ClonePeladaUseCase } from './ClonePeladaUseCase';
import { FakePeladaRepository } from './testing/FakePeladaRepository';

describe('ClonePeladaUseCase', () => {
  it('clones a pelada with new date', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new ClonePeladaUseCase(repo);

    const original = await repo.create('profile-1', {
      date: new Date('2026-06-15'),
      time: '19:00',
      location: 'Campo do Bom Retiro',
      players_per_team: 5,
      max_goalkeepers: 1,
      cost_per_player: 5000,
      goalkeeper_pays: false,
    });

    const cloned = await useCase.execute(original.id, new Date('2026-06-22'));

    expect(cloned.id).not.toBe(original.id);
    expect(cloned.profile_id).toBe(original.profile_id);
    expect(cloned.date).toEqual(new Date('2026-06-22'));
    expect(cloned.time).toBe(original.time);
    expect(cloned.location).toBe(original.location);
    expect(cloned.players_per_team).toBe(original.players_per_team);
  });

  it('throws if original pelada not found', async () => {
    const repo = new FakePeladaRepository();
    const useCase = new ClonePeladaUseCase(repo);

    await expect(useCase.execute('non-existent', new Date())).rejects.toThrow(
      'Pelada not found'
    );
  });
});
