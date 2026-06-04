import { DataSource } from 'typeorm';

/**
 * Supplier catalog + purchase orders + marketplace listing:
 * - PT Tani Makmur Sejahtera: 6 active products
 * - PO-001: delivered 2 weeks ago, invoice paid, review bintang 4
 * - PO-002: shipped, delivery tomorrow
 * - 1 marketplace listing from BGN (open)
 */
export default class MarketplaceSupplierSeed {
  async run(dataSource: DataSource): Promise<void> {
    const runner = dataSource.createQueryRunner();
    await runner.connect();

    try {
      // ── Lookup users ──────────────────────────────────────────────────────
      const v1User   = await runner.manager.findOneBy('users', { email: 'vendor@sppg.go.id'  }) as { id: string } | null;
      const supUser  = await runner.manager.findOneBy('users', { email: 'supplier@bgn.go.id' }) as { id: string } | null;
      const adminUser = await runner.manager.findOneBy('users', { email: 'admin@bgn.go.id'   }) as { id: string } | null;

      if (!v1User || !supUser || !adminUser) {
        console.warn('⚠️  Required users not found — run user.seed.ts first');
        return;
      }

      const [vendor1]  = await runner.query(`SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`,   [v1User.id]);
      const [supplier] = await runner.query(`SELECT id FROM suppliers WHERE user_id = $1 LIMIT 1`, [supUser.id]);

      if (!vendor1)  { console.warn('⚠️  vendor1 record missing');  return; }
      if (!supplier) { console.warn('⚠️  supplier record missing'); return; }

      // ── 1. Enrich supplier profile ────────────────────────────────────────
      await runner.query(`
        UPDATE suppliers SET
          business_name      = 'PT Tani Makmur Sejahtera',
          owner_name         = 'Agus Widodo',
          supplier_type      = 'petani',
          phone              = '+62815-6789-0123',
          email              = 'tanimakmur@gmail.com',
          address_street     = 'Jl. Raya Mauk No. 88',
          address_city       = 'Tangerang',
          address_province   = 'Banten',
          address_postal     = '15510',
          description        = 'Kelompok tani organik dengan pengalaman 15 tahun melayani kebutuhan sayur dan bahan pokok untuk program pemerintah. Bersertifikat halal dan organik.',
          product_categories = ARRAY['sayuran','beras','protein_nabati','bumbu'],
          service_radius_km  = 100,
          has_halal_cert     = true,
          has_bpom_cert      = false,
          has_organic_cert   = true,
          status             = 'verified',
          verified_at        = NOW() - INTERVAL '45 days',
          verified_by        = $2,
          avg_rating         = 4.2,
          total_reviews      = 8,
          total_pos_completed = 12,
          on_time_rate       = 91.67
        WHERE id = $1
      `, [supplier.id, adminUser.id]);
      console.log('✅ Supplier profile enriched');

      // ── 2. Products ───────────────────────────────────────────────────────
      type Product = {
        name: string; category: string; sub: string | null; desc: string;
        unit: string; unitSize: number | null; price: number; minQty: number;
        stock: number; halal: boolean; bpom: string | null;
      };
      const products: Product[] = [
        { name: 'Beras Putih Premium IR64', category: 'beras',           sub: 'beras_putih',  desc: 'Beras putih kualitas premium, butir panjang, pulen, rendah arsenik. Cocok untuk program MBG.', unit: 'kg',  unitSize: 1,    price: 12500,  minQty: 25,   stock: 5000,  halal: true,  bpom: null              },
        { name: 'Brokoli Segar Lokal',       category: 'sayuran',         sub: 'sayuran_hijau', desc: 'Brokoli segar dari kebun sendiri, dipanen pagi hari, tiba dalam 6 jam.',                      unit: 'kg',  unitSize: 1,    price: 18000,  minQty: 10,   stock: 200,   halal: true,  bpom: null              },
        { name: 'Wortel Nantes Lokal',       category: 'sayuran',         sub: 'umbi',          desc: 'Wortel segar varietas Nantes, warna oranye cerah, kaya beta-karoten.',                        unit: 'kg',  unitSize: 1,    price: 8500,   minQty: 10,   stock: 500,   halal: true,  bpom: null              },
        { name: 'Tahu Sutera Premium',       category: 'protein_nabati',  sub: 'tahu',          desc: 'Tahu sutera tanpa pengawet, dibuat setiap pagi, PIRT aktif. Tekstur lembut dan bergizi.',     unit: 'pcs', unitSize: 0.15, price: 3500,   minQty: 50,   stock: 1000,  halal: true,  bpom: 'PIRT-5502-2023'  },
        { name: 'Tempe Kedelai Premium',     category: 'protein_nabati',  sub: 'tempe',         desc: 'Tempe berbahan kedelai non-GMO, fermentasi 36 jam, PIRT aktif.',                              unit: 'pcs', unitSize: 0.25, price: 5000,   minQty: 50,   stock: 800,   halal: true,  bpom: 'PIRT-5502-2023'  },
        { name: 'Cabai Merah Keriting',      category: 'bumbu',           sub: null,            desc: 'Cabai merah keriting segar, tingkat kepedasan medium, dipanen hari ini.',                     unit: 'kg',  unitSize: 1,    price: 45000,  minQty: 5,    stock: 100,   halal: true,  bpom: null              },
      ];

      const productIds: string[] = [];
      for (const p of products) {
        const [existing] = await runner.query(
          `SELECT id FROM supplier_products WHERE supplier_id = $1 AND name = $2 LIMIT 1`,
          [supplier.id, p.name],
        );
        if (existing) {
          productIds.push(existing.id);
          await runner.query(`
            UPDATE supplier_products SET
              price_per_unit = $2, stock_available = $3, status = 'active'
            WHERE id = $1
          `, [existing.id, p.price, p.stock]);
        } else {
          const [np] = await runner.query(`
            INSERT INTO supplier_products
              (supplier_id, name, category, subcategory, description, unit, unit_size,
               price_per_unit, min_order_qty, stock_available, bpom_reg_number, has_halal_label, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
            RETURNING id
          `, [supplier.id, p.name, p.category, p.sub, p.desc, p.unit, p.unitSize,
              p.price, p.minQty, p.stock, p.bpom, p.halal]);
          productIds.push(np.id);
        }
      }
      console.log(`✅ ${products.length} products ready`);

      // Product IDs by index: 0=beras, 1=brokoli, 2=wortel, 3=tahu, 4=tempe, 5=cabai

      // ── 3. PO-001: delivered, 2 weeks ago ────────────────────────────────
      const po1Number = 'PO-2024-00001';
      const [existingPo1] = await runner.query(
        `SELECT id FROM purchase_orders WHERE po_number = $1 LIMIT 1`, [po1Number],
      );
      let po1Id: string;

      if (existingPo1) {
        po1Id = existingPo1.id;
      } else {
        const deliveryDate14 = `CURRENT_DATE - 14`;
        const [newPo1] = await runner.query(`
          INSERT INTO purchase_orders
            (po_number, vendor_id, supplier_id, status,
             requested_delivery_date, confirmed_delivery_date, actual_delivery_date,
             subtotal, tax_amount, total_amount, currency,
             shipping_address, tracking_number,
             payment_method, payment_status, paid_at,
             vendor_notes, supplier_notes, supplier_deadline)
          VALUES (
            $1, $2, $3, 'delivered',
            ${deliveryDate14}, ${deliveryDate14}, ${deliveryDate14},
            800000, 88000, 888000, 'IDR',
            'Jl. Merdeka No. 12, Jakarta Pusat', 'JNE-074521-ID',
            'snap_api', 'paid', NOW() - INTERVAL '13 days',
            'Mohon dikemas dengan wadah insulasi karena akan langsung digunakan',
            'Barang dikirim pagi hari pukul 05:30',
            NOW() - INTERVAL '15 days'
          )
          RETURNING id
        `, [po1Number, vendor1.id, supplier.id]);
        po1Id = newPo1.id;

        // PO-001 items: beras 50kg, wortel 20kg, tahu 100pcs
        await runner.query(`
          INSERT INTO purchase_order_items (po_id, product_id, product_name, unit, qty, unit_price, line_total)
          VALUES
            ($1, $2, 'Beras Putih Premium IR64', 'kg',  50,  12500, 625000),
            ($1, $3, 'Wortel Nantes Lokal',       'kg',  20,  8500,  170000),
            ($1, $4, 'Tahu Sutera Premium',       'pcs', 5,   3500,  17500)
        `, [po1Id, productIds[0], productIds[2], productIds[3]]);

        // Status logs
        const po1Statuses = [
          { from: null,             to: 'draft',            daysAgo: 17 },
          { from: 'draft',          to: 'pending_supplier', daysAgo: 17 },
          { from: 'pending_supplier', to: 'confirmed',      daysAgo: 16 },
          { from: 'confirmed',      to: 'processing',       daysAgo: 15 },
          { from: 'processing',     to: 'shipped',          daysAgo: 14 },
          { from: 'shipped',        to: 'delivered',        daysAgo: 14 },
        ];
        for (const log of po1Statuses) {
          await runner.query(`
            INSERT INTO po_status_logs (po_id, from_status, to_status, actor_id, created_at)
            VALUES ($1, $2, $3::po_status, $4, NOW() - INTERVAL '${log.daysAgo} days')
          `, [po1Id, log.from, log.to, log.to === 'confirmed' ? supUser.id : v1User.id]);
        }

        // Invoice (auto-generated on delivered, but we insert manually for seed)
        await runner.query(`
          INSERT INTO supplier_invoices
            (po_id, invoice_number, subtotal, tax_amount, total_amount, currency,
             payment_status, paid_at, due_date)
          VALUES ($1, 'INV-2024-00001', 800000, 88000, 888000, 'IDR',
            'paid', NOW() - INTERVAL '13 days', CURRENT_DATE - 2)
          ON CONFLICT (po_id) DO NOTHING
        `, [po1Id]);

        // Supplier review
        await runner.query(`
          INSERT INTO supplier_reviews
            (po_id, vendor_id, supplier_id,
             rating_overall, rating_product_quality, rating_delivery_time,
             rating_product_match, rating_communication,
             review_text, is_visible)
          VALUES ($1, $2, $3, 4, 5, 4, 4, 4,
            'Kualitas bahan sangat baik, beras premium dan sayuran segar. Pengiriman tepat waktu sesuai jadwal. Supplier responsif dan profesional. Akan order lagi.',
            true)
          ON CONFLICT (po_id) DO NOTHING
        `, [po1Id, vendor1.id, supplier.id]);
      }
      console.log('✅ PO-001 (delivered) ready');

      // ── 4. PO-002: shipped, delivery tomorrow ─────────────────────────────
      const po2Number = 'PO-2024-00002';
      const [existingPo2] = await runner.query(
        `SELECT id FROM purchase_orders WHERE po_number = $1 LIMIT 1`, [po2Number],
      );

      if (!existingPo2) {
        const [newPo2] = await runner.query(`
          INSERT INTO purchase_orders
            (po_number, vendor_id, supplier_id, status,
             requested_delivery_date,
             subtotal, tax_amount, total_amount, currency,
             shipping_address, tracking_number,
             payment_method, payment_status,
             vendor_notes, supplier_deadline)
          VALUES (
            $1, $2, $3, 'shipped',
            CURRENT_DATE + 1,
            1587500, 174625, 1762125, 'IDR',
            'Jl. Merdeka No. 12, Jakarta Pusat', 'JNE-082736-ID',
            'snap_api', 'pending',
            'Mohon pengiriman sebelum pukul 05:00 agar bisa langsung digunakan untuk CP1',
            NOW() + INTERVAL '1 day'
          )
          RETURNING id
        `, [po2Number, vendor1.id, supplier.id]);
        const po2Id = newPo2.id;

        // PO-002 items: beras 100kg, brokoli 25kg, tempe 100pcs, wortel 30kg
        await runner.query(`
          INSERT INTO purchase_order_items (po_id, product_id, product_name, unit, qty, unit_price, line_total)
          VALUES
            ($1, $2, 'Beras Putih Premium IR64', 'kg',  100, 12500, 1250000),
            ($1, $3, 'Brokoli Segar Lokal',       'kg',  25,  18000, 450000),
            ($1, $4, 'Tempe Kedelai Premium',     'pcs', 100, 5000,  500000),
            ($1, $5, 'Wortel Nantes Lokal',        'kg',  15,  8500,  127500)
        `, [po2Id, productIds[0], productIds[1], productIds[4], productIds[2]]);

        // Status logs
        await runner.query(`
          INSERT INTO po_status_logs (po_id, from_status, to_status, actor_id, created_at)
          VALUES
            ($1, NULL,              'draft'::po_status,            $2, NOW() - INTERVAL '4 days'),
            ($1, 'draft',           'pending_supplier'::po_status, $2, NOW() - INTERVAL '4 days'),
            ($1, 'pending_supplier','confirmed'::po_status,        $3, NOW() - INTERVAL '3 days'),
            ($1, 'confirmed',       'processing'::po_status,       $3, NOW() - INTERVAL '2 days'),
            ($1, 'processing',      'shipped'::po_status,          $3, NOW() - INTERVAL '1 day')
        `, [po2Id, v1User.id, supUser.id]);
      }
      console.log('✅ PO-002 (shipped) ready');

      // ── 5. Marketplace listing from BGN ───────────────────────────────────
      const listingTitle = 'Kebutuhan SPPG Wilayah Jakarta Selatan 2025';
      const [existingListing] = await runner.query(
        `SELECT id FROM marketplace_listings WHERE title = $1 LIMIT 1`, [listingTitle],
      );
      if (!existingListing) {
        const [listing] = await runner.query(`
          INSERT INTO marketplace_listings
            (posted_by, province, city, radius_km, title, description,
             daily_capacity_min, daily_capacity_max, meal_types, specialization_req,
             min_risk_score, contract_start_date, contract_duration_months,
             budget_per_portion, status, closes_at)
          VALUES (
            $1, 'DKI Jakarta', 'Jakarta Selatan', 15,
            $2,
            'Dibutuhkan mitra SPPG untuk melayani 5 sekolah dasar di wilayah Jakarta Selatan mulai tahun ajaran baru. Total estimasi 500 porsi per hari. Prioritas vendor bersertifikat halal dengan kapasitas minimal 400 porsi.',
            400, 600,
            ARRAY['nasi_box','lauk_nabati','lauk_hewani','sayuran','buah'],
            ARRAY['nasi_box','gizi_seimbang'],
            75, CURRENT_DATE + 60, 12, 15000,
            'open', NOW() + INTERVAL '30 days'
          )
          RETURNING id
        `, [adminUser.id, listingTitle]);

        // 1 application from vendor2
        const v2User = await runner.manager.findOneBy('users', { email: 'vendor2@sppg.go.id' }) as { id: string } | null;
        if (v2User) {
          const [v2] = await runner.query(`SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [v2User.id]);
          if (v2) {
            await runner.query(`
              INSERT INTO marketplace_applications
                (listing_id, vendor_id, status, applied_at)
              VALUES ($1, $2, 'applied', NOW() - INTERVAL '2 days')
              ON CONFLICT (listing_id, vendor_id) DO NOTHING
            `, [listing.id, v2.id]);
          }
        }
      }
      console.log('✅ Marketplace listing ready');

      console.log('\n🎉 MarketplaceSupplierSeed complete!');
    } finally {
      await runner.release();
    }
  }
}
