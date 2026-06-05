import { describe, it, expect } from 'vitest';
import { GetProfileUseCase } from './GetProfileUseCase';
import { FakeProfileRepository } from './testing/FakeProfileRepository';

describe('GetProfileUseCase', () => {
  it('returns a profile if it exists', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new GetProfileUseCase(repo);

    const created = await repo.create({ name: 'Existing Profile' });

    const result = await useCase.execute(created.id);

    expect(result).toEqual(created);
  });

  it('throws if profile not found', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new GetProfileUseCase(repo);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Profile not found');
  });
});
