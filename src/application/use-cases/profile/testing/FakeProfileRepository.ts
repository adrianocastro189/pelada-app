import { ProfileRepository, ProfileRecord } from '@ports/repositories/ProfileRepository';
import { v4 as uuid } from 'uuid';

/**
 * In-memory implementation of ProfileRepository for testing purposes.
 */
export class FakeProfileRepository implements ProfileRepository {
  private profiles: Map<string, ProfileRecord> = new Map();

  async create(profile: { name: string; convocation_template?: string }): Promise<ProfileRecord> {
    const now = new Date();
    const record: ProfileRecord = {
      id: uuid(),
      name: profile.name,
      convocation_template: profile.convocation_template ?? '',
      created_at: now,
    };
    this.profiles.set(record.id, record);
    return record;
  }

  async delete(id: string): Promise<boolean> {
    const exists = this.profiles.has(id);
    this.profiles.delete(id);
    return exists;
  }

  async findById(id: string): Promise<ProfileRecord | null> {
    return this.profiles.get(id) ?? null;
  }

  async listAll(): Promise<ProfileRecord[]> {
    return Array.from(this.profiles.values());
  }

  async update(
    id: string,
    data: { name?: string; convocation_template?: string }
  ): Promise<ProfileRecord | null> {
    const profile = this.profiles.get(id);
    if (!profile) return null;

    const updated: ProfileRecord = {
      ...profile,
      name: data.name ?? profile.name,
      convocation_template: data.convocation_template ?? profile.convocation_template,
    };
    this.profiles.set(id, updated);
    return updated;
  }
}
