import { describe, it, expect } from 'vitest';
import { ListSubcaixinhasUseCase } from './ListSubcaixinhasUseCase';
import { FakeSubcaixinhaRepository } from './testing/FakeSubcaixinhaRepository';

describe('ListSubcaixinhasUseCase', () => {
  it('returns all subcaixinhas for a profile', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new ListSubcaixinhasUseCase(repo);

    const sub1 = await repo.create('profile-1', { name: 'Cerveja' });
    const sub2 = await repo.create('profile-1', { name: 'Água' });

    const result = await useCase.execute('profile-1');

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(sub1);
    expect(result).toContainEqual(sub2);
  });

  it('returns empty array if no subcaixinhas exist', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new ListSubcaixinhasUseCase(repo);

    const result = await useCase.execute('profile-1');

    expect(result).toEqual([]);
  });
});
