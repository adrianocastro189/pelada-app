export interface PeladaTeamRepository {
  create(peladaId: string, name: string, sort_order?: number): Promise<PeladaTeamRecord>;
  delete(id: string): Promise<boolean>;
  deleteAllByPeladaId(peladaId: string): Promise<number>;
  findById(id: string): Promise<PeladaTeamRecord | null>;
  listByPeladaId(peladaId: string): Promise<PeladaTeamRecord[]>;
  update(id: string, name: string): Promise<PeladaTeamRecord | null>;
}

export interface PeladaTeamRecord {
  id: string;
  pelada_id: string;
  name: string;
  sort_order: number;
  created_at: Date;
}
