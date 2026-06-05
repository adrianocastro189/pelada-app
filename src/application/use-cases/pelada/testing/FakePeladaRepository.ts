import {
  PeladaRepository,
  PeladaRecord,
  CreatePeladaInput,
  UpdatePeladaInput,
} from '@ports/repositories/PeladaRepository';
import { v4 as uuid } from 'uuid';

/**
 * In-memory implementation of PeladaRepository for testing purposes.
 */
export class FakePeladaRepository implements PeladaRepository {
  private peladas: Map<string, PeladaRecord> = new Map();

  async clone(id: string, newDate: Date): Promise<PeladaRecord> {
    const original = this.peladas.get(id);
    if (!original) throw new Error('Pelada not found');

    const clone: PeladaRecord = {
      ...original,
      id: uuid(),
      date: newDate,
      created_at: new Date(),
    };
    this.peladas.set(clone.id, clone);
    return clone;
  }

  async create(profileId: string, pelada: CreatePeladaInput): Promise<PeladaRecord> {
    const now = new Date();
    const record: PeladaRecord = {
      id: uuid(),
      profile_id: profileId,
      date: pelada.date,
      time: pelada.time ?? null,
      location: pelada.location ?? null,
      players_per_team: pelada.players_per_team,
      max_goalkeepers: pelada.max_goalkeepers,
      cost_per_player: pelada.cost_per_player,
      goalkeeper_pays: pelada.goalkeeper_pays,
      created_at: now,
    };
    this.peladas.set(record.id, record);
    return record;
  }

  async delete(id: string): Promise<boolean> {
    const exists = this.peladas.has(id);
    this.peladas.delete(id);
    return exists;
  }

  async findById(id: string): Promise<PeladaRecord | null> {
    return this.peladas.get(id) ?? null;
  }

  async listByProfileId(profileId: string): Promise<PeladaRecord[]> {
    return Array.from(this.peladas.values())
      .filter((p) => p.profile_id === profileId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async update(id: string, data: UpdatePeladaInput): Promise<PeladaRecord | null> {
    const pelada = this.peladas.get(id);
    if (!pelada) return null;

    const updated: PeladaRecord = {
      ...pelada,
      date: data.date ?? pelada.date,
      time: data.time ?? pelada.time,
      location: data.location ?? pelada.location,
      players_per_team: data.players_per_team ?? pelada.players_per_team,
      max_goalkeepers: data.max_goalkeepers ?? pelada.max_goalkeepers,
      cost_per_player: data.cost_per_player ?? pelada.cost_per_player,
      goalkeeper_pays: data.goalkeeper_pays ?? pelada.goalkeeper_pays,
    };
    this.peladas.set(id, updated);
    return updated;
  }
}
