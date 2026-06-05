import { describe, it, expect } from 'vitest';
import { AllocateDeltaUseCase } from './AllocateDeltaUseCase';
import { FakeSubcaixinhaRepository } from './testing/FakeSubcaixinhaRepository';
import { FakeFinancialRecordRepository } from '../financial/testing/FakeFinancialRecordRepository';
import { BalanceCalculator } from '@domain/services/BalanceCalculator';
import { SubcaixinhaBalancer } from '@domain/services/SubcaixinhaBalancer';

describe('AllocateDeltaUseCase', () => {
  it('allocates delta correctly', async () => {
    const subcaixinhaRepo = new FakeSubcaixinhaRepository();
    const financialRepo = new FakeFinancialRecordRepository();
    const balanceCalc = new BalanceCalculator();
    const balancer = new SubcaixinhaBalancer();
    const useCase = new AllocateDeltaUseCase(subcaixinhaRepo, financialRepo, balanceCalc, balancer);

    // Create financial records: +20000 (credit)
    await financialRepo.create('profile-1', {
      date: new Date(),
      description: 'Income',
      value: 20000,
      type: 'credit',
    });

    // Create subcaixinhas with 0 balance
    const sub1 = await subcaixinhaRepo.create('profile-1', { name: 'Sub1' });
    const sub2 = await subcaixinhaRepo.create('profile-1', { name: 'Sub2' });

    // Delta = 20000 - 0 = 20000
    // Allocate: 12000 to sub1, 8000 to sub2
    await useCase.execute('profile-1', [
      { subcaixinhaId: sub1.id, amount: 12000 },
      { subcaixinhaId: sub2.id, amount: 8000 },
    ]);

    const updated1 = await subcaixinhaRepo.findById(sub1.id);
    const updated2 = await subcaixinhaRepo.findById(sub2.id);

    expect(updated1?.current_value).toBe(12000);
    expect(updated2?.current_value).toBe(8000);
  });

  it('throws if total allocation does not match delta', async () => {
    const subcaixinhaRepo = new FakeSubcaixinhaRepository();
    const financialRepo = new FakeFinancialRecordRepository();
    const balanceCalc = new BalanceCalculator();
    const balancer = new SubcaixinhaBalancer();
    const useCase = new AllocateDeltaUseCase(subcaixinhaRepo, financialRepo, balanceCalc, balancer);

    // Create financial records: +20000
    await financialRepo.create('profile-1', {
      date: new Date(),
      description: 'Income',
      value: 20000,
      type: 'credit',
    });

    const sub1 = await subcaixinhaRepo.create('profile-1', { name: 'Sub1' });

    // Try to allocate 15000 when delta is 20000
    await expect(
      useCase.execute('profile-1', [{ subcaixinhaId: sub1.id, amount: 15000 }])
    ).rejects.toThrow('Total allocation must equal delta');
  });

  it('throws if subcaixinha not found', async () => {
    const subcaixinhaRepo = new FakeSubcaixinhaRepository();
    const financialRepo = new FakeFinancialRecordRepository();
    const balanceCalc = new BalanceCalculator();
    const balancer = new SubcaixinhaBalancer();
    const useCase = new AllocateDeltaUseCase(subcaixinhaRepo, financialRepo, balanceCalc, balancer);

    // Create financial records: +20000
    await financialRepo.create('profile-1', {
      date: new Date(),
      description: 'Income',
      value: 20000,
      type: 'credit',
    });

    // Try to allocate to non-existent subcaixinha
    await expect(
      useCase.execute('profile-1', [{ subcaixinhaId: 'non-existent', amount: 20000 }])
    ).rejects.toThrow('Subcaixinha not found');
  });
});
