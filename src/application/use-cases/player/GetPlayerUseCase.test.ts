import { describe, it, expect } from 'vitest';
import { GetPlayerUseCase } from './GetPlayerUseCase';
import { FakePlayerRepository } from './testing/FakePlayerRepository';

describe('GetPlayerUseCase', () => {
  it('returns a player if it exists', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new GetPlayerUseCase(repo);

    const created = await repo.create('profile-1', {
      name: 'João',
      stars: 3,
      position: 'line',
      speed: 'medium',
      default_type: 'line',
    });

    const result = await useCase.execute(created.id);

    expect(result).toEqual(created);
  });

  it('throws if player not found', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new GetPlayerUseCase(repo);

    await expect(useCase.execute('non-existent')).rejects.toThrow('Player not found');
  });
});
