/**
 * Port (interface) for Player repository operations.
 * Players are soft-deleted via status = 'inactive' (ADR-6).
 */

export interface PlayerRepository {
  /**
   * Create a new player in a profile.
   */
  create(profileId: string, player: CreatePlayerInput): Promise<PlayerRecord>;

  /**
   * Find a player by id.
   */
  findById(id: string): Promise<PlayerRecord | null>;

  /**
   * List all ACTIVE players in a profile (excludes inactive).
   */
  listActiveByProfileId(profileId: string): Promise<PlayerRecord[]>;

  /**
   * List ALL players in a profile (active and inactive).
   */
  listAllByProfileId(profileId: string): Promise<PlayerRecord[]>;

  /**
   * Reactivate an inactive player (status = 'active').
   */
  reactivate(id: string): Promise<boolean>;

  /**
   * Inactivate a player (soft delete: status = 'inactive').
   * @returns true if inactivated, false if not found
   */
  inactivate(id: string): Promise<boolean>;

  /**
   * Find players by profile and name (case-insensitive).
   * Used for roster search. Returns active players only.
   */
  searchByNameInProfile(profileId: string, query: string): Promise<PlayerRecord[]>;

  /**
   * Update a player. Name, stars, position, speed, default_type, inviter.
   * @returns updated player or null if not found
   */
  update(id: string, data: UpdatePlayerInput): Promise<PlayerRecord | null>;
}

/** Field position. `goalkeeper` also marks goalkeeper behaviour (roster slot + draw). */
export type PlayerPosition = 'goalkeeper' | 'defense' | 'midfield' | 'attack';

export interface CreatePlayerInput {
  name: string;
  nickname?: string | null;
  phone?: string | null;
  stars: number;
  position: PlayerPosition;
  speed: 'slow' | 'medium' | 'fast';
  invited_by_id?: string | null;
}

export interface UpdatePlayerInput {
  name?: string;
  nickname?: string | null;
  phone?: string | null;
  stars?: number;
  position?: PlayerPosition;
  speed?: 'slow' | 'medium' | 'fast';
  invited_by_id?: string | null;
}

export interface PlayerRecord {
  id: string;
  profile_id: string;
  name: string;
  nickname: string | null;
  phone: string | null;
  stars: number;
  position: PlayerPosition;
  speed: 'slow' | 'medium' | 'fast';
  invited_by_id: string | null;
  status: 'active' | 'inactive';
  created_at: Date;
}
