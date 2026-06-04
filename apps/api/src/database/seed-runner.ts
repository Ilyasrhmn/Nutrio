/**
 * seed-runner.ts — Windows-compatible seed runner
 *
 * Bypass typeorm-extension CLI (bash script, tidak jalan di Windows via ts-node).
 * Jalankan via: pnpm db:seed
 */
import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';

// Import semua seeders secara eksplisit
import RoleSeed from './seeds/role.seed';
import PermissionSeed from './seeds/permission.seed';
import RolePermissionSeed from './seeds/role-permission.seed';
import MenuSeed from './seeds/menu.seed';
import RoleMenuSeed from './seeds/role-menu.seed';
import UserSeed from './seeds/user.seed';
import DemoScenarioSeed from './seeds/demo-scenario.seed';

// Urutan penting — FK dependencies
const SEEDERS = [
  RoleSeed,
  PermissionSeed,
  RolePermissionSeed,
  MenuSeed,
  RoleMenuSeed,
  UserSeed,
  DemoScenarioSeed,
];

async function main() {
  console.log('🌱 Initializing DataSource...');
  await AppDataSource.initialize();
  console.log('✅ DataSource initialized\n');

  for (const SeederClass of SEEDERS) {
    const seeder = new SeederClass();
    const name = SeederClass.name;
    console.log(`▶  Running ${name}...`);
    try {
      await seeder.run(AppDataSource);
      console.log(`✅ ${name} done\n`);
    } catch (err) {
      console.error(`❌ ${name} failed:`, err);
      throw err;
    }
  }

  await AppDataSource.destroy();
  console.log('🎉 All seeds completed!');
}

main().catch((err) => {
  console.error('Seed runner failed:', err);
  process.exit(1);
});
