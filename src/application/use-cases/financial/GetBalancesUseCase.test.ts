import { describe, it, expect } from 'vitest';
import { GetBalancesUseCase } from './GetBalancesUseCase';
import { FakeFinancialRecordRepository } from './testing/FakeFinancialRecordRepository';
import { BalanceCalculator } from '@domain/services/BalanceCalculator';

describe('GetBalancesUseCase', () => {
  it('calculates balances correctly', async () => {
    const repo = new FakeFinancialRecordRepository();
    const calculator = new BalanceCalculator();
    const useCase = new GetBalancesUseCase(repo, calculator);

    // June 2026 — create as Date objects to ensure correct month
    const jun1 = new Date(2026, 5, 1); // month is 0-indexed: 5 = June
    const jun5 = new Date(2026, 5, 5);
    const may15 = new Date(2026, 4, 15); // month 4 = May

    await repo.create('profile-1', {
      date: jun1,
      description: 'Credit 1',
      value: 10000,
      type: 'credit',
    });

    await repo.create('profile-1', {
      date: jun5,
      description: 'Debit 1',
      value: 3000,
      type: 'debit',
    });

    await repo.create('profile-1', {
      date: may15,
      description: 'Credit May',
      value: 5000,
      type: 'credit',
    });

    const result = await useCase.execute('profile-1', 2026, 5); // June is month 5 (0-indexed)

    expect(result.general).toBe(10000 - 3000 + 5000); // 12000
    expect(result.month).toBe(10000 - 3000); // 7000 (June only)
    expect(result.previousMonth).toBe(5000); // May only
  });

  it('handles year boundary correctly', async () => {
    const repo = new FakeFinancialRecordRepository();
    const calculator = new BalanceCalculator();
    const useCase = new GetBalancesUseCase(repo, calculator);

    // December 2025
    await repo.create('profile-1', {
      date: new Date('2025-12-25T00:00:00Z'),
      description: 'Dec Credit',
      value: 5000,
      type: 'credit',
    });

    // January 2026
    await repo.create('profile-1', {
      date: new Date('2026-01-10T00:00:00Z'),
      description: 'Jan Credit',
      value: 3000,
      type: 'credit',
    });

    const result = await useCase.execute('profile-1', 2026, 0); // January is month 0

    expect(result.month).toBe(3000); // January only
    expect(result.previousMonth).toBe(5000); // December 2025
  });
});
