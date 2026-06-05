import { ProfileRepository, ProfileRecord } from '@ports/repositories/ProfileRepository';

/**
 * Lists all profiles.
 */
export class ListProfilesUseCase {
  constructor(private readonly repo: ProfileRepository) {}

  async execute(): Promise<ProfileRecord[]> {
    return this.repo.listAll();
  }
}
