import { FinancialRecordRepository } from '@ports/repositories/FinancialRecordRepository';
import { BalanceCalculator, FinancialEntry } from '@domain/services/BalanceCalculator';

export interface BalancesResult {
  general: number;
  month: number;
  previousMonth: number;
}

/**
 * Calculates financial balances: general, current month, and previous month.
 */
export class GetBalancesUseCase {
  constructor(
    private readonly repo: FinancialRecordRepository,
    private readonly calculator: BalanceCalculator
  ) {}

  async execute(profileId: string, year: number, month: number): Promise<BalancesResult> {
    const records = await this.repo.listByProfileId(profileId);

    const entries: FinancialEntry[] = records.map((r) => ({
      date: r.date,
      value: r.value,
      type: r.type,
    }));

    const general = this.calculator.calculateGeneralBalance(entries);
    const currentMonth = this.calculator.calculateMonthBalance(entries, year, month);

    // Previous month calculation: handle year boundary
    const previousMonth =
      month === 0
        ? this.calculator.calculateMonthBalance(entries, year - 1, 11)
        : this.calculator.calculateMonthBalance(entries, year, month - 1);

    return {
      general,
      month: currentMonth,
      previousMonth,
    };
  }
}
