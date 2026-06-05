import {
  FinancialRecordRepository,
  FinancialRecordRecord,
  CreateFinancialRecordInput,
  UpdateFinancialRecordInput,
} from '@ports/repositories/FinancialRecordRepository';
import { v4 as uuid } from 'uuid';

/**
 * In-memory implementation of FinancialRecordRepository for testing purposes.
 */
export class FakeFinancialRecordRepository implements FinancialRecordRepository {
  private records: Map<string, FinancialRecordRecord> = new Map();

  async create(profileId: string, record: CreateFinancialRecordInput): Promise<FinancialRecordRecord> {
    const now = new Date();
    const newRecord: FinancialRecordRecord = {
      id: uuid(),
      profile_id: profileId,
      date: record.date,
      description: record.description,
      value: record.value,
      type: record.type,
      created_at: now,
    };
    this.records.set(newRecord.id, newRecord);
    return newRecord;
  }

  async delete(id: string): Promise<boolean> {
    const exists = this.records.has(id);
    this.records.delete(id);
    return exists;
  }

  async findById(id: string): Promise<FinancialRecordRecord | null> {
    return this.records.get(id) ?? null;
  }

  async listByProfileId(profileId: string): Promise<FinancialRecordRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.profile_id === profileId);
  }

  async listByProfileIdAndDateRange(
    profileId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialRecordRecord[]> {
    return Array.from(this.records.values()).filter(
      (r) => r.profile_id === profileId && r.date >= startDate && r.date <= endDate
    );
  }

  async update(
    id: string,
    data: UpdateFinancialRecordInput
  ): Promise<FinancialRecordRecord | null> {
    const record = this.records.get(id);
    if (!record) return null;

    const updated: FinancialRecordRecord = {
      ...record,
      date: data.date ?? record.date,
      description: data.description ?? record.description,
      value: data.value ?? record.value,
      type: data.type ?? record.type,
    };
    this.records.set(id, updated);
    return updated;
  }
}
