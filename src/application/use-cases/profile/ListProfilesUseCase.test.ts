import { describe, it, expect } from 'vitest';
import { ListProfilesUseCase } from './ListProfilesUseCase';
import { FakeProfileRepository } from './testing/FakeProfileRepository';

describe('ListProfilesUseCase', () => {
  it('returns all profiles', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new ListProfilesUseCase(repo);

    const profile1 = await repo.create({ name: 'Profile 1' });
    const profile2 = await repo.create({ name: 'Profile 2' });

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(profile1);
    expect(result).toContainEqual(profile2);
  });

  it('returns empty array if no profiles exist', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new ListProfilesUseCase(repo);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
