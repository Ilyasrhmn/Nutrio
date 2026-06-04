import { DataSource } from 'typeorm';

/**
 * Compliance & oversight data for vendor1:
 * - Completed inspection with 12 checklist items (2 weeks ago, score 87.5)
 * - 2 citizen reports (1 investigating, 1 resolved)
 * - QR codes for each of the 3 assigned schools + scan history
 * - Risk score history (30 days)
 * - Alerts (cert_expiring, inspection_overdue, risk_drop)
 * - In-app notifications for vendor1 user (unread)
 */
export default class ComplianceSeed {
  async run(dataSource: DataSource): Promise<void> {
    const runner = dataSource.createQueryRunner();
    await runner.connect();

    try {
      // ── Lookups ───────────────────────────────────────────────────────────
      const v1User    = await runner.manager.findOneBy('users', { email: 'vendor@sppg.go.id' }) as { id: string } | null;
      const adminUser = await runner.manager.findOneBy('users', { email: 'admin@bgn.go.id'  }) as { id: string } | null;
      const inspUser  = await runner.manager.findOneBy('users', { email: 'inspector@bgn.go.id' }) as { id: string } | null;

      if (!v1User || !adminUser) { console.warn('⚠️  Required users missing'); return; }

      const [vendor1]  = await runner.query(`SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [v1User.id]);
      const [sppgLoc]  = await runner.query(`SELECT id FROM sppg_locations WHERE vendor_id = $1 AND is_active = true LIMIT 1`, [vendor1.id]);
      const [sopTpl]   = await runner.query(`SELECT id FROM sop_templates WHERE name = 'Template SOP SPPG Standar v1.0' LIMIT 1`);

      if (!vendor1 || !sppgLoc) { console.warn('⚠️  vendor1 or sppg_location missing'); return; }

      // ── 1. Completed inspection (2 weeks ago, score 87.5) ─────────────────
      if (sopTpl && inspUser) {
        const [existingInsp] = await runner.query(`
          SELECT id FROM inspections WHERE vendor_id = $1 AND status = 'completed' LIMIT 1
        `, [vendor1.id]);

        let inspId: string;
        if (existingInsp) {
          inspId = existingInsp.id;
        } else {
          const [newInsp] = await runner.query(`
            INSERT INTO inspections
              (sppg_location_id, vendor_id, template_id, inspector_id, status, scheduled_for,
               started_at, completed_at, inspector_lat, inspector_lng, distance_from_sppg,
               geofence_passed, total_items, passed_items, failed_items, critical_fails,
               inspection_score, inspector_notes)
            VALUES (
              $1, $2, $3, $4, 'completed', CURRENT_DATE - 14,
              NOW() - INTERVAL '14 days 4 hours', NOW() - INTERVAL '14 days 2 hours',
              -6.2090, 106.8460, 22.5,
              true, 12, 10, 1, 0,
              87.50,
              'Kondisi dapur secara keseluruhan sangat baik. Peralatan bersih dan tertata rapi. Satu item tidak lolos: suhu memasak sempat di bawah standar saat pemeriksaan. Sudah dikonfirmasi diperbaiki.'
            )
            RETURNING id
          `, [sppgLoc.id, vendor1.id, sopTpl.id, inspUser.id]);
          inspId = newInsp.id;
        }

        // Checklist items for the inspection
        const [existingItems] = await runner.query(
          `SELECT id FROM inspection_items WHERE inspection_id = $1 LIMIT 1`, [inspId],
        );
        if (!existingItems) {
          const templateItems = await runner.query(
            `SELECT id, is_critical, sort_order FROM sop_template_items WHERE template_id = $1 ORDER BY sort_order`,
            [sopTpl.id],
          );

          type InspResult = { result: 'pass' | 'fail' | 'na'; notes: string | null };
          // 10 pass, 1 fail (item #9 suhu memasak), 1 na (item #7 label bahan)
          const results: InspResult[] = [
            { result: 'pass', notes: null },
            { result: 'pass', notes: null },
            { result: 'pass', notes: null },
            { result: 'pass', notes: null },
            { result: 'pass', notes: null },
            { result: 'pass', notes: null },
            { result: 'na',   notes: 'Label asal-usul untuk bahan lokal tidak diwajibkan pada saat inspeksi' },
            { result: 'pass', notes: null },
            { result: 'fail', notes: 'Suhu pengukuran awal 68°C, di bawah standar 70°C. Diperbaiki saat inspeksi berlangsung.' },
            { result: 'pass', notes: null },
            { result: 'pass', notes: null },
            { result: 'pass', notes: null },
          ];

          for (let i = 0; i < templateItems.length && i < results.length; i++) {
            const tItem = templateItems[i] as { id: string };
            const rItem = results[i] as { result: string; notes: string | null };
            await runner.query(`
              INSERT INTO inspection_items (inspection_id, template_item_id, result, notes)
              VALUES ($1, $2, $3::checklist_item_result, $4)
            `, [inspId, tItem.id, rItem.result, rItem.notes]);
          }
        }
        console.log('✅ Completed inspection with checklist ready');
      }

      // ── 2. Risk score history (5 records over 30 days) ───────────────────
      const riskHistory = [
        { daysAgo: 30, score: 65.0, category: 'watch'   },
        { daysAgo: 21, score: 71.5, category: 'watch'   },
        { daysAgo: 14, score: 78.2, category: 'watch'   },
        { daysAgo: 7,  score: 80.0, category: 'safe'    },
        { daysAgo: 0,  score: 82.0, category: 'safe'    },
      ];
      for (const r of riskHistory) {
        await runner.query(`
          INSERT INTO risk_scores
            (vendor_id, score, category, component_sop, component_documents, component_cert_validity,
             component_profile, component_incident, component_response_time,
             trigger_event, model_version, calculated_at)
          VALUES ($1, $2, $3::risk_category, $4, $5, $6, $7, $8, $9,
            'periodic_recalculation', 'v1', NOW() - INTERVAL '${r.daysAgo} days')
        `, [vendor1.id, r.score, r.category,
            r.score * 0.30, r.score * 0.20, r.score * 0.15,
            r.score * 0.15, r.score * 0.10, r.score * 0.10]);
      }
      console.log('✅ Risk score history ready');

      // ── 3. QR codes + scan history ────────────────────────────────────────
      const schools = [
        { name: 'SDN 01 Jakarta Pusat', scans: 12 },
        { name: 'SDN 02 Jakarta Pusat', scans: 8  },
        { name: 'SDN 03 Jakarta Pusat', scans: 5  },
      ];
      const qrIds: string[] = [];

      for (const school of schools) {
        const token = `qr-${school.name.toLowerCase().replace(/\s+/g, '-')}-${vendor1.id.substring(0, 8)}`;
        const [existingQr] = await runner.query(
          `SELECT id FROM qr_codes WHERE qr_token = $1 LIMIT 1`, [token],
        );

        let qrId: string;
        if (existingQr) {
          qrId = existingQr.id;
        } else {
          const qrUrl = `https://nutrio.go.id/verify/${token}`;
          const [newQr] = await runner.query(`
            INSERT INTO qr_codes
              (sppg_location_id, vendor_id, qr_token, qr_url, status, generated_by,
               expires_at, last_printed_at, print_count)
            VALUES ($1, $2, $3, $4, 'active', $5,
              NOW() + INTERVAL '6 months',
              NOW() - INTERVAL '7 days', 3)
            RETURNING id
          `, [sppgLoc.id, vendor1.id, token, qrUrl, adminUser.id]);
          qrId = newQr.id;
        }
        qrIds.push(qrId);

        // Scan logs
        const existingScans = await runner.query(
          `SELECT COUNT(*) as cnt FROM qr_scans WHERE qr_code_id = $1`, [qrId],
        );
        if (parseInt(existingScans[0].cnt) === 0) {
          for (let i = 0; i < school.scans; i++) {
            await runner.query(`
              INSERT INTO qr_scans (qr_code_id, scanned_at, country, city)
              VALUES ($1, NOW() - INTERVAL '${i * 2} days', 'ID', 'Jakarta')
            `, [qrId]);
          }
        }
      }
      console.log('✅ QR codes and scan history ready');

      // ── 4. Citizen reports ────────────────────────────────────────────────
      const reports = [
        {
          category: 'food_poisoning',
          severity: 'high',
          status: 'investigating',
          daysAgo: 5,
          desc: '3 siswa kelas 4 SDN 01 Jakarta Pusat mengalami mual dan sakit perut setelah makan siang. Gejala muncul 2 jam setelah makan. Sudah dirujuk ke UKS sekolah dan orang tua sudah dihubungi. Belum ada laporan rawat inap.',
          resolveNote: null,
        },
        {
          category: 'portion',
          severity: 'medium',
          status: 'resolved',
          daysAgo: 14,
          desc: 'Porsi nasi yang diterima SDN 02 Jakarta Pusat hanya 88 dari 95 porsi yang seharusnya. Siswa kelas 6 tidak mendapat makanan lengkap.',
          resolveNote: 'Vendor telah dikonfirmasi dan menyatakan akan menambah buffer 10% pada pengiriman berikutnya. Permasalahan dianggap selesai.',
        },
      ];

      const now = Date.now();
      for (const rep of reports) {
        const submittedDate = new Date(now - rep.daysAgo * 86400000).toISOString().split('T')[0];
        const incidentDate  = submittedDate;
        const submittedAt   = new Date(now - rep.daysAgo * 86400000).toISOString();

        const [existingRep] = await runner.query(`
          SELECT id FROM citizen_reports
          WHERE vendor_id = $1 AND category = $2::report_category
            AND submitted_at::date = $3::date
          LIMIT 1
        `, [vendor1.id, rep.category, submittedDate]);

        if (!existingRep) {
          const actorId = inspUser?.id ?? adminUser.id;
          const isInvestigating = rep.status === 'investigating' || rep.status === 'resolved';
          const isResolved = rep.status === 'resolved';

          await runner.query(`
            INSERT INTO citizen_reports
              (vendor_id, sppg_location_id, category, description, incident_date,
               severity, triage_confidence, triage_keywords, triage_model_ver,
               status, assigned_to, investigated_at, resolved_at, resolved_by,
               resolution_note, submission_token, submitted_at)
            VALUES (
              $1, $2, $3::report_category, $4, $5::date,
              $6::report_severity, 0.87, ARRAY['porsi','mual','sakit'], 'v1',
              $7::report_status,
              $8,
              $9::timestamptz,
              $10::timestamptz,
              $11,
              $12,
              gen_random_uuid()::text,
              $13::timestamptz
            )
          `, [
            vendor1.id, sppgLoc.id, rep.category, rep.desc, incidentDate,
            rep.severity, rep.status,
            rep.status !== 'submitted' ? actorId : null,
            isInvestigating ? new Date(now - (rep.daysAgo - 1) * 86400000).toISOString() : null,
            isResolved      ? new Date(now - (rep.daysAgo - 2) * 86400000).toISOString() : null,
            isResolved      ? actorId : null,
            rep.resolveNote,
            submittedAt,
          ]);
        }
      }
      console.log('✅ Citizen reports ready');

      // ── 5. Alerts ─────────────────────────────────────────────────────────
      const alerts = [
        {
          type: 'cert_expiring',
          severity: 'warning',
          title: 'Sertifikat Halal akan kadaluarsa dalam 30 hari',
          body: 'Sertifikat Halal SPPG Nusantara Sehat Jakarta (No. ID12020000123456) akan kadaluarsa pada ' + new Date(Date.now() + 30 * 86400000).toLocaleDateString('id-ID') + '. Segera perbarui sertifikat untuk menghindari penalti skor.',
        },
        {
          type: 'risk_drop',
          severity: 'info',
          title: 'Skor risiko meningkat — status SAFE',
          body: 'Skor risiko vendor SPPG Nusantara meningkat dari 71.5 menjadi 82.0 (kategori SAFE). Pertahankan kinerja operasional saat ini.',
        },
        {
          type: 'citizen_report',
          severity: 'critical',
          title: 'Laporan warga aktif: dugaan keracunan',
          body: 'SDN 01 Jakarta Pusat melaporkan 3 siswa mengalami gejala mual setelah makan siang (5 hari lalu). Status penyelidikan: sedang berjalan. Koordinasi dengan Dinas Kesehatan diperlukan.',
        },
      ];

      for (const a of alerts) {
        const [existingAlert] = await runner.query(`
          SELECT id FROM alerts WHERE vendor_id = $1 AND alert_type = $2::alert_type
            AND created_at > NOW() - INTERVAL '7 days'
          LIMIT 1
        `, [vendor1.id, a.type]);

        if (!existingAlert) {
          await runner.query(`
            INSERT INTO alerts (vendor_id, sppg_location_id, severity, alert_type, title, body)
            VALUES ($1, $2, $3::alert_severity, $4::alert_type, $5, $6)
          `, [vendor1.id, sppgLoc.id, a.severity, a.type, a.title, a.body]);
        }
      }
      console.log('✅ Alerts ready');

      // ── 6. In-app notifications for vendor1 (unread) ──────────────────────
      const notifs = [
        {
          subject: 'Sertifikat Halal akan segera kadaluarsa',
          body: 'Sertifikat Halal Anda akan kadaluarsa dalam 30 hari. Kunjungi portal untuk memperbarui dokumen.',
          channel: 'in_app',
        },
        {
          subject: 'Skor hari ini: 90/100',
          body: 'Laporan harian: CP1-CP4 selesai, 2 dari 3 pengiriman terkonfirmasi. SDN 02 melaporkan porsi kurang (-10 poin).',
          channel: 'in_app',
        },
        {
          subject: 'PO-2024-00001 sudah diterima',
          body: 'Pesanan bahan baku PO-2024-00001 dari PT Tani Makmur Sejahtera telah dikonfirmasi diterima. Invoice INV-2024-00001 menunggu pembayaran.',
          channel: 'in_app',
        },
      ];

      const existingNotifCount = await runner.query(
        `SELECT COUNT(*) as cnt FROM notifications WHERE user_id = $1 AND read_at IS NULL`, [v1User.id],
      );
      if (parseInt(existingNotifCount[0].cnt) === 0) {
        for (const n of notifs) {
          await runner.query(`
            INSERT INTO notifications (user_id, channel, status, subject, body, sent_at)
            VALUES ($1, $2::notification_channel, 'sent', $3, $4, NOW() - INTERVAL '2 hours')
          `, [v1User.id, n.channel, n.subject, n.body]);
        }
      }
      console.log('✅ In-app notifications ready');

      console.log('\n🎉 ComplianceSeed complete!');
    } finally {
      await runner.release();
    }
  }
}
