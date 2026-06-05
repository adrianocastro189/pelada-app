import { describe, it, expect } from 'vitest';
import { UpdatePlayerUseCase } from './UpdatePlayerUseCase';
import { FakePlayerRepository } from './testing/FakePlayerRepository';

describe('UpdatePlayerUseCase', () => {
  it('updates player stars', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new UpdatePlayerUseCase(repo);

    const created = await repo.create('profile-1', {
      name: 'João',
      stars: 2,
      position: 'line',
      speed: 'medium',
      default_type: 'line',
    });

    const result = await useCase.execute(created.id, { stars: 4.5 });

    expect(result.stars).toBe(4.5);
  });

  it('updates player name', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new UpdatePlayerUseCase(repo);

    const created = await repo.create('profile-1', {
      name: 'João',
      stars: 2,
      position: 'line',
      speed: 'medium',
      default_type: 'line',
    });

    const result = await useCase.execute(created.id, { name: 'João Updated' });

    expect(result.name).toBe('João Updated');
  });

  it('throws if stars is invalid', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new UpdatePlayerUseCase(repo);

    const created = await repo.create('profile-1', {
      name: 'João',
      stars: 2,
      position: 'line',
      speed: 'medium',
      default_type: 'line',
    });

    await expect(useCase.execute(created.id, { stars: 5.5 })).rejects.toThrow(
      'Stars must be between 0 and 5'
    );
  });

  it('throws if player not found', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new UpdatePlayerUseCase(repo);

    await expect(useCase.execute('non-existent', { name: 'New' })).rejects.toThrow(
      'Player not found'
    );
  });
});
