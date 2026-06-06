import { describe, it, expect } from 'vitest';
import { SearchPlayersUseCase } from './SearchPlayersUseCase';
import { FakePlayerRepository } from './testing/FakePlayerRepository';

describe('SearchPlayersUseCase', () => {
  it('finds players by name (case-insensitive)', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new SearchPlayersUseCase(repo);

    const joão = await repo.create('profile-1', {
      name: 'João Silva',
      stars: 3,
      position: 'midfield',
      speed: 'medium',
    });

    await repo.create('profile-1', {
      name: 'Maria Santos',
      stars: 2,
      position: 'goalkeeper',
      speed: 'slow',
    });

    const result = await useCase.execute('profile-1', 'joão');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(joão);
  });

  it('returns empty array if no matches', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new SearchPlayersUseCase(repo);

    await repo.create('profile-1', {
      name: 'João Silva',
      stars: 3,
      position: 'midfield',
      speed: 'medium',
    });

    const result = await useCase.execute('profile-1', 'inexistent');

    expect(result).toEqual([]);
  });

  it('only returns active players', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new SearchPlayersUseCase(repo);

    await repo.create('profile-1', {
      name: 'João Silva',
      stars: 3,
      position: 'midfield',
      speed: 'medium',
    });

    const inactive = await repo.create('profile-1', {
      name: 'João Santos',
      stars: 2,
      position: 'goalkeeper',
      speed: 'slow',
    });

    await repo.inactivate(inactive.id);

    const result = await useCase.execute('profile-1', 'joão');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('João Silva');
  });
});
