import { DataSource } from 'typeorm';

/**
 * Demo scenario: creates foundation data for vendor@sppg.go.id (ACTIVE)
 * and vendor2@sppg.go.id (PREPARING_DOCS).
 * VendorLifecycleSeed enriches these further.
 * All inserts are idempotent.
 */
export default class DemoScenarioSeed {
  async run(dataSource: DataSource): Promise<void> {
    const runner = dataSource.createQueryRunner();
    await runner.connect();

    try {
      // ── 1. Vendor1 record (create if not exists) ─────────────────────────
      const vendorUser = await runner.manager.findOneBy('users', { email: 'vendor@sppg.go.id' });
      if (!vendorUser) {
        console.warn('⚠️  vendor@sppg.go.id not found — run user.seed.ts first');
        return;
      }

      let [vendor] = await runner.query(
        `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`,
        [(vendorUser as any).id],
      );

      if (!vendor) {
        const [newVendor] = await runner.query(
          `INSERT INTO vendors
             (user_id, business_name, owner_name, phone, address_street, address_city, address_province, lifecycle_status, status)
           VALUES ($1, 'SPPG Nusantara Sehat Jakarta', 'Budi Santoso', '+62-812-3456-7890',
             'Jl. Merdeka No. 12', 'Jakarta Pusat', 'DKI Jakarta', 'ACTIVE', 'verified')
           RETURNING id`,
          [(vendorUser as any).id],
        );
        vendor = newVendor;
      }

      await runner.query(
        `UPDATE vendors
         SET lifecycle_status = 'ACTIVE',
             business_name     = 'SPPG Nusantara Sehat Jakarta',
             owner_name        = 'Budi Santoso',
             address_street    = 'Jl. Merdeka No. 12',
             address_city      = 'Jakarta Pusat',
             address_province  = 'DKI Jakarta',
             status            = 'verified'
         WHERE id = $1`,
        [vendor.id],
      );
      console.log(`✅ Vendor1 record ready: ${vendor.id}`);

      // ── 2. SPPG location for vendor1 ─────────────────────────────────────
      const [existingSppg] = await runner.query(
        `SELECT id FROM sppg_locations WHERE vendor_id = $1 LIMIT 1`,
        [vendor.id],
      );
      let sppgId: string;

      if (existingSppg) {
        sppgId = existingSppg.id;
        await runner.query(
          `UPDATE sppg_locations
           SET is_active = true,
               assigned_schools = ARRAY['SDN 01 Jakarta Pusat','SDN 02 Jakarta Pusat','SDN 03 Jakarta Pusat']
           WHERE id = $1`,
          [sppgId],
        );
      } else {
        const [newSppg] = await runner.query(
          `INSERT INTO sppg_locations
             (vendor_id, name, address_street, address_city, address_province, coordinates,
              assigned_schools, is_active)
           VALUES ($1, 'SPPG Nusantara Jakarta', 'Jl. Merdeka No. 12', 'Jakarta Pusat', 'DKI Jakarta',
             ST_GeomFromText('POINT(106.8456 -6.2088)', 4326),
             ARRAY['SDN 01 Jakarta Pusat','SDN 02 Jakarta Pusat','SDN 03 Jakarta Pusat'],
             true)
           RETURNING id`,
          [vendor.id],
        );
        sppgId = newSppg.id;
      }
      console.log(`✅ SPPG location ready: ${sppgId}`);

      // ── 3. Team member ────────────────────────────────────────────────────
      const vendor2User = await runner.manager.findOneBy('users', { email: 'vendor2@sppg.go.id' });
      if (vendor2User) {
        const [existingMember] = await runner.query(
          `SELECT id FROM vendor_team_members WHERE vendor_id = $1 AND user_id = $2 LIMIT 1`,
          [vendor.id, (vendor2User as any).id],
        );
        if (existingMember) {
          await runner.query(
            `UPDATE vendor_team_members SET status = 'accepted' WHERE id = $1`,
            [existingMember.id],
          );
        } else {
          await runner.query(
            `INSERT INTO vendor_team_members (vendor_id, user_id, role, status)
             VALUES ($1, $2, 'kepala_dapur', 'accepted')`,
            [vendor.id, (vendor2User as any).id],
          );
        }
        console.log('✅ Team member (kepala_dapur) linked');
      }

      // ── 4. Onboarding progress ────────────────────────────────────────────
      await runner.query(
        `INSERT INTO onboarding_progress
           (vendor_id, step1_done, step2_done, step3_done, step4_done, step5_done, completed_at)
         VALUES ($1, true, true, true, true, true, NOW())
         ON CONFLICT (vendor_id) DO UPDATE
           SET step1_done = true, step2_done = true, step3_done = true,
               step4_done = true, step5_done = true, completed_at = NOW()`,
        [vendor.id],
      );

      // ── 5. Vendor2 record (create if not exists) ──────────────────────────
      if (vendor2User) {
        const [existingV2] = await runner.query(
          `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`,
          [(vendor2User as any).id],
        );
        if (!existingV2) {
          await runner.query(
            `INSERT INTO vendors
               (user_id, business_name, owner_name, phone, address_street, address_city, address_province, lifecycle_status, status)
             VALUES ($1, 'SPPG Maju Bersama Bandung', 'Siti Rahma Dewi', '+62-812-3456-7891',
               'Jl. Asia Afrika No. 45', 'Bandung', 'Jawa Barat', 'PREPARING_DOCS', 'draft')`,
            [(vendor2User as any).id],
          );
        } else {
          await runner.query(
            `UPDATE vendors SET lifecycle_status = 'PREPARING_DOCS',
               address_city = 'Bandung', address_province = 'Jawa Barat'
             WHERE user_id = $1`,
            [(vendor2User as any).id],
          );
        }
        console.log('✅ Vendor2 record ready (PREPARING_DOCS)');
      }

      // ── 6. Supplier record ────────────────────────────────────────────────
      const supplierUser = await runner.manager.findOneBy('users', { email: 'supplier@bgn.go.id' });
      if (supplierUser) {
        const [existingSupplier] = await runner.query(
          `SELECT id FROM suppliers WHERE user_id = $1 LIMIT 1`,
          [(supplierUser as any).id],
        );
        if (!existingSupplier) {
          await runner.query(
            `INSERT INTO suppliers
               (user_id, business_name, owner_name, supplier_type, phone,
                address_street, address_city, address_province, status, verified_at)
             VALUES ($1, 'PT Tani Makmur Sejahtera', 'Agus Widodo', 'petani', '+62815-6789-0123',
               'Jl. Raya Mauk No. 88', 'Tangerang', 'Banten', 'verified', NOW() - INTERVAL '30 days')`,
            [(supplierUser as any).id],
          );
        } else {
          await runner.query(
            `UPDATE suppliers SET status = 'verified', verified_at = COALESCE(verified_at, NOW() - INTERVAL '30 days')
             WHERE user_id = $1`,
            [(supplierUser as any).id],
          );
        }
        console.log('✅ Supplier record ready');
      }

      console.log('\n🎉 DemoScenarioSeed complete!');
      console.log('   Login: vendor@sppg.go.id / Vendor123! → ACTIVE vendor');
      console.log('   Login: admin@bgn.go.id / Admin123!   → BGN Command Center');
    } finally {
      await runner.release();
    }
  }
}
