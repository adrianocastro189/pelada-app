import { describe, it, expect } from 'vitest';
import { DeleteFinancialRecordUseCase } from './DeleteFinancialRecordUseCase';
import { FakeFinancialRecordRepository } from './testing/FakeFinancialRecordRepository';

describe('DeleteFinancialRecordUseCase', () => {
  it('deletes an existing financial record', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new DeleteFinancialRecordUseCase(repo);

    const created = await repo.create('profile-1', {
      date: new Date(),
      description: 'Test',
      value: 1000,
      type: 'credit',
    });

    await useCase.execute(created.id);

    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('throws if record not found', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new DeleteFinancialRecordUseCase(repo);

    await expect(useCase.execute('non-existent')).rejects.toThrow(
      'Financial record not found'
    );
  });
});
