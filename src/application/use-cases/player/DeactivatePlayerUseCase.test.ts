import { describe, it, expect } from 'vitest';
import { DeactivatePlayerUseCase } from './DeactivatePlayerUseCase';
import { FakePlayerRepository } from './testing/FakePlayerRepository';

describe('DeactivatePlayerUseCase', () => {
  it('deactivates an existing player', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new DeactivatePlayerUseCase(repo);

    const created = await repo.create('profile-1', {
      name: 'João',
      stars: 3,
      position: 'midfield',
      speed: 'medium',
    });

    await useCase.execute(created.id);

    const found = await repo.findById(created.id);
    expect(found?.status).toBe('inactive');
  });

  it('throws if player not found', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new DeactivatePlayerUseCase(repo);

    await expect(useCase.execute('non-existent')).rejects.toThrow('Player not found');
  });
});
