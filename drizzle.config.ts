import { defineConfig } from 'drizzle-kit'

const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./data/elfifa.db'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
  },
})
