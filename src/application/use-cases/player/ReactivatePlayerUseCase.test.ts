import { describe, it, expect } from 'vitest';
import { ReactivatePlayerUseCase } from './ReactivatePlayerUseCase';
import { FakePlayerRepository } from './testing/FakePlayerRepository';

describe('ReactivatePlayerUseCase', () => {
  it('reactivates an inactive player', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new ReactivatePlayerUseCase(repo);

    const created = await repo.create('profile-1', {
      name: 'João',
      stars: 3,
      position: 'line',
      speed: 'medium',
      default_type: 'line',
    });

    await repo.inactivate(created.id);
    await useCase.execute(created.id);

    const found = await repo.findById(created.id);
    expect(found?.status).toBe('active');
  });

  it('throws if player not found', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new ReactivatePlayerUseCase(repo);

    await expect(useCase.execute('non-existent')).rejects.toThrow('Player not found');
  });
});
