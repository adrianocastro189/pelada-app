import { describe, it, expect } from 'vitest';
import { CreateProfileUseCase } from './CreateProfileUseCase';
import { FakeProfileRepository } from './testing/FakeProfileRepository';

describe('CreateProfileUseCase', () => {
  it('creates a profile with name and returns it', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new CreateProfileUseCase(repo);

    const result = await useCase.execute({
      name: 'Meu Time',
      convocation_template: 'Galera, partida em {{data}}!',
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Meu Time');
    expect(result.convocation_template).toBe('Galera, partida em {{data}}!');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('creates a profile with empty convocation_template if not provided', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new CreateProfileUseCase(repo);

    const result = await useCase.execute({ name: 'Outro Time' });

    expect(result.convocation_template).toBe('');
  });

  it('trims whitespace from name', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new CreateProfileUseCase(repo);

    const result = await useCase.execute({ name: '  Timão  ' });

    expect(result.name).toBe('Timão');
  });

  it('throws if name is empty string', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new CreateProfileUseCase(repo);

    await expect(useCase.execute({ name: '' })).rejects.toThrow('Profile name cannot be empty');
  });

  it('throws if name is only whitespace', async () => {
    const repo = new FakeProfileRepository();
    const useCase = new CreateProfileUseCase(repo);

    await expect(useCase.execute({ name: '   ' })).rejects.toThrow('Profile name cannot be empty');
  });
});
