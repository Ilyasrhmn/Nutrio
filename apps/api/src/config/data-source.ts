import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load .env file
config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL environment variable is not set!\n' +
    '   Please create apps/api/.env with DATABASE_URL="postgresql://user:pass@host:5432/dbname"'
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
