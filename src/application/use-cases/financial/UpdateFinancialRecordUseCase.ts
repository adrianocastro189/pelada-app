import {
  FinancialRecordRepository,
  UpdateFinancialRecordInput,
  FinancialRecordRecord,
} from '@ports/repositories/FinancialRecordRepository';

/**
 * Updates a financial record.
 */
export class UpdateFinancialRecordUseCase {
  constructor(private readonly repo: FinancialRecordRepository) {}

  async execute(id: string, data: UpdateFinancialRecordInput): Promise<FinancialRecordRecord> {
    if (data.value !== undefined && data.value <= 0) {
      throw new Error('Value must be positive');
    }

    const record = await this.repo.update(id, data);
    if (!record) {
      throw new Error('Financial record not found');
    }

    return record;
  }
}
