import { FinancialRecordRepository, FinancialRecordRecord } from '@ports/repositories/FinancialRecordRepository';

/**
 * Lists all financial records for a profile.
 */
export class ListFinancialRecordsUseCase {
  constructor(private readonly repo: FinancialRecordRepository) {}

  async execute(profileId: string): Promise<FinancialRecordRecord[]> {
    return this.repo.listByProfileId(profileId);
  }
}
