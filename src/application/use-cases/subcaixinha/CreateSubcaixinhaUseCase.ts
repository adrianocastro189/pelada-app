import {
  SubcaixinhaRepository,
  CreateSubcaixinhaInput,
  SubcaixinhaRecord,
} from '@ports/repositories/SubcaixinhaRepository';

/**
 * Creates a new subcaixinha.
 */
export class CreateSubcaixinhaUseCase {
  constructor(private readonly repo: SubcaixinhaRepository) {}

  async execute(profileId: string, input: CreateSubcaixinhaInput): Promise<SubcaixinhaRecord> {
    if (input.goal !== undefined && input.goal !== null && input.goal <= 0) {
      throw new Error('Goal must be positive');
    }

    return this.repo.create(profileId, input);
  }
}
