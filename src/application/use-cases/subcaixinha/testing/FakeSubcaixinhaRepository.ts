import {
  SubcaixinhaRepository,
  SubcaixinhaRecord,
  CreateSubcaixinhaInput,
  UpdateSubcaixinhaInput,
} from '@ports/repositories/SubcaixinhaRepository';
import { v4 as uuid } from 'uuid';

/**
 * In-memory implementation of SubcaixinhaRepository for testing purposes.
 */
export class FakeSubcaixinhaRepository implements SubcaixinhaRepository {
  private subcaixinhas: Map<string, SubcaixinhaRecord> = new Map();

  async adjustBalance(id: string, delta: number): Promise<SubcaixinhaRecord | null> {
    const subcaixinha = this.subcaixinhas.get(id);
    if (!subcaixinha) return null;

    const updated: SubcaixinhaRecord = {
      ...subcaixinha,
      current_value: subcaixinha.current_value + delta,
    };
    this.subcaixinhas.set(id, updated);
    return updated;
  }

  async create(profileId: string, subcaixinha: CreateSubcaixinhaInput): Promise<SubcaixinhaRecord> {
    const now = new Date();
    const record: SubcaixinhaRecord = {
      id: uuid(),
      profile_id: profileId,
      name: subcaixinha.name,
      goal: subcaixinha.goal ?? null,
      current_value: subcaixinha.current_value ?? 0,
      created_at: now,
    };
    this.subcaixinhas.set(record.id, record);
    return record;
  }

  async delete(id: string): Promise<boolean> {
    const exists = this.subcaixinhas.has(id);
    this.subcaixinhas.delete(id);
    return exists;
  }

  async findById(id: string): Promise<SubcaixinhaRecord | null> {
    return this.subcaixinhas.get(id) ?? null;
  }

  async listByProfileId(profileId: string): Promise<SubcaixinhaRecord[]> {
    return Array.from(this.subcaixinhas.values()).filter((s) => s.profile_id === profileId);
  }

  async update(id: string, data: UpdateSubcaixinhaInput): Promise<SubcaixinhaRecord | null> {
    const subcaixinha = this.subcaixinhas.get(id);
    if (!subcaixinha) return null;

    const updated: SubcaixinhaRecord = {
      ...subcaixinha,
      name: data.name ?? subcaixinha.name,
      goal: data.goal ?? subcaixinha.goal,
      current_value: data.current_value ?? subcaixinha.current_value,
    };
    this.subcaixinhas.set(id, updated);
    return updated;
  }
}
