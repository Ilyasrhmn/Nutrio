import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load .env file
config({ path: path.resolve(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://vendortrack_admin:REPLACE_IN_ENV@localhost:5432/vendortrack',
  synchronize: false, // Must be false for safe migrations
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  subscribers: [],
});
