import { DrawAssignmentRepository, DrawAssignmentRecord } from '@ports/repositories/DrawAssignmentRepository';
import { v4 as uuid } from 'uuid';

export class FakeDrawAssignmentRepository implements DrawAssignmentRepository {
  private assignments: Map<string, DrawAssignmentRecord> = new Map();

  async assign(
    peladaId: string,
    peladaTeamId: string,
    playerId: string
  ): Promise<DrawAssignmentRecord> {
    const record: DrawAssignmentRecord = {
      id: uuid(),
      pelada_id: peladaId,
      pelada_team_id: peladaTeamId,
      player_id: playerId,
      created_at: new Date(),
    };
    this.assignments.set(record.id, record);
    return record;
  }

  async clearByPeladaId(peladaId: string): Promise<number> {
    const before = this.assignments.size;
    Array.from(this.assignments.entries())
      .filter(([, a]) => a.pelada_id === peladaId)
      .forEach(([id]) => this.assignments.delete(id));
    return before - this.assignments.size;
  }

  async findPlayerTeamInPelada(peladaId: string, playerId: string): Promise<DrawAssignmentRecord | null> {
    const entry = Array.from(this.assignments.values()).find(
      (a) => a.pelada_id === peladaId && a.player_id === playerId
    );
    return entry ?? null;
  }

  async listByPeladaId(peladaId: string): Promise<DrawAssignmentRecord[]> {
    return Array.from(this.assignments.values()).filter((a) => a.pelada_id === peladaId);
  }

  async replaceDrawForPelada(
    peladaId: string,
    assignments: Array<{ peladaTeamId: string; playerId: string }>
  ): Promise<void> {
    await this.clearByPeladaId(peladaId);
    for (const assignment of assignments) {
      await this.assign(peladaId, assignment.peladaTeamId, assignment.playerId);
    }
  }
}
