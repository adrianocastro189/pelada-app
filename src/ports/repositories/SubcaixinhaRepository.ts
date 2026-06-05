export interface SubcaixinhaRepository {
  adjustBalance(id: string, delta: number): Promise<SubcaixinhaRecord | null>;
  create(profileId: string, subcaixinha: CreateSubcaixinhaInput): Promise<SubcaixinhaRecord>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<SubcaixinhaRecord | null>;
  listByProfileId(profileId: string): Promise<SubcaixinhaRecord[]>;
  update(id: string, data: UpdateSubcaixinhaInput): Promise<SubcaixinhaRecord | null>;
}

export interface CreateSubcaixinhaInput {
  name: string;
  goal?: number | null;
  current_value?: number;
}

export interface UpdateSubcaixinhaInput {
  name?: string;
  goal?: number | null;
  current_value?: number;
}

export interface SubcaixinhaRecord {
  id: string;
  profile_id: string;
  name: string;
  goal: number | null;
  current_value: number;
  created_at: Date;
}
