import { describe, it, expect } from 'vitest';
import { CreateSubcaixinhaUseCase } from './CreateSubcaixinhaUseCase';
import { FakeSubcaixinhaRepository } from './testing/FakeSubcaixinhaRepository';

describe('CreateSubcaixinhaUseCase', () => {
  it('creates a subcaixinha without goal', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new CreateSubcaixinhaUseCase(repo);

    const result = await useCase.execute('profile-1', {
      name: 'Cerveja',
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Cerveja');
    expect(result.goal).toBeNull();
    expect(result.current_value).toBe(0);
  });

  it('creates a subcaixinha with goal', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new CreateSubcaixinhaUseCase(repo);

    const result = await useCase.execute('profile-1', {
      name: 'Cerveja',
      goal: 50000,
    });

    expect(result.goal).toBe(50000);
  });

  it('throws if goal <= 0', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new CreateSubcaixinhaUseCase(repo);

    await expect(
      useCase.execute('profile-1', {
        name: 'Invalid',
        goal: 0,
      })
    ).rejects.toThrow('Goal must be positive');
  });
});
