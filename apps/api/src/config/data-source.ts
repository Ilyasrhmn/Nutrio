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
  synchronize: false,
  logging: false, // reduce noise in serverless logs
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  subscribers: [],
  extra: {
    // Serverless-friendly: single connection, short timeout, no idle keepalive
    max: 1,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 0,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }, // Neon DB requires SSL; bypass cert validation
  },
});
