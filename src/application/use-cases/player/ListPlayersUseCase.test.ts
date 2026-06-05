import { describe, it, expect } from 'vitest';
import { ListPlayersUseCase } from './ListPlayersUseCase';
import { FakePlayerRepository } from './testing/FakePlayerRepository';

describe('ListPlayersUseCase', () => {
  it('returns only active players by default', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new ListPlayersUseCase(repo);

    const active = await repo.create('profile-1', {
      name: 'Active Player',
      stars: 3,
      position: 'line',
      speed: 'medium',
      default_type: 'line',
    });

    const inactive = await repo.create('profile-1', {
      name: 'Inactive Player',
      stars: 2,
      position: 'goalkeeper',
      speed: 'slow',
      default_type: 'goalkeeper',
    });

    await repo.inactivate(inactive.id);

    const result = await useCase.execute('profile-1');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(active);
  });

  it('returns all players if includeInactive = true', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new ListPlayersUseCase(repo);

    const active = await repo.create('profile-1', {
      name: 'Active Player',
      stars: 3,
      position: 'line',
      speed: 'medium',
      default_type: 'line',
    });

    const inactive = await repo.create('profile-1', {
      name: 'Inactive Player',
      stars: 2,
      position: 'goalkeeper',
      speed: 'slow',
      default_type: 'goalkeeper',
    });

    await repo.inactivate(inactive.id);

    const result = await useCase.execute('profile-1', true);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(active);
  });

  it('returns empty array if no players exist', async () => {
    const repo = new FakePlayerRepository();
    const useCase = new ListPlayersUseCase(repo);

    const result = await useCase.execute('profile-1');

    expect(result).toEqual([]);
  });
});
