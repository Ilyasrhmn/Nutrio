import { DataSource } from 'typeorm';

/**
 * Operational data for vendor1 (ACTIVE):
 * - 30 days score history with realistic ups/downs and score_events
 * - CP1-CP4 checkpoint events for the last 7 days (today all done)
 * - Delivery tokens to 3 schools + school_confirmations for today
 * - Daily debriefs for today and yesterday
 */
export default class DailyOpsSeed {
  async run(dataSource: DataSource): Promise<void> {
    const runner = dataSource.createQueryRunner();
    await runner.connect();

    try {
      const v1User = await runner.manager.findOneBy('users', { email: 'vendor@sppg.go.id' }) as { id: string } | null;
      if (!v1User) { console.warn('⚠️  vendor@sppg.go.id not found'); return; }

      const [vendor1] = await runner.query(`SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [v1User.id]);
      if (!vendor1) { console.warn('⚠️  vendor1 missing'); return; }

      const [sppgLoc] = await runner.query(
        `SELECT id FROM sppg_locations WHERE vendor_id = $1 AND is_active = true LIMIT 1`, [vendor1.id],
      );
      if (!sppgLoc) { console.warn('⚠️  Active SPPG location missing for vendor1'); return; }

      // ── 1. Score history (30 days) ────────────────────────────────────────
      type ScoreDay = { daysAgo: number; score: number; final: number | null };
      const scorePlan: ScoreDay[] = [
        { daysAgo: 30, score: 95,  final: 95  }, // PHOTO_QUALITY_POOR -5
        { daysAgo: 29, score: 100, final: 100 },
        { daysAgo: 28, score: 100, final: 100 },
        { daysAgo: 27, score: 90,  final: 90  }, // SCHOOL_COMPLAINT -10
        { daysAgo: 26, score: 100, final: 100 },
        { daysAgo: 25, score: 85,  final: 85  }, // DELIVERY_LATE -15
        { daysAgo: 24, score: 100, final: 100 },
        { daysAgo: 23, score: 100, final: 100 },
        { daysAgo: 22, score: 95,  final: 95  }, // PHOTO_QUALITY_POOR -5
        { daysAgo: 21, score: 100, final: 100 },
        { daysAgo: 20, score: 80,  final: 80  }, // CP2_SKIP -20
        { daysAgo: 19, score: 100, final: 100 },
        { daysAgo: 18, score: 100, final: 100 },
        { daysAgo: 17, score: 95,  final: 95  },
        { daysAgo: 16, score: 100, final: 100 },
        { daysAgo: 15, score: 90,  final: 90  }, // SCHOOL_COMPLAINT -10
        { daysAgo: 14, score: 100, final: 100 },
        { daysAgo: 13, score: 100, final: 100 },
        { daysAgo: 12, score: 100, final: 100 },
        { daysAgo: 11, score: 85,  final: 85  }, // DELIVERY_LATE -15
        { daysAgo: 10, score: 100, final: 100 },
        { daysAgo: 9,  score: 100, final: 100 },
        { daysAgo: 8,  score: 100, final: 100 },
        { daysAgo: 7,  score: 80,  final: 80  }, // DELIVERY_LATE -15
        { daysAgo: 6,  score: 85,  final: 85  },
        { daysAgo: 5,  score: 75,  final: 75  }, // DELIVERY_LATE -15, SCHOOL_COMPLAINT -10
        { daysAgo: 4,  score: 95,  final: 95  },
        { daysAgo: 3,  score: 90,  final: 90  },
        { daysAgo: 2,  score: 85,  final: 85  }, // CP3_PHOTO_MISSING -10, CP4_SKIPPED -5
        { daysAgo: 1,  score: 88,  final: 88  },
        { daysAgo: 0,  score: 90,  final: null }, // Today — ongoing, SCHOOL_COMPLAINT -10
      ];

      const today = new Date();
      for (const row of scorePlan) {
        const d = new Date(today);
        d.setDate(d.getDate() - row.daysAgo);
        const scoreDate = d.toISOString().split('T')[0];
        const finalizedAt = (row.final !== null && row.daysAgo > 0)
          ? new Date(today.getTime() - row.daysAgo * 86400000).toISOString()
          : null;
        await runner.query(`
          INSERT INTO daily_score_records
            (vendor_id, score_date, score_current, score_final, finalized_at)
          VALUES ($1, $2::date, $3, $4, $5::timestamptz)
          ON CONFLICT (vendor_id, score_date) DO UPDATE
            SET score_current = EXCLUDED.score_current,
                score_final   = EXCLUDED.score_final,
                finalized_at  = EXCLUDED.finalized_at
        `, [vendor1.id, scoreDate, row.score, row.final, finalizedAt]);
      }
      console.log('✅ 30-day score history created');

      // ── 2. Score events ───────────────────────────────────────────────────
      type ScoreEvent = { daysAgo: number; type: string; delta: number; reason: string; ref: string };
      const eventPlan: ScoreEvent[] = [
        { daysAgo: 30, type: 'PHOTO_QUALITY_POOR',  delta: -5,  reason: 'Foto CP3 buram, tidak memenuhi standar resolusi minimal', ref: 'Juknis BGN §4.3' },
        { daysAgo: 27, type: 'SCHOOL_COMPLAINT',    delta: -10, reason: 'SDN 03 Jakarta Pusat melaporkan 8 porsi kurang dari target 100', ref: 'Juknis BGN §6.1' },
        { daysAgo: 25, type: 'DELIVERY_LATE',       delta: -15, reason: 'Pengiriman terlambat 28 menit akibat kemacetan Jl. Sudirman', ref: 'Juknis BGN §5.3' },
        { daysAgo: 22, type: 'PHOTO_QUALITY_POOR',  delta: -5,  reason: 'Foto CP2 tidak jelas, background tidak sesuai standar', ref: 'Juknis BGN §4.3' },
        { daysAgo: 20, type: 'CP2_SKIP',            delta: -20, reason: 'Foto CP2 tidak terupload dalam batas waktu Golden Rule (4 jam)', ref: 'Juknis BGN §6.1' },
        { daysAgo: 15, type: 'SCHOOL_COMPLAINT',    delta: -10, reason: 'SDN 01 Jakarta Pusat melaporkan kondisi makanan kurang panas', ref: 'Juknis BGN §6.1' },
        { daysAgo: 11, type: 'DELIVERY_LATE',       delta: -15, reason: 'Pengiriman terlambat 22 menit akibat kendaraan mogok', ref: 'Juknis BGN §5.3' },
        { daysAgo: 7,  type: 'DELIVERY_LATE',       delta: -15, reason: 'Pengiriman terlambat 20 menit', ref: 'Juknis BGN §5.3' },
        { daysAgo: 5,  type: 'DELIVERY_LATE',       delta: -15, reason: 'Pengiriman ke SDN 02 terlambat 35 menit karena macet parah', ref: 'Juknis BGN §5.3' },
        { daysAgo: 5,  type: 'SCHOOL_COMPLAINT',    delta: -10, reason: 'SDN 02 melaporkan 12 porsi kurang dari target 95 porsi', ref: 'Juknis BGN §6.1' },
        { daysAgo: 2,  type: 'CP3_PHOTO_MISSING',   delta: -10, reason: 'Foto checkpoint CP3 tidak ditemukan dalam sistem', ref: 'Juknis BGN §4.3' },
        { daysAgo: 2,  type: 'CP4_PHOTO_POOR',      delta: -5,  reason: 'Foto CP4 terlalu gelap', ref: 'Juknis BGN §4.3' },
        { daysAgo: 0,  type: 'SCHOOL_COMPLAINT',    delta: -10, reason: 'SDN 02 Jakarta Pusat melaporkan 5 porsi kurang dari target 95 porsi', ref: 'Juknis BGN §6.1' },
      ];

      for (const ev of eventPlan) {
        const evDate = new Date(today);
        evDate.setDate(evDate.getDate() - ev.daysAgo);
        const evDateStr = evDate.toISOString().split('T')[0];
        const [rec] = await runner.query(
          `SELECT id FROM daily_score_records WHERE vendor_id = $1 AND score_date = $2::date LIMIT 1`,
          [vendor1.id, evDateStr],
        );
        if (!rec) continue;

        // Guard: only insert if this event_type doesn't already exist for this record
        const [existing] = await runner.query(
          `SELECT id FROM score_events WHERE daily_score_record_id = $1 AND event_type = $2 LIMIT 1`,
          [rec.id, ev.type],
        );
        if (!existing) {
          await runner.query(`
            INSERT INTO score_events
              (daily_score_record_id, event_type, score_delta, reason, regulation_ref)
            VALUES ($1, $2, $3, $4, $5)
          `, [rec.id, ev.type, ev.delta, ev.reason, ev.ref]);
        }
      }
      console.log('✅ Score events inserted');

      // ── 3. Checkpoint events (7 days) ────────────────────────────────────
      type CpDay = { daysAgo: number; cp: 'CP1' | 'CP2' | 'CP3' | 'CP4'; status: string; startH: number; endH: number; delta: number };
      const cpPlan: CpDay[] = [
        // Today (all 4 done — good day for demo)
        { daysAgo: 0, cp: 'CP1', status: 'done', startH: 5,  endH: 6,  delta: 0  },
        { daysAgo: 0, cp: 'CP2', status: 'done', startH: 9,  endH: 10, delta: 0  },
        { daysAgo: 0, cp: 'CP3', status: 'done', startH: 11, endH: 12, delta: 0  },
        { daysAgo: 0, cp: 'CP4', status: 'done', startH: 13, endH: 14, delta: 0  },
        // Yesterday (CP4 failed → penalty)
        { daysAgo: 1, cp: 'CP1', status: 'done',   startH: 5,  endH: 6,  delta: 0   },
        { daysAgo: 1, cp: 'CP2', status: 'done',   startH: 9,  endH: 10, delta: 0   },
        { daysAgo: 1, cp: 'CP3', status: 'done',   startH: 11, endH: 12, delta: 0   },
        { daysAgo: 1, cp: 'CP4', status: 'failed', startH: 13, endH: 14, delta: -15 },
        // D-2
        { daysAgo: 2, cp: 'CP1', status: 'done', startH: 5,  endH: 6,  delta: 0 },
        { daysAgo: 2, cp: 'CP2', status: 'done', startH: 9,  endH: 10, delta: 0 },
        { daysAgo: 2, cp: 'CP3', status: 'done', startH: 11, endH: 12, delta: 0 },
        { daysAgo: 2, cp: 'CP4', status: 'done', startH: 13, endH: 14, delta: 0 },
        // D-3
        { daysAgo: 3, cp: 'CP1', status: 'done', startH: 5,  endH: 6,  delta: 0 },
        { daysAgo: 3, cp: 'CP2', status: 'done', startH: 9,  endH: 10, delta: 0 },
        { daysAgo: 3, cp: 'CP3', status: 'done', startH: 11, endH: 12, delta: 0 },
        { daysAgo: 3, cp: 'CP4', status: 'done', startH: 13, endH: 14, delta: 0 },
        // D-4 (all done)
        { daysAgo: 4, cp: 'CP1', status: 'done', startH: 5,  endH: 6,  delta: 0 },
        { daysAgo: 4, cp: 'CP2', status: 'done', startH: 9,  endH: 10, delta: 0 },
        { daysAgo: 4, cp: 'CP3', status: 'done', startH: 11, endH: 12, delta: 0 },
        { daysAgo: 4, cp: 'CP4', status: 'done', startH: 13, endH: 14, delta: 0 },
        // D-5 (CP3 force_closed late)
        { daysAgo: 5, cp: 'CP1', status: 'done',        startH: 5,  endH: 6,  delta: 0   },
        { daysAgo: 5, cp: 'CP2', status: 'done',        startH: 9,  endH: 10, delta: 0   },
        { daysAgo: 5, cp: 'CP3', status: 'force_closed', startH: 11, endH: 15, delta: -20 },
        { daysAgo: 5, cp: 'CP4', status: 'done',        startH: 15, endH: 16, delta: 0   },
        // D-6
        { daysAgo: 6, cp: 'CP1', status: 'done', startH: 5,  endH: 6,  delta: 0 },
        { daysAgo: 6, cp: 'CP2', status: 'done', startH: 9,  endH: 10, delta: 0 },
        { daysAgo: 6, cp: 'CP3', status: 'done', startH: 11, endH: 12, delta: 0 },
        { daysAgo: 6, cp: 'CP4', status: 'done', startH: 13, endH: 14, delta: 0 },
      ];

      for (const cp of cpPlan) {
        const baseDate = `CURRENT_DATE - ${cp.daysAgo}`;
        await runner.query(`
          INSERT INTO checkpoint_events
            (vendor_id, sppg_location_id, cp_type, cp_status, photos, ai_validation,
             score_delta, started_at, completed_at, created_at)
          VALUES (
            $1, $2, $3::cp_type, $4::cp_status,
            $5::jsonb,
            $6::jsonb,
            $7,
            (${baseDate} + INTERVAL '${cp.startH} hours')::timestamptz,
            (${baseDate} + INTERVAL '${cp.endH} hours')::timestamptz,
            (${baseDate} + INTERVAL '${cp.startH} hours')::timestamptz
          )
          ON CONFLICT DO NOTHING
        `, [
          vendor1.id,
          sppgLoc.id,
          cp.cp,
          cp.status,
          JSON.stringify([{
            fileKey: `cp/${cp.daysAgo}/${cp.cp}/photo1.jpg`,
            fileUrl: `https://storage.nutrio.go.id/cp/${cp.daysAgo}/${cp.cp}/photo1.jpg`,
            fileHash: `cp${cp.daysAgo}${cp.cp}hash0000000000000000000000000000000000`,
          }]),
          cp.status === 'done'
            ? JSON.stringify({ pass: true,  reason: 'Semua standar terpenuhi, kondisi dapur bersih dan tertib', confidence: 0.92 })
            : JSON.stringify({ pass: false, reason: 'Foto tidak memenuhi standar atau prosedur tidak lengkap',  confidence: 0.85 }),
          cp.delta,
        ]);
      }
      console.log('✅ Checkpoint events (7 days) created');

      // ── 4. Delivery tokens + school confirmations (today) ─────────────────
      type TokenRow = { school: string; porsi: number; status: string; kondisi: string | null; masalah: string[]; catatan: string | null };
      const schools: TokenRow[] = [
        { school: 'SDN 01 Jakarta Pusat', porsi: 100, status: 'used',   kondisi: 'baik',        masalah: [],                catatan: null },
        { school: 'SDN 02 Jakarta Pusat', porsi: 90,  status: 'used',   kondisi: 'ada_masalah', masalah: ['porsi_kurang'],  catatan: 'Diterima hanya 85 porsi dari 90 yang dikirim' },
        { school: 'SDN 03 Jakarta Pusat', porsi: 80,  status: 'active', kondisi: null,           masalah: [],               catatan: null },
      ];

      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0];

      for (const s of schools) {
        const [existing] = await runner.query(`
          SELECT id FROM delivery_tokens
          WHERE vendor_id = $1 AND school_id = $2 AND generated_at::date = $3::date
          LIMIT 1
        `, [vendor1.id, s.school, todayStr]);

        let tokenId: string;
        if (existing) {
          tokenId = existing.id;
          await runner.query(`
            UPDATE delivery_tokens SET status = $2::varchar, porsi_count = $3,
              used_at = CASE WHEN $2::varchar = 'used' THEN NOW() - INTERVAL '2 hours' ELSE used_at END
            WHERE id = $1
          `, [tokenId, s.status, s.porsi]);
        } else {
          const [newToken] = await runner.query(`
            INSERT INTO delivery_tokens
              (vendor_id, sppg_location_id, school_id, porsi_count, expired_at, status,
               used_at, arrived_at, completed_at)
            VALUES ($1, $2, $3, $4,
              NOW() + INTERVAL '8 hours',
              $5,
              ${s.status === 'used' ? "NOW() - INTERVAL '2 hours'" : 'NULL'},
              ${s.status === 'used' ? "NOW() - INTERVAL '2 hours 30 minutes'" : 'NULL'},
              ${s.status === 'used' ? "NOW() - INTERVAL '1 hour 50 minutes'" : 'NULL'}
            )
            RETURNING id
          `, [vendor1.id, sppgLoc.id, s.school, s.porsi, s.status]);
          tokenId = newToken.id;
        }

        if (s.kondisi && s.status === 'used') {
          await runner.query(`
            INSERT INTO school_confirmations
              (delivery_token_id, jumlah_diterima, kondisi, masalah_jenis, catatan)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (delivery_token_id) DO NOTHING
          `, [tokenId, s.porsi - (s.masalah.length > 0 ? 5 : 0), s.kondisi, s.masalah, s.catatan]);
        }
      }
      console.log('✅ Delivery tokens and school confirmations (today) ready');

      // Also create yesterday's tokens (all used & confirmed)
      const yesterdaySchools = ['SDN 01 Jakarta Pusat', 'SDN 02 Jakarta Pusat', 'SDN 03 Jakarta Pusat'];
      for (const school of yesterdaySchools) {
        const [existing] = await runner.query(`
          SELECT id FROM delivery_tokens
          WHERE vendor_id = $1 AND school_id = $2 AND generated_at::date = $3::date
          LIMIT 1
        `, [vendor1.id, school, yesterdayStr]);

        if (!existing) {
          const [yt] = await runner.query(`
            INSERT INTO delivery_tokens
              (vendor_id, sppg_location_id, school_id, porsi_count, generated_at, expired_at, status, used_at)
            VALUES ($1, $2, $3, 90, NOW() - INTERVAL '1 day', NOW() - INTERVAL '16 hours',
              'used', NOW() - INTERVAL '22 hours')
            RETURNING id
          `, [vendor1.id, sppgLoc.id, school]);

          await runner.query(`
            INSERT INTO school_confirmations
              (delivery_token_id, jumlah_diterima, kondisi, masalah_jenis, catatan)
            VALUES ($1, 90, 'baik', '{}', NULL)
            ON CONFLICT (delivery_token_id) DO NOTHING
          `, [yt.id]);
        }
      }
      console.log('✅ Yesterday tokens & confirmations ready');

      // ── 5. Daily debriefs ─────────────────────────────────────────────────
      const debriefs = [
        {
          daysAgo: 1,
          scoreFinal: 88,
          good: 'Semua 4 checkpoint diselesaikan tepat waktu. Pengiriman ke 3 sekolah berhasil dengan total 270 porsi terdistribusi. Konfirmasi penerimaan 100% dari semua sekolah.',
          improve: 'Checkpoint CP4 mengalami keterlambatan penyelesaian 20 menit dari jadwal. Perlu evaluasi alur persiapan akhir sebelum pengiriman.',
          recs: JSON.stringify([
            { action: 'Mulai CP4 (persiapan pengiriman) 30 menit lebih awal', priority: 'high' },
            { action: 'Tambah koordinator lapangan untuk monitoring waktu real-time', priority: 'medium' },
          ]),
          fundEst: 4725000,
        },
        {
          daysAgo: 0,
          scoreFinal: 90,
          good: 'Semua 4 checkpoint CP1-CP4 selesai dengan validasi AI lulus. Pengiriman ke SDN 01 dan SDN 02 sudah terkonfirmasi. Skor berjalan 90 dari target 100.',
          improve: 'SDN 02 Jakarta Pusat melaporkan 5 porsi kurang dari target 90 porsi. Perlu verifikasi ulang proses pengemasan dan penghitungan porsi sebelum pengiriman.',
          recs: JSON.stringify([
            { action: 'Implementasi double-check penghitungan porsi sebelum pengemasan', priority: 'high' },
            { action: 'Koordinasi dengan SDN 02 untuk klarifikasi laporan porsi kurang', priority: 'high' },
            { action: 'SDN 03 belum dikonfirmasi — pastikan pengiriman selesai tepat waktu', priority: 'medium' },
          ]),
          fundEst: 4590000,
        },
      ];

      for (const d of debriefs) {
        const debriefDate = new Date(today);
        debriefDate.setDate(debriefDate.getDate() - d.daysAgo);
        const debriefDateStr = debriefDate.toISOString().split('T')[0];
        await runner.query(`
          INSERT INTO daily_debriefs
            (vendor_id, score_date, score_final, narrative_good, narrative_improve,
             recommendations, fund_estimate)
          VALUES ($1, $2::date, $3, $4, $5, $6::jsonb, $7)
          ON CONFLICT (vendor_id, score_date) DO UPDATE
            SET score_final       = EXCLUDED.score_final,
                narrative_good    = EXCLUDED.narrative_good,
                narrative_improve = EXCLUDED.narrative_improve,
                recommendations   = EXCLUDED.recommendations,
                fund_estimate     = EXCLUDED.fund_estimate
        `, [vendor1.id, debriefDateStr, d.scoreFinal, d.good, d.improve, d.recs, d.fundEst]);
      }
      console.log('✅ Daily debriefs created');

      console.log('\n🎉 DailyOpsSeed complete!');
    } finally {
      await runner.release();
    }
  }
}
