import { ProfileRepository, ProfileRecord } from '@ports/repositories/ProfileRepository';

export interface CreateProfileInput {
  name: string;
  convocation_template?: string;
}

/**
 * Creates a new profile.
 */
export class CreateProfileUseCase {
  constructor(private readonly repo: ProfileRepository) {}

  async execute(input: CreateProfileInput): Promise<ProfileRecord> {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Profile name cannot be empty');
    }

    return this.repo.create({
      name: input.name.trim(),
      convocation_template: input.convocation_template,
    });
  }
}
