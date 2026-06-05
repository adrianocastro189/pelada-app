import { describe, it, expect } from 'vitest';
import { UpdateProfileUseCase } from './UpdateProfileUseCase';
import { FakeProfileRepository } from './testing/FakeProfileRepository';

describe('UpdateProfileUseCase', () => {
  it('updates profile name', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new UpdateProfileUseCase(repo);

    const created = await repo.create({ name: 'Old Name' });

    const result = await useCase.execute(created.id, { name: 'New Name' });

    expect(result.name).toBe('New Name');
  });

  it('updates convocation_template', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new UpdateProfileUseCase(repo);

    const created = await repo.create({ name: 'Profile', convocation_template: 'Old' });

    const result = await useCase.execute(created.id, { convocation_template: 'New' });

    expect(result.convocation_template).toBe('New');
  });

  it('updates name and template together', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new UpdateProfileUseCase(repo);

    const created = await repo.create({ name: 'Old', convocation_template: 'Old' });

    const result = await useCase.execute(created.id, {
      name: 'New Name',
      convocation_template: 'New Template',
    });

    expect(result.name).toBe('New Name');
    expect(result.convocation_template).toBe('New Template');
  });

  it('trims whitespace from name', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new UpdateProfileUseCase(repo);

    const created = await repo.create({ name: 'Profile' });

    const result = await useCase.execute(created.id, { name: '  Updated  ' });

    expect(result.name).toBe('Updated');
  });

  it('throws if name is empty string', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new UpdateProfileUseCase(repo);

    const created = await repo.create({ name: 'Profile' });

    await expect(useCase.execute(created.id, { name: '' })).rejects.toThrow(
      'Profile name cannot be empty'
    );
  });

  it('throws if name is only whitespace', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new UpdateProfileUseCase(repo);

    const created = await repo.create({ name: 'Profile' });

    await expect(useCase.execute(created.id, { name: '   ' })).rejects.toThrow(
      'Profile name cannot be empty'
    );
  });

  it('throws if profile not found', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new UpdateProfileUseCase(repo);

    await expect(useCase.execute('non-existent-id', { name: 'New' })).rejects.toThrow(
      'Profile not found'
    );
  });
});
