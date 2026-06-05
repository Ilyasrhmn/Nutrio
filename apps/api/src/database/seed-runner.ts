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
import VendorLifecycleSeed from './seeds/vendor-lifecycle.seed';
import DailyOpsSeed from './seeds/daily-ops.seed';
import MarketplaceSupplierSeed from './seeds/marketplace-supplier.seed';
import ComplianceSeed from './seeds/compliance.seed';

// Urutan penting — FK dependencies:
// 1. Access control (roles, permissions, menus)
// 2. Users (semua role)
// 3. DemoScenario — vendor1 record + SPPG location + supplier record
// 4. VendorLifecycle — enrich vendor1, vendor2 + SOP template + vendor3-5
// 5. DailyOps — score history, checkpoints, tokens, confirmations, debriefs
// 6. MarketplaceSupplier — products, POs, marketplace listing
// 7. Compliance — inspection, citizen reports, QR codes, alerts, notifications
const SEEDERS = [
  RoleSeed,
  PermissionSeed,
  RolePermissionSeed,
  MenuSeed,
  RoleMenuSeed,
  UserSeed,
  DemoScenarioSeed,
  VendorLifecycleSeed,
  DailyOpsSeed,
  MarketplaceSupplierSeed,
  ComplianceSeed,
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
