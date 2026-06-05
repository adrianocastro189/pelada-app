import { SubcaixinhaRepository } from '@ports/repositories/SubcaixinhaRepository';

/**
 * Deletes a subcaixinha (only if current_value == 0).
 */
export class DeleteSubcaixinhaUseCase {
  constructor(private readonly repo: SubcaixinhaRepository) {}

  async execute(id: string): Promise<void> {
    const subcaixinha = await this.repo.findById(id);
    if (!subcaixinha) {
      throw new Error('Subcaixinha not found');
    }

    if (subcaixinha.current_value !== 0) {
      throw new Error('Cannot delete a subcaixinha with non-zero balance');
    }

    await this.repo.delete(id);
  }
}
