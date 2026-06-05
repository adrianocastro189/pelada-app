import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
      '@application': fileURLToPath(new URL('./src/application', import.meta.url)),
      '@ports': fileURLToPath(new URL('./src/ports', import.meta.url)),
      '@infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.integration.test.ts'],
    testTimeout: 30000,
    passWithNoTests: true,
    // Integration tests share a single Docker Postgres instance — run files
    // sequentially to avoid concurrent DDL race conditions (e.g. two files both
    // running CREATE TABLE IF NOT EXISTS on the same connection can still clash
    // in pg_type under parallel execution).
    fileParallelism: false,
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://pelada:pelada_test@localhost:5432/pelada_test',
    },
  },
})
