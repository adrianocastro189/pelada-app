import {
  PlayerRepository,
  PlayerRecord,
  CreatePlayerInput,
  UpdatePlayerInput,
} from '@ports/repositories/PlayerRepository';
import { v4 as uuid } from 'uuid';

/**
 * In-memory implementation of PlayerRepository for testing purposes.
 */
export class FakePlayerRepository implements PlayerRepository {
  private players: Map<string, PlayerRecord> = new Map();

  async create(profileId: string, player: CreatePlayerInput): Promise<PlayerRecord> {
    const now = new Date();
    const record: PlayerRecord = {
      id: uuid(),
      profile_id: profileId,
      name: player.name,
      nickname: player.nickname ?? null,
      phone: player.phone ?? null,
      stars: player.stars,
      position: player.position,
      speed: player.speed,
      invited_by_id: player.invited_by_id ?? null,
      status: 'active',
      created_at: now,
    };
    this.players.set(record.id, record);
    return record;
  }

  async findById(id: string): Promise<PlayerRecord | null> {
    return this.players.get(id) ?? null;
  }

  async inactivate(id: string): Promise<boolean> {
    const player = this.players.get(id);
    if (!player) return false;

    const updated = { ...player, status: 'inactive' as const };
    this.players.set(id, updated);
    return true;
  }

  async listActiveByProfileId(profileId: string): Promise<PlayerRecord[]> {
    return Array.from(this.players.values()).filter(
      (p) => p.profile_id === profileId && p.status === 'active'
    );
  }

  async listAllByProfileId(profileId: string): Promise<PlayerRecord[]> {
    return Array.from(this.players.values()).filter((p) => p.profile_id === profileId);
  }

  async reactivate(id: string): Promise<boolean> {
    const player = this.players.get(id);
    if (!player) return false;

    const updated = { ...player, status: 'active' as const };
    this.players.set(id, updated);
    return true;
  }

  async searchByNameInProfile(profileId: string, query: string): Promise<PlayerRecord[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.players.values()).filter(
      (p) =>
        p.profile_id === profileId &&
        p.status === 'active' &&
        (p.name.toLowerCase().includes(lowerQuery) || (p.nickname?.toLowerCase().includes(lowerQuery) ?? false))
    );
  }

  async update(id: string, data: UpdatePlayerInput): Promise<PlayerRecord | null> {
    const player = this.players.get(id);
    if (!player) return null;

    const updated: PlayerRecord = {
      ...player,
      name: data.name ?? player.name,
      nickname: data.nickname ?? player.nickname,
      phone: data.phone ?? player.phone,
      stars: data.stars ?? player.stars,
      position: data.position ?? player.position,
      speed: data.speed ?? player.speed,
      invited_by_id: data.invited_by_id ?? player.invited_by_id,
    };
    this.players.set(id, updated);
    return updated;
  }
}
