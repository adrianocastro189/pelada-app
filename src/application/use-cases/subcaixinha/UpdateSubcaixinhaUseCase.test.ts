import { describe, it, expect } from 'vitest';
import { UpdateSubcaixinhaUseCase } from './UpdateSubcaixinhaUseCase';
import { FakeSubcaixinhaRepository } from './testing/FakeSubcaixinhaRepository';

describe('UpdateSubcaixinhaUseCase', () => {
  it('updates subcaixinha name and goal', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new UpdateSubcaixinhaUseCase(repo);

    const created = await repo.create('profile-1', {
      name: 'Old Name',
      goal: 10000,
    });

    const result = await useCase.execute(created.id, {
      name: 'New Name',
      goal: 50000,
    });

    expect(result.name).toBe('New Name');
    expect(result.goal).toBe(50000);
  });

  it('throws if goal <= 0', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new UpdateSubcaixinhaUseCase(repo);

    const created = await repo.create('profile-1', { name: 'Test' });

    await expect(useCase.execute(created.id, { goal: 0 })).rejects.toThrow(
      'Goal must be positive'
    );
  });

  it('throws if subcaixinha not found', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new UpdateSubcaixinhaUseCase(repo);

    await expect(useCase.execute('non-existent', { name: 'New' })).rejects.toThrow(
      'Subcaixinha not found'
    );
  });
});
