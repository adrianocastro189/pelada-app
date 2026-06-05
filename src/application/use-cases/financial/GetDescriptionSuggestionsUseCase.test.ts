import { describe, it, expect } from 'vitest';
import { GetDescriptionSuggestionsUseCase } from './GetDescriptionSuggestionsUseCase';
import { FakeFinancialRecordRepository } from './testing/FakeFinancialRecordRepository';

describe('GetDescriptionSuggestionsUseCase', () => {
  it('returns unique suggestions matching query (case-insensitive)', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new GetDescriptionSuggestionsUseCase(repo);

    await repo.create('profile-1', {
      date: new Date(),
      description: 'Cerveja na Arena',
      value: 5000,
      type: 'debit',
    });

    await repo.create('profile-1', {
      date: new Date(),
      description: 'Cerveja no Bar',
      value: 3000,
      type: 'debit',
    });

    const result = await useCase.execute('profile-1', 'cerveja');

    expect(result).toHaveLength(2);
    expect(result).toContain('Cerveja na Arena');
    expect(result).toContain('Cerveja no Bar');
  });

  it('returns empty array if no matches', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new GetDescriptionSuggestionsUseCase(repo);

    await repo.create('profile-1', {
      date: new Date(),
      description: 'Cerveja',
      value: 5000,
      type: 'debit',
    });

    const result = await useCase.execute('profile-1', 'pizza');

    expect(result).toEqual([]);
  });

  it('returns max 10 suggestions', async () => {
    const repo = new FakeFinancialRecordRepository();
    const useCase = new GetDescriptionSuggestionsUseCase(repo);

    for (let i = 0; i < 15; i++) {
      await repo.create('profile-1', {
        date: new Date(),
        description: `Item ${i}`,
        value: 1000,
        type: 'debit',
      });
    }

    const result = await useCase.execute('profile-1', 'item');

    expect(result.length).toBeLessThanOrEqual(10);
  });
});
