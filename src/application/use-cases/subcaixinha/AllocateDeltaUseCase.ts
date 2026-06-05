import { SubcaixinhaRepository } from '@ports/repositories/SubcaixinhaRepository';
import { FinancialRecordRepository } from '@ports/repositories/FinancialRecordRepository';
import { BalanceCalculator, FinancialEntry } from '@domain/services/BalanceCalculator';
import { SubcaixinhaBalancer } from '@domain/services/SubcaixinhaBalancer';

export interface AllocationInput {
  subcaixinhaId: string;
  amount: number;
}

/**
 * Allocates the delta (cash-box balance minus subcaixinhas total) between subcaixinhas.
 */
export class AllocateDeltaUseCase {
  constructor(
    private readonly subcaixinhaRepo: SubcaixinhaRepository,
    private readonly financialRepo: FinancialRecordRepository,
    private readonly balanceCalc: BalanceCalculator,
    private readonly balancer: SubcaixinhaBalancer
  ) {}

  async execute(profileId: string, allocations: AllocationInput[]): Promise<void> {
    // Get cash-box balance
    const financialRecords = await this.financialRepo.listByProfileId(profileId);
    const entries: FinancialEntry[] = financialRecords.map((r) => ({
      date: r.date,
      value: r.value,
      type: r.type,
    }));
    const cashBoxBalance = this.balanceCalc.calculateGeneralBalance(entries);

    // Get subcaixinhas total
    const subcaixinhas = await this.subcaixinhaRepo.listByProfileId(profileId);
    const subcaixinhaTotal = subcaixinhas.reduce((sum, s) => sum + s.current_value, 0);

    // Calculate delta
    const delta = this.balancer.calculateDelta(cashBoxBalance, subcaixinhaTotal);

    // Verify allocations sum to delta
    const allocationSum = allocations.reduce((sum, a) => sum + a.amount, 0);
    if (allocationSum !== delta) {
      throw new Error('Total allocation must equal delta');
    }

    // Apply allocations
    for (const allocation of allocations) {
      const updated = await this.subcaixinhaRepo.adjustBalance(
        allocation.subcaixinhaId,
        allocation.amount
      );
      if (!updated) {
        throw new Error(`Subcaixinha not found: ${allocation.subcaixinhaId}`);
      }
    }
  }
}
