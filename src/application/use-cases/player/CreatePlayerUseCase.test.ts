import { describe, it, expect } from 'vitest';
import { CreatePlayerUseCase } from './CreatePlayerUseCase';
import { FakePlayerRepository } from './testing/FakePlayerRepository';

describe('CreatePlayerUseCase', () => {
  it('creates a player with all fields', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new CreatePlayerUseCase(repo);

    const result = await useCase.execute('profile-1', {
      name: 'João',
      nickname: 'Jão',
      phone: '11999999999',
      stars: 3.5,
      position: 'line',
      speed: 'fast',
      default_type: 'line',
      invited_by_id: 'other-player-id',
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('João');
    expect(result.stars).toBe(3.5);
    expect(result.status).toBe('active');
  });

  it('throws if stars < 0', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new CreatePlayerUseCase(repo);

    await expect(
      useCase.execute('profile-1', {
        name: 'João',
        stars: -1,
        position: 'line',
        speed: 'medium',
        default_type: 'line',
      })
    ).rejects.toThrow('Stars must be between 0 and 5');
  });

  it('throws if stars > 5', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new CreatePlayerUseCase(repo);

    await expect(
      useCase.execute('profile-1', {
        name: 'João',
        stars: 5.1,
        position: 'line',
        speed: 'medium',
        default_type: 'line',
      })
    ).rejects.toThrow('Stars must be between 0 and 5');
  });
});
