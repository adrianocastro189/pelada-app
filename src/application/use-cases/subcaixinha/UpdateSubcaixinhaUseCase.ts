import {
  SubcaixinhaRepository,
  UpdateSubcaixinhaInput,
  SubcaixinhaRecord,
} from '@ports/repositories/SubcaixinhaRepository';

/**
 * Updates a subcaixinha.
 */
export class UpdateSubcaixinhaUseCase {
  constructor(private readonly repo: SubcaixinhaRepository) {}

  async execute(id: string, data: UpdateSubcaixinhaInput): Promise<SubcaixinhaRecord> {
    if (data.goal !== undefined && data.goal !== null && data.goal <= 0) {
      throw new Error('Goal must be positive');
    }

    const subcaixinha = await this.repo.update(id, data);
    if (!subcaixinha) {
      throw new Error('Subcaixinha not found');
    }

    return subcaixinha;
  }
}
