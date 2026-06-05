export interface PeladaPlayerRepository {
  addToRoster(peladaId: string, playerId: string, slot_type: 'goalkeeper' | 'line'): Promise<PeladaPlayerRecord>;
  findByPeladaAndPlayer(peladaId: string, playerId: string): Promise<PeladaPlayerRecord | null>;
  listByPeladaId(peladaId: string): Promise<PeladaPlayerRecord[]>;
  removeFromRoster(peladaId: string, playerId: string): Promise<boolean>;
  setPaid(peladaId: string, playerId: string, paid: boolean): Promise<PeladaPlayerRecord | null>;
}

export interface PeladaPlayerRecord {
  id: string;
  pelada_id: string;
  player_id: string;
  slot_type: 'goalkeeper' | 'line';
  paid: boolean;
  created_at: Date;
}
