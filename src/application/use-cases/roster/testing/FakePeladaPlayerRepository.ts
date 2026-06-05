import {
  PeladaPlayerRepository,
  PeladaPlayerRecord,
} from '@ports/repositories/PeladaPlayerRepository';
import { v4 as uuid } from 'uuid';

/**
 * In-memory implementation of PeladaPlayerRepository for testing purposes.
 */
export class FakePeladaPlayerRepository implements PeladaPlayerRepository {
  private entries: Map<string, PeladaPlayerRecord> = new Map();

  async addToRoster(
    peladaId: string,
    playerId: string,
    slot_type: 'goalkeeper' | 'line'
  ): Promise<PeladaPlayerRecord> {
    const id = uuid();
    const record: PeladaPlayerRecord = {
      id,
      pelada_id: peladaId,
      player_id: playerId,
      slot_type,
      paid: false,
      created_at: new Date(),
    };
    this.entries.set(id, record);
    return record;
  }

  async findByPeladaAndPlayer(peladaId: string, playerId: string): Promise<PeladaPlayerRecord | null> {
    const entry = Array.from(this.entries.values()).find(
      (e) => e.pelada_id === peladaId && e.player_id === playerId
    );
    return entry ?? null;
  }

  async listByPeladaId(peladaId: string): Promise<PeladaPlayerRecord[]> {
    return Array.from(this.entries.values()).filter((e) => e.pelada_id === peladaId);
  }

  async removeFromRoster(peladaId: string, playerId: string): Promise<boolean> {
    const entry = Array.from(this.entries.entries()).find(
      ([, e]) => e.pelada_id === peladaId && e.player_id === playerId
    );
    if (!entry) return false;
    this.entries.delete(entry[0]);
    return true;
  }

  async setPaid(peladaId: string, playerId: string, paid: boolean): Promise<PeladaPlayerRecord | null> {
    const entry = Array.from(this.entries.entries()).find(
      ([, e]) => e.pelada_id === peladaId && e.player_id === playerId
    );
    if (!entry) return null;

    const [id, record] = entry;
    const updated = { ...record, paid };
    this.entries.set(id, updated);
    return updated;
  }
}
