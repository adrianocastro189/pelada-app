import { describe, it, expect } from 'vitest';
import { UpdateFinancialRecordUseCase } from './UpdateFinancialRecordUseCase';
import { FakeFinancialRecordRepository } from './testing/FakeFinancialRecordRepository';

describe('UpdateFinancialRecordUseCase', () => {
  it('updates a financial record', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new UpdateFinancialRecordUseCase(repo);

    const created = await repo.create('profile-1', {
      date: new Date('2026-06-01'),
      description: 'Original',
      value: 1000,
      type: 'credit',
    });

    const result = await useCase.execute(created.id, {
      description: 'Updated',
      value: 2000,
    });

    expect(result.description).toBe('Updated');
    expect(result.value).toBe(2000);
  });

  it('throws if value <= 0', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new UpdateFinancialRecordUseCase(repo);

    const created = await repo.create('profile-1', {
      date: new Date(),
      description: 'Test',
      value: 1000,
      type: 'credit',
    });

    await expect(useCase.execute(created.id, { value: 0 })).rejects.toThrow(
      'Value must be positive'
    );
  });

  it('throws if record not found', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new UpdateFinancialRecordUseCase(repo);

    await expect(useCase.execute('non-existent', { description: 'New' })).rejects.toThrow(
      'Financial record not found'
    );
  });
});
