import { ProfileRepository } from '@ports/repositories/ProfileRepository';

/**
 * Deletes a profile (hard delete, cascades to all subordinates per ADR-6).
 */
export class DeleteProfileUseCase {
  constructor(private readonly repo: ProfileRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new Error('Profile not found');
    }
  }
}
