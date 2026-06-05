import { ProfileRepository, ProfileRecord } from '@ports/repositories/ProfileRepository';

export interface UpdateProfileInput {
  name?: string;
  convocation_template?: string;
}

/**
 * Updates a profile.
 */
export class UpdateProfileUseCase {
  constructor(private readonly repo: ProfileRepository) {}

  async execute(id: string, data: UpdateProfileInput): Promise<ProfileRecord> {
    if (data.name !== undefined && (!data.name || data.name.trim() === '')) {
      throw new Error('Profile name cannot be empty');
    }

    const profile = await this.repo.update(id, {
      name: data.name?.trim(),
      convocation_template: data.convocation_template,
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }
}
