import { PeladaTeamRepository, PeladaTeamRecord } from '@ports/repositories/PeladaTeamRepository';
import { v4 as uuid } from 'uuid';

export class FakePeladaTeamRepository implements PeladaTeamRepository {
  private teams: Map<string, PeladaTeamRecord> = new Map();

  async create(peladaId: string, name: string, sort_order?: number): Promise<PeladaTeamRecord> {
    const record: PeladaTeamRecord = {
      id: uuid(),
      pelada_id: peladaId,
      name,
      sort_order: sort_order ?? 0,
      created_at: new Date(),
    };
    this.teams.set(record.id, record);
    return record;
  }

  async delete(id: string): Promise<boolean> {
    return this.teams.delete(id);
  }

  async deleteAllByPeladaId(peladaId: string): Promise<number> {
    const before = this.teams.size;
    Array.from(this.teams.entries())
      .filter(([, t]) => t.pelada_id === peladaId)
      .forEach(([id]) => this.teams.delete(id));
    return before - this.teams.size;
  }

  async findById(id: string): Promise<PeladaTeamRecord | null> {
    return this.teams.get(id) ?? null;
  }

  async listByPeladaId(peladaId: string): Promise<PeladaTeamRecord[]> {
    return Array.from(this.teams.values())
      .filter((t) => t.pelada_id === peladaId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  async update(id: string, name: string): Promise<PeladaTeamRecord | null> {
    const team = this.teams.get(id);
    if (!team) return null;
    const updated = { ...team, name };
    this.teams.set(id, updated);
    return updated;
  }
}
