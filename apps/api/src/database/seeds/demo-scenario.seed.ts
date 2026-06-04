import { DataSource } from 'typeorm';

/**
 * Demo scenario: creates a fully operational ACTIVE vendor with 7-day history,
 * team members, SPPG location, and BGN alerts.
 * All inserts are idempotent (ON CONFLICT DO NOTHING or pre-check).
 */
export default class DemoScenarioSeed {
  async run(dataSource: DataSource): Promise<void> {
    const runner = dataSource.createQueryRunner();
    await runner.connect();

    try {
      // 1. Find the primary demo vendor user
      const vendorUser = await runner.manager.findOneBy('users', { email: 'vendor@sppg.go.id' });
      if (!vendorUser) {
        console.warn('⚠️  vendor@sppg.go.id not found — run user.seed.ts first');
        return;
      }

      // 2. Get or update vendor record → ACTIVE + proper address
      let [vendor] = await runner.query(
        `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`,
        [(vendorUser as any).id],
      );

      if (!vendor) {
        console.warn('⚠️  Vendor record not found for vendor@sppg.go.id');
        return;
      }

      await runner.query(
        `UPDATE vendors
         SET lifecycle_status = 'ACTIVE',
             business_name     = 'SPPG Nusantara Sehat Jakarta',
             owner_name        = 'Budi Santoso',
             address_street    = 'Jl. Merdeka No. 12',
             address_city      = 'Jakarta Pusat',
             address_province  = 'DKI Jakarta'
         WHERE id = $1`,
        [vendor.id],
      );
      console.log(`✅ Vendor ${vendor.id} updated to ACTIVE`);

      // 3. Create SPPG location
      const [existingSppg] = await runner.query(
        `SELECT id FROM sppg_locations WHERE vendor_id = $1 LIMIT 1`,
        [vendor.id],
      );
      let sppgId: string;
      if (existingSppg) {
        sppgId = existingSppg.id;
        await runner.query(
          `UPDATE sppg_locations SET is_active = true, target_porsi = 300,
           assigned_schools = $2 WHERE id = $1`,
          [sppgId, JSON.stringify(['SDN 01 Jakarta Pusat', 'SDN 02 Jakarta Pusat', 'SDN 03 Jakarta Pusat'])],
        );
      } else {
        const [newSppg] = await runner.query(
          `INSERT INTO sppg_locations
             (vendor_id, name, address_street, address_city, target_porsi, assigned_schools, is_active)
           VALUES ($1, 'SPPG Nusantara Jakarta', 'Jl. Merdeka No. 12', 'Jakarta Pusat', 300,
             $2::jsonb, true)
           RETURNING id`,
          [vendor.id, JSON.stringify(['SDN 01 Jakarta Pusat', 'SDN 02 Jakarta Pusat', 'SDN 03 Jakarta Pusat'])],
        );
        sppgId = newSppg.id;
      }
      console.log(`✅ SPPG location ready: ${sppgId}`);

      // 4. Team members — find kepala dapur user or use vendor2 as team member
      const vendor2User = await runner.manager.findOneBy('users', { email: 'vendor2@sppg.go.id' });
      if (vendor2User) {
        await runner.query(
          `INSERT INTO vendor_team_members (vendor_id, user_id, role, status)
           VALUES ($1, $2, 'kepala_dapur', 'accepted')
           ON CONFLICT (vendor_id, user_id) DO UPDATE SET status = 'accepted'`,
          [vendor.id, (vendor2User as any).id],
        );
        console.log('✅ Team member (kepala_dapur) linked');
      }

      // 5. Onboarding progress — mark all done
      await runner.query(
        `INSERT INTO onboarding_progress
           (vendor_id, step1_done, step2_done, step3_done, step4_done, completed_at)
         VALUES ($1, true, true, true, true, NOW())
         ON CONFLICT (vendor_id) DO UPDATE
           SET step1_done = true, step2_done = true, step3_done = true,
               step4_done = true, completed_at = NOW()`,
        [vendor.id],
      );

      // 6. 7-day score history (today back to D-6)
      for (let i = 6; i >= 0; i--) {
        const score = 70 + Math.floor(Math.random() * 25); // 70-94
        await runner.query(
          `INSERT INTO daily_score_records
             (vendor_id, score_date, score_current, score_final)
           VALUES ($1, CURRENT_DATE - $2, $3, $3)
           ON CONFLICT (vendor_id, score_date) DO NOTHING`,
          [vendor.id, i, score],
        );
      }
      console.log('✅ 7-day score history created');

      // 7. Score events for today's record
      const [todayRecord] = await runner.query(
        `SELECT id FROM daily_score_records WHERE vendor_id = $1 AND score_date = CURRENT_DATE`,
        [vendor.id],
      );
      if (todayRecord) {
        await runner.query(
          `INSERT INTO score_events (daily_score_record_id, event_type, score_delta, reason, regulation_ref)
           VALUES ($1, 'DELIVERY_LATE', -15, 'Pengiriman terlambat 20 menit', 'Juknis BGN §5.3')
           ON CONFLICT DO NOTHING`,
          [todayRecord.id],
        );
      }

      // 8. BGN Alerts
      const alerts = [
        {
          type: 'citizen_report',
          severity: 'critical',
          title: 'Konfirmasi sekolah: Ada Masalah',
          body: 'SDN 01 Jakarta Pusat melaporkan 5 porsi kurang dari target 100 porsi.',
        },
        {
          type: 'risk_drop',
          severity: 'warning',
          title: 'Skor performa turun signifikan',
          body: 'Skor SPPG Nusantara turun dari 85 ke 68 dalam 2 hari terakhir.',
        },
      ];

      for (const alert of alerts) {
        await runner.query(
          `INSERT INTO alerts (vendor_id, alert_type, severity, title, body)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [vendor.id, alert.type, alert.severity, alert.title, alert.body],
        );
      }
      console.log('✅ BGN alerts created');

      // 9. Vendor2 in PREPARING_DOCS state
      const vendor2 = await runner.manager.findOneBy('users', { email: 'vendor2@sppg.go.id' });
      if (vendor2) {
        await runner.query(
          `UPDATE vendors SET lifecycle_status = 'PREPARING_DOCS',
             address_city = 'Bandung', address_province = 'Jawa Barat'
           WHERE user_id = $1`,
          [(vendor2 as any).id],
        );
        console.log('✅ Vendor2 set to PREPARING_DOCS');
      }

      // 10. Supplier record for onboarding step 4
      const supplierUser = await runner.manager.findOneBy('users', { email: 'supplier@bgn.go.id' });
      if (supplierUser) {
        await runner.query(
          `INSERT INTO suppliers (user_id, business_name, owner_name, supplier_type, phone, is_verified)
           VALUES ($1, 'PT Tani Makmur Sejahtera', 'Agus Widodo', 'vegetable', '+62815-6789-0123', true)
           ON CONFLICT (user_id) DO UPDATE SET is_verified = true`,
          [(supplierUser as any).id],
        );
        console.log('✅ Supplier record ready');
      }

      console.log('\n🎉 Demo scenario seeding complete!');
      console.log('   Login: vendor@sppg.go.id / Vendor123! → ACTIVE vendor');
      console.log('   Login: admin@bgn.go.id / Admin123! → BGN Command Center');
    } finally {
      await runner.release();
    }
  }
}
