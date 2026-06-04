import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRagDocuments1711200000000 implements MigrationInterface {
  name = 'AddRagDocuments1711200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rag_documents (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        doc_name      VARCHAR(255) NOT NULL,
        content_chunk TEXT NOT NULL,
        source_pasal  VARCHAR(255),
        source_url    TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_rag_docs_name ON rag_documents(doc_name);
    `);

    const docs = [
      {
        name: 'SOP Standar Dapur MBG',
        chunk: 'Standar suhu masak untuk daging dan unggas adalah minimal 75°C, diukur di bagian terdalam menggunakan termometer food-grade yang terkalibrasi. Suhu masak beras dan nasi putih harus mencapai 100°C. Pemantauan suhu wajib dicatat setiap 30 menit selama proses memasak.',
        pasal: 'SOP Standar Dapur MBG §4.2.1',
      },
      {
        name: 'SOP Sanitasi Dapur MBG',
        chunk: 'Semua peralatan masak wajib dicuci dengan air panas (min 60°C) dan sabun food-grade sebelum dan sesudah digunakan. Permukaan meja kerja harus disanitasi dengan larutan klorin 200 ppm. APD wajib: celemek, tutup kepala, sarung tangan lateks, dan masker wajah.',
        pasal: 'SOP Sanitasi Dapur §3.1',
      },
      {
        name: 'Juknis BGN Prosedur Pengiriman',
        chunk: 'Makanan yang sudah matang harus dikemas dalam wadah food-grade yang tertutup rapat. Suhu penyimpanan maksimal 4 jam setelah masak. Kendaraan pengiriman wajib dilengkapi kotak insulasi untuk menjaga suhu. GPS tracking wajib aktif selama pengiriman. Waktu maksimal dari dapur ke sekolah adalah 2 jam.',
        pasal: 'Juknis BGN §5.3',
      },
      {
        name: 'Permenkes 2/2023 Kriteria Penilaian',
        chunk: 'Kriteria penilaian vendor MBG meliputi: (1) Kelengkapan dokumen sertifikasi bobotnya 20 poin; (2) Kepatuhan checkpoint harian CP1-CP4 bobotnya 40 poin; (3) Konfirmasi penerimaan sekolah bobotnya 20 poin; (4) Ketepatan waktu pengiriman bobotnya 20 poin. Total 100 poin per hari.',
        pasal: 'Permenkes 2/2023 Pasal 7',
      },
      {
        name: 'Juknis BGN Penalti dan Sanksi',
        chunk: 'Pelanggaran Golden Rule (CP2 lebih dari 4 jam dari CP1) dikenakan penalti -20 poin. Kualitas foto buruk -5 poin. Keluhan dari sekolah (ada masalah pada penerimaan) -10 poin. Keterlambatan pengiriman -15 poin. Force close tidak menyelesaikan CP hingga pukul 14.00 dikenakan -50 poin.',
        pasal: 'Juknis BGN §6.1',
      },
      {
        name: 'Juknis BGN Dokumen Wajib Vendor',
        chunk: 'Dokumen wajib untuk menjadi vendor MBG: (1) NIB aktif dari OSS; (2) Sertifikat PIRT atau izin edar MD dari BPOM; (3) Sertifikat halal dari BPJPH untuk produk mengandung daging; (4) Sertifikat laik hygiene dari Dinas Kesehatan; (5) NPWP perusahaan aktif; (6) Rekening bank atas nama perusahaan.',
        pasal: 'Juknis BGN §2.1',
      },
    ];

    for (const doc of docs) {
      await queryRunner.query(
        `INSERT INTO rag_documents (doc_name, content_chunk, source_pasal)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [doc.name, doc.chunk, doc.pasal],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS rag_documents;`);
  }
}
