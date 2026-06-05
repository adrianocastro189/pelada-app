import { ProfileRepository, ProfileRecord } from '@ports/repositories/ProfileRepository';

/**
 * Retrieves a profile by id.
 */
export class GetProfileUseCase {
  constructor(private readonly repo: ProfileRepository) {}

  async execute(id: string): Promise<ProfileRecord> {
    const profile = await this.repo.findById(id);
    if (!profile) {
      throw new Error('Profile not found');
    }
    return profile;
  }
}
