export interface DrawAssignmentRepository {
  assign(peladaId: string, peladaTeamId: string, playerId: string): Promise<DrawAssignmentRecord>;
  clearByPeladaId(peladaId: string): Promise<number>;
  findPlayerTeamInPelada(peladaId: string, playerId: string): Promise<DrawAssignmentRecord | null>;
  listByPeladaId(peladaId: string): Promise<DrawAssignmentRecord[]>;
  replaceDrawForPelada(peladaId: string, assignments: Array<{ peladaTeamId: string; playerId: string }>): Promise<void>;
}

export interface DrawAssignmentRecord {
  id: string;
  pelada_id: string;
  pelada_team_id: string;
  player_id: string;
  created_at: Date;
}
