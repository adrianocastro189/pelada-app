import { describe, it, expect } from 'vitest';
import { ListFinancialRecordsUseCase } from './ListFinancialRecordsUseCase';
import { FakeFinancialRecordRepository } from './testing/FakeFinancialRecordRepository';

describe('ListFinancialRecordsUseCase', () => {
  it('returns all financial records for a profile', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new ListFinancialRecordsUseCase(repo);

    const record1 = await repo.create('profile-1', {
      date: new Date(),
      description: 'Record 1',
      value: 1000,
      type: 'credit',
    });

    const record2 = await repo.create('profile-1', {
      date: new Date(),
      description: 'Record 2',
      value: 2000,
      type: 'debit',
    });

    const result = await useCase.execute('profile-1');

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(record1);
    expect(result).toContainEqual(record2);
  });

  it('returns empty array if no records exist', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new ListFinancialRecordsUseCase(repo);

    const result = await useCase.execute('profile-1');

    expect(result).toEqual([]);
  });
});
