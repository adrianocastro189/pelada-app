/**
 * Port (interface) for Profile repository operations.
 * No implementation details — contracts only.
 */

export interface ProfileRepository {
  /**
   * Create a new profile.
   * @param profile - { name: string; convocation_template?: string }
   * @returns the created profile (with id and created_at)
   */
  create(profile: { name: string; convocation_template?: string }): Promise<ProfileRecord>;

  /**
   * Delete a profile (hard delete, cascades to all subordinates per ADR-6).
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Retrieve a profile by id.
   * @returns profile or null if not found
   */
  findById(id: string): Promise<ProfileRecord | null>;

  /**
   * List all profiles.
   */
  listAll(): Promise<ProfileRecord[]>;

  /**
   * Update a profile.
   * @returns the updated profile or null if not found
   */
  update(id: string, data: { name?: string; convocation_template?: string }): Promise<ProfileRecord | null>;
}

export interface ProfileRecord {
  id: string;
  name: string;
  convocation_template: string;
  created_at: Date;
}
