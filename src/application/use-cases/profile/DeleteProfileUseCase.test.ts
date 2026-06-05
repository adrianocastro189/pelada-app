import { describe, it, expect } from 'vitest';
import { DeleteProfileUseCase } from './DeleteProfileUseCase';
import { FakeProfileRepository } from './testing/FakeProfileRepository';

describe('DeleteProfileUseCase', () => {
  it('deletes an existing profile', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new DeleteProfileUseCase(repo);

    const created = await repo.create({ name: 'Time to Delete' });

    await useCase.execute(created.id);

    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('throws if profile not found', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new DeleteProfileUseCase(repo);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Profile not found');
  });
});
