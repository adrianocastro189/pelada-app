import { describe, it, expect } from 'vitest';
import { DeleteSubcaixinhaUseCase } from './DeleteSubcaixinhaUseCase';
import { FakeSubcaixinhaRepository } from './testing/FakeSubcaixinhaRepository';

describe('DeleteSubcaixinhaUseCase', () => {
  it('deletes a subcaixinha with zero balance', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new DeleteSubcaixinhaUseCase(repo);

    const created = await repo.create('profile-1', {
      name: 'Empty',
      current_value: 0,
    });

    await useCase.execute(created.id);

    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('throws if subcaixinha has non-zero balance', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new DeleteSubcaixinhaUseCase(repo);

    const created = await repo.create('profile-1', {
      name: 'With Balance',
      current_value: 5000,
    });

    await expect(useCase.execute(created.id)).rejects.toThrow(
      'Cannot delete a subcaixinha with non-zero balance'
    );
  });

  it('throws if subcaixinha not found', async () => {
    const repo = new FakeSubcaixinhaRepository();
    const useCase = new DeleteSubcaixinhaUseCase(repo);

    await expect(useCase.execute('non-existent')).rejects.toThrow('Subcaixinha not found');
  });
});
