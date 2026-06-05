import {
  FinancialRecordRepository,
  CreateFinancialRecordInput,
  FinancialRecordRecord,
} from '@ports/repositories/FinancialRecordRepository';

/**
 * Creates a new financial record.
 */
export class CreateFinancialRecordUseCase {
  constructor(private readonly repo: FinancialRecordRepository) {}

  async execute(profileId: string, input: CreateFinancialRecordInput): Promise<FinancialRecordRecord> {
    if (input.value <= 0) {
      throw new Error('Value must be positive');
    }

    return this.repo.create(profileId, input);
  }
}
