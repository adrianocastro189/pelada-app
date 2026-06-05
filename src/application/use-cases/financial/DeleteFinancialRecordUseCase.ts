import { FinancialRecordRepository } from '@ports/repositories/FinancialRecordRepository';

/**
 * Deletes a financial record.
 */
export class DeleteFinancialRecordUseCase {
  constructor(private readonly repo: FinancialRecordRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new Error('Financial record not found');
    }
  }
}
