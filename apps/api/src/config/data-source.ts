import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Try multiple paths so dotenv works in local dev (dist/config → ../../.env)
// AND in Vercel serverless (/var/task/.env, included via vercel.json includeFiles).
if (!process.env.DATABASE_URL) {
  const candidates = [
    path.resolve(__dirname, '../../.env'),   // local: compiled dist/config/
    path.resolve(process.cwd(), '.env'),      // Vercel: /var/task/.env
    path.resolve(process.cwd(), 'apps/api/.env'), // monorepo root fallback
  ];
  for (const p of candidates) {
    const result = config({ path: p });
    if (!result.error && process.env.DATABASE_URL) break;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL is not set. Set it in Vercel environment variables or apps/api/.env',
  );
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // Must be false for safe migrations
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  subscribers: [],
});
