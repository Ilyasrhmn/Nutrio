import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Enriches vendor records and builds the full vendor lifecycle pipeline:
 * - vendor1 (ACTIVE): documents, logo, capacities, SOP template
 * - vendor2 (INSPECTION_SCHEDULED): SPPG location, documents, onboarding, scheduled inspection
 * - vendor3-5 (new users): pipeline stages PREPARING_DOCS / UNDER_REVIEW / ONBOARDING
 */
export default class VendorLifecycleSeed {
  async run(dataSource: DataSource): Promise<void> {
    const runner = dataSource.createQueryRunner();
    await runner.connect();

    try {
      const adminUser = await runner.manager.findOneBy('users', { email: 'admin@bgn.go.id' }) as { id: string } | null;
      const adminId = adminUser?.id ?? null;

      // ── 1. Enrich vendor1 ─────────────────────────────────────────────────
      const v1User = await runner.manager.findOneBy('users', { email: 'vendor@sppg.go.id' }) as { id: string } | null;
      if (!v1User) { console.warn('⚠️  vendor@sppg.go.id not found'); return; }

      const [vendor1] = await runner.query(`SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [v1User.id]);
      if (!vendor1) { console.warn('⚠️  vendor1 record missing — run demo-scenario first'); return; }

      await runner.query(`
        UPDATE vendors SET
          nib                    = '8120003456789',
          npwp                   = '12.345.678.9-012.000',
          daily_capacity_pax     = 500,
          specialization         = ARRAY['nasi_box','lauk_pauk','sayuran'],
          current_risk_score     = 82,
          status                 = 'verified',
          verified_at            = NOW() - INTERVAL '60 days',
          verified_by            = $2,
          training_status        = 'certified',
          training_completed_at  = NOW() - INTERVAL '45 days',
          logo_url               = 'https://storage.nutrio.go.id/logos/sppg-nusantara.png'
        WHERE id = $1
      `, [vendor1.id, adminId]);

      const v1Docs = [
        { type: 'nib',   num: '8120003456789',         key: 'docs/v1/nib.pdf',   hash: 'a1b2c3d4nib000000000000000000000000000000000000', expires: null },
        { type: 'npwp',  num: '12.345.678.9-012.000',  key: 'docs/v1/npwp.pdf',  hash: 'a1b2c3d4npwp00000000000000000000000000000000000', expires: null },
        { type: 'pirt',  num: 'PIRT-3175-2024-001',    key: 'docs/v1/pirt.pdf',  hash: 'a1b2c3d4pirt000000000000000000000000000000000000', expires: `NOW() + INTERVAL '6 months'` },
        { type: 'halal', num: 'ID12020000123456',       key: 'docs/v1/halal.pdf', hash: 'a1b2c3d4halal0000000000000000000000000000000000', expires: `NOW() + INTERVAL '6 months'` },
      ];
      for (const d of v1Docs) {
        await runner.query(`
          INSERT INTO documents
            (vendor_id, doc_type, doc_number, file_url, file_key, file_hash,
             status, issued_at, expires_at, verified_at, verified_by)
          VALUES ($1, $2::document_type, $3, $4, $5, $6, 'verified'::document_status,
            NOW() - INTERVAL '180 days', ${d.expires ?? 'NULL'},
            NOW() - INTERVAL '30 days', $7)
          ON CONFLICT (file_key) DO NOTHING
        `, [vendor1.id, d.type, d.num, `https://storage.nutrio.go.id/${d.key}`, d.key, d.hash, adminId]);
      }
      console.log('✅ Vendor1 enriched');

      // ── 2. SOP Template ───────────────────────────────────────────────────
      const sopName = 'Template SOP SPPG Standar v1.0';
      const [existingSop] = await runner.query(
        `SELECT id FROM sop_templates WHERE name = $1 LIMIT 1`, [sopName],
      );
      let sopTemplateId: string;

      if (existingSop) {
        sopTemplateId = existingSop.id;
      } else {
        const [newSop] = await runner.query(`
          INSERT INTO sop_templates (name, description, version, is_active, created_by)
          VALUES ($1, 'Template pemeriksaan standar SPPG sesuai Juknis BGN 2024', '1.0', true, $2)
          RETURNING id
        `, [sopName, adminId]);
        sopTemplateId = newSop.id;

        type SopItem = { cat: string; text: string; critical: boolean; photo: boolean; ord: number };
        const items: SopItem[] = [
          { cat: 'kebersihan_dapur', text: 'Lantai dapur bersih dan tidak licin',               critical: true,  photo: true,  ord: 1  },
          { cat: 'kebersihan_dapur', text: 'Peralatan masak bersih sebelum digunakan',           critical: true,  photo: true,  ord: 2  },
          { cat: 'kebersihan_dapur', text: 'Tidak ada hama atau serangga di area dapur',         critical: true,  photo: false, ord: 3  },
          { cat: 'kebersihan_dapur', text: 'Tempat sampah tertutup dan tidak meluap',            critical: false, photo: true,  ord: 4  },
          { cat: 'kualitas_bahan',   text: 'Bahan baku segar dan tidak melewati tanggal kadaluarsa', critical: true, photo: true, ord: 5 },
          { cat: 'kualitas_bahan',   text: 'Bahan baku disimpan pada suhu yang tepat',          critical: true,  photo: true,  ord: 6  },
          { cat: 'kualitas_bahan',   text: 'Label asal-usul bahan tersedia dan terbaca',        critical: false, photo: false, ord: 7  },
          { cat: 'kualitas_bahan',   text: 'Tidak ada bahan berbahaya atau terlarang',          critical: true,  photo: false, ord: 8  },
          { cat: 'proses_memasak',   text: 'Suhu memasak sesuai standar minimal 70 derajat Celsius', critical: true, photo: false, ord: 9 },
          { cat: 'proses_memasak',   text: 'Petugas menggunakan APD lengkap',                   critical: true,  photo: true,  ord: 10 },
          { cat: 'proses_memasak',   text: 'Tidak ada kontaminasi silang antar bahan',          critical: true,  photo: false, ord: 11 },
          { cat: 'proses_memasak',   text: 'Porsi sesuai standar yang ditetapkan',              critical: false, photo: true,  ord: 12 },
        ];
        for (const item of items) {
          await runner.query(`
            INSERT INTO sop_template_items
              (template_id, category, item_text, is_critical, requires_photo, weight, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [sopTemplateId, item.cat, item.text, item.critical, item.photo, item.critical ? 2.0 : 1.0, item.ord]);
        }
      }
      console.log('✅ SOP Template ready');

      // ── 3. Vendor2 → INSPECTION_SCHEDULED ────────────────────────────────
      const v2User = await runner.manager.findOneBy('users', { email: 'vendor2@sppg.go.id' }) as { id: string } | null;
      if (v2User) {
        await runner.query(`
          UPDATE vendors SET
            lifecycle_status   = 'INSPECTION_SCHEDULED',
            business_name      = 'SPPG Maju Bersama Bandung',
            owner_name         = 'Siti Rahma Dewi',
            address_street     = 'Jl. Asia Afrika No. 45',
            address_city       = 'Bandung',
            address_province   = 'Jawa Barat',
            nib                = '8120009876543',
            daily_capacity_pax = 250
          WHERE user_id = $1
        `, [v2User.id]);

        const [vendor2] = await runner.query(`SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [v2User.id]);
        if (vendor2) {
          // SPPG location (not yet active)
          const [existingSppg2] = await runner.query(
            `SELECT id FROM sppg_locations WHERE vendor_id = $1 LIMIT 1`, [vendor2.id],
          );
          let sppg2Id: string;
          if (existingSppg2) {
            sppg2Id = existingSppg2.id;
            await runner.query(`UPDATE sppg_locations SET is_active = false WHERE id = $1`, [sppg2Id]);
          } else {
            const [ns] = await runner.query(`
              INSERT INTO sppg_locations
                (vendor_id, name, address_street, address_city, address_province, coordinates,
                 assigned_schools, is_active)
              VALUES ($1, 'SPPG Maju Bersama Bandung', 'Jl. Asia Afrika No. 45', 'Bandung', 'Jawa Barat',
                ST_GeomFromText('POINT(107.6191 -6.9175)', 4326),
                ARRAY['SDN 10 Bandung','SDN 11 Bandung','SDN 12 Bandung'],
                false)
              RETURNING id
            `, [vendor2.id]);
            sppg2Id = ns.id;
          }

          // Documents
          await runner.query(`
            INSERT INTO documents
              (vendor_id, doc_type, doc_number, file_url, file_key, file_hash,
               status, issued_at, verified_at, verified_by)
            VALUES ($1, 'nib'::document_type, '8120009876543',
              'https://storage.nutrio.go.id/docs/v2/nib.pdf',
              'docs/v2/nib.pdf', 'b2c3d4e5nibvend2000000000000000000000000000000', 'verified',
              NOW() - INTERVAL '14 days', NOW() - INTERVAL '5 days', $2)
            ON CONFLICT (file_key) DO NOTHING
          `, [vendor2.id, adminId]);

          await runner.query(`
            INSERT INTO documents
              (vendor_id, doc_type, doc_number, file_url, file_key, file_hash, status, issued_at)
            VALUES ($1, 'siup'::document_type, 'SIUP-3273-2024-088',
              'https://storage.nutrio.go.id/docs/v2/siup.pdf',
              'docs/v2/siup.pdf', 'c3d4e5f6siupvend20000000000000000000000000000', 'pending',
              NOW() - INTERVAL '14 days')
            ON CONFLICT (file_key) DO NOTHING
          `, [vendor2.id]);

          // Onboarding progress
          await runner.query(`
            INSERT INTO onboarding_progress
              (vendor_id, step1_done, step2_done, step3_done, step4_done, step5_done)
            VALUES ($1, true, true, false, false, false)
            ON CONFLICT (vendor_id) DO UPDATE
              SET step1_done = true, step2_done = true,
                  step3_done = false, step4_done = false, step5_done = false, completed_at = NULL
          `, [vendor2.id]);

          // Inspection scheduled
          const inspUser = await runner.manager.findOneBy('users', { email: 'inspector@bgn.go.id' }) as { id: string } | null;
          if (inspUser) {
            await runner.query(`
              INSERT INTO inspections
                (sppg_location_id, vendor_id, template_id, inspector_id, status, scheduled_for)
              SELECT $1, $2, $3, $4, 'assigned', CURRENT_DATE + 3
              WHERE NOT EXISTS (
                SELECT 1 FROM inspections WHERE vendor_id = $2 AND status IN ('assigned','in_progress')
              )
            `, [sppg2Id, vendor2.id, sopTemplateId, inspUser.id]);
          }
          console.log('✅ Vendor2 → INSPECTION_SCHEDULED');
        }
      }

      // ── 4. Pipeline vendors (vendor3-5) ──────────────────────────────────
      const vendorRole = await runner.manager.findOne('roles', { where: { name: 'vendor' } }) as { id: string } | null;

      type PipelineEntry = { email: string; fullName: string; bizName: string; owner: string; phone: string; city: string; province: string; lifecycle: string };
      const pipeline: PipelineEntry[] = [
        { email: 'vendor3@sppg.go.id', fullName: 'Mitra SPPG Surabaya',    bizName: 'SPPG Semangat Surabaya', owner: 'Ahmad Fauzi',   phone: '+62-812-3456-7892', city: 'Surabaya',    province: 'Jawa Timur',     lifecycle: 'PREPARING_DOCS' },
        { email: 'vendor4@sppg.go.id', fullName: 'Mitra SPPG Medan',       bizName: 'SPPG Berkah Medan',      owner: 'Dewi Pertiwi',  phone: '+62-812-3456-7893', city: 'Medan',       province: 'Sumatera Utara', lifecycle: 'UNDER_REVIEW'   },
        { email: 'vendor5@sppg.go.id', fullName: 'Mitra SPPG Yogyakarta',  bizName: 'SPPG Mulia Jogja',       owner: 'Rizki Pratama', phone: '+62-812-3456-7894', city: 'Yogyakarta',  province: 'DI Yogyakarta',  lifecycle: 'ONBOARDING'     },
      ];

      for (const pv of pipeline) {
        let pvUser = await runner.manager.findOneBy('users', { email: pv.email }) as { id: string } | null;
        if (!pvUser) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash('Vendor123!', salt);
          pvUser = await runner.manager.save('users', {
            email: pv.email, passwordHash: hash, fullName: pv.fullName,
            roleId: vendorRole?.id, roleLegacy: 'vendor', phone: pv.phone,
            isActive: true, isEmailVerified: true, emailVerifiedAt: new Date(),
          }) as unknown as { id: string };
        }

        const [existingV] = await runner.query(
          `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [pvUser.id],
        );
        if (!existingV) {
          await runner.query(`
            INSERT INTO vendors
              (user_id, business_name, owner_name, phone,
               address_street, address_city, address_province, lifecycle_status, status, daily_capacity_pax)
            VALUES ($1, $2, $3, $4, 'Jl. Demo No. 1', $5, $6, $7::vendor_lifecycle_status, 'draft', 200)
          `, [pvUser.id, pv.bizName, pv.owner, pv.phone, pv.city, pv.province, pv.lifecycle]);
        } else {
          await runner.query(
            `UPDATE vendors SET lifecycle_status = $2::vendor_lifecycle_status WHERE id = $1`,
            [existingV.id, pv.lifecycle],
          );
        }
      }
      console.log('✅ Pipeline vendors (vendor3-5) ready');

      console.log('\n🎉 VendorLifecycleSeed complete!');
    } finally {
      await runner.release();
    }
  }
}
