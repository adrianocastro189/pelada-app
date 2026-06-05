import { FinancialRecordRepository } from '@ports/repositories/FinancialRecordRepository';

/**
 * Returns description suggestions for a profile (case-insensitive, max 10).
 */
export class GetDescriptionSuggestionsUseCase {
  constructor(private readonly repo: FinancialRecordRepository) {}

  async execute(profileId: string, query: string): Promise<string[]> {
    const records = await this.repo.listByProfileId(profileId);
    const lowerQuery = query.toLowerCase();

    const matches = new Set<string>();
    for (const record of records) {
      if (record.description.toLowerCase().includes(lowerQuery)) {
        matches.add(record.description);
      }
    }

    return Array.from(matches).sort().slice(0, 10);
  }
}
