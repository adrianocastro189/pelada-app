export interface FinancialRecordRepository {
  create(profileId: string, record: CreateFinancialRecordInput): Promise<FinancialRecordRecord>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<FinancialRecordRecord | null>;
  listByProfileId(profileId: string): Promise<FinancialRecordRecord[]>;
  listByProfileIdAndDateRange(profileId: string, startDate: Date, endDate: Date): Promise<FinancialRecordRecord[]>;
  update(id: string, data: UpdateFinancialRecordInput): Promise<FinancialRecordRecord | null>;
}

export interface CreateFinancialRecordInput {
  date: Date;
  description: string;
  value: number;
  type: 'credit' | 'debit';
}

export interface UpdateFinancialRecordInput {
  date?: Date;
  description?: string;
  value?: number;
  type?: 'credit' | 'debit';
}

export interface FinancialRecordRecord {
  id: string;
  profile_id: string;
  date: Date;
  description: string;
  value: number;
  type: 'credit' | 'debit';
  created_at: Date;
}
