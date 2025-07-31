import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

export default defineConfig({
  schema: './apps/backend/src/db/schema.ts',
  out: './apps/backend/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/fullstack_db',
  },
  verbose: true,
  strict: true,
});
