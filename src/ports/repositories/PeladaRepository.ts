/**
 * Port (interface) for Pelada repository operations.
 * A Pelada is a single football match event.
 */

export interface PeladaRepository {
  /**
   * Create a new pelada.
   */
  create(profileId: string, pelada: CreatePeladaInput): Promise<PeladaRecord>;

  /**
   * Clone a pelada with a new date.
   */
  clone(id: string, newDate: Date): Promise<PeladaRecord>;

  /**
   * Delete a pelada (hard delete, cascades per ADR-6).
   */
  delete(id: string): Promise<boolean>;

  /**
   * Find pelada by id.
   */
  findById(id: string): Promise<PeladaRecord | null>;

  /**
   * List all peladas in a profile, ordered by date DESC.
   */
  listByProfileId(profileId: string): Promise<PeladaRecord[]>;

  /**
   * Update a pelada.
   */
  update(id: string, data: UpdatePeladaInput): Promise<PeladaRecord | null>;
}

export interface CreatePeladaInput {
  date: Date;
  time?: string | null;
  location?: string | null;
  players_per_team: number;
  max_goalkeepers: number;
  cost_per_player: number;
  goalkeeper_pays: boolean;
}

export interface UpdatePeladaInput {
  date?: Date;
  time?: string | null;
  location?: string | null;
  players_per_team?: number;
  max_goalkeepers?: number;
  cost_per_player?: number;
  goalkeeper_pays?: boolean;
}

export interface PeladaRecord {
  id: string;
  profile_id: string;
  date: Date;
  time: string | null;
  location: string | null;
  players_per_team: number;
  max_goalkeepers: number;
  cost_per_player: number;
  goalkeeper_pays: boolean;
  created_at: Date;
}
