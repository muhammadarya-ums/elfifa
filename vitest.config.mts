import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname),
      // Modul penanda Next.js — tidak relevan di lingkungan test
      'server-only': path.resolve(import.meta.dirname, 'tests/stubs/empty.ts'),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    pool: 'forks',
    fileParallelism: false,
  },
})
