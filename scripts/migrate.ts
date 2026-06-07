import { PgSqlExecutor } from '../src/infrastructure/db/PgSqlExecutor.ts'
import { MigrationRunner } from '../src/infrastructure/db/MigrationRunner.ts'
import { ALL_MIGRATIONS } from '../src/infrastructure/db/migrations/index.ts'

const url = process.env.DATABASE_URL

if (!url) {
  console.error('Error: DATABASE_URL environment variable is required')
  console.error('Usage: DATABASE_URL=postgresql://... npm run migration:up')
  process.exit(1)
}

const executor = new PgSqlExecutor(url)

try {
  await new MigrationRunner(executor).migrate(ALL_MIGRATIONS)
  console.log('Migrations applied successfully')
} finally {
  await executor.dispose()
}
