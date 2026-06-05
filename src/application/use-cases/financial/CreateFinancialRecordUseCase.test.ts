import { describe, it, expect } from 'vitest';
import { CreateFinancialRecordUseCase } from './CreateFinancialRecordUseCase';
import { FakeFinancialRecordRepository } from './testing/FakeFinancialRecordRepository';

describe('CreateFinancialRecordUseCase', () => {
  it('creates a financial record with valid input', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new CreateFinancialRecordUseCase(repo);

    const result = await useCase.execute('profile-1', {
      date: new Date('2026-06-05'),
      description: 'Cerveja',
      value: 5000,
      type: 'debit',
    });

    expect(result.id).toBeDefined();
    expect(result.profile_id).toBe('profile-1');
    expect(result.value).toBe(5000);
    expect(result.type).toBe('debit');
  });

  it('throws if value <= 0', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new CreateFinancialRecordUseCase(repo);

    await expect(
      useCase.execute('profile-1', {
        date: new Date(),
        description: 'Invalid',
        value: 0,
        type: 'credit',
      })
    ).rejects.toThrow('Value must be positive');
  });

  it('throws if value is negative', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new CreateFinancialRecordUseCase(repo);

    await expect(
      useCase.execute('profile-1', {
        date: new Date(),
        description: 'Invalid',
        value: -1000,
        type: 'debit',
      })
    ).rejects.toThrow('Value must be positive');
  });
});
