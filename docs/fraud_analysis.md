# MBG Fraud Risk Assessment & Mitigation Blueprint

> Dokumen ini memetakan **seluruh potensi fraud** di ekosistem MBG berdasarkan lifecycle operasional, dari pendaftaran vendor hingga pencairan dana. Setiap skenario dilengkapi modus, deteksi, dan solusi teknis.

---

## Fraud Risk Heat Map

```
                    LIKELIHOOD
                Low          Medium         High
           ┌──────────┬──────────────┬─────────────┐
    High   │ Admin    │ Fictitious   │ Ghost       │
           │ Data     │ PO           │ Portions    │
 IMPACT    │ Tamper   │              │ Menu Swap   │
           ├──────────┼──────────────┼─────────────┤
    Medium │ Cyber    │ Price        │ Recycled    │
           │ Account  │ Inflation    │ Photos      │
           │ Takeover │ Kickback     │ Timestamp   │
           ├──────────┼──────────────┼─────────────┤
    Low    │ DDoS     │ Portion      │ Minor cert  │
           │          │ Diversion    │ expiry      │
           └──────────┴──────────────┴─────────────┘
```

---

## FASE 1: REGISTRASI & PERIZINAN

### F1.1 — Vendor Shell Company (Perusahaan Cangkang)

| | Detail |
|---|--------|
| **Modus** | Seseorang mendaftarkan badan usaha fiktif khusus untuk jadi vendor MBG, tanpa kapasitas nyata memasak |
| **Analogi** | Seperti "perusahaan kertas" di kasus korupsi proyek |
| **Sinyal Deteksi** | NIB baru dibuat < 3 bulan sebelum daftar; alamat usaha = rumah tinggal; tidak ada riwayat usaha katering; kapasitas klaim tidak realistis vs ukuran dapur |
| **Pencegahan** | ✅ **AI Risk Scoring saat registrasi** — model scoring berdasarkan: usia NIB, riwayat usaha, ratio kapasitas/luas dapur, cross-check KBLI (Klasifikasi Baku Lapangan Usaha) |
| **Implementasi** | Input field registrasi → backend scoring service → skor < threshold → otomatis masuk queue "manual review" oleh admin BGN |
| **Severity** | 🔴 Tinggi — bisa menyebabkan kegagalan layanan dan kerugian besar |

### F1.2 — Straw Man Vendor (Vendor Boneka)

| | Detail |
|---|--------|
| **Modus** | Oknum pejabat daerah, tim sukses, atau pengusaha besar mendaftarkan orang lokal sebagai "vendor" tapi sebenarnya dikendalikan oleh mereka. Keuntungan mengalir ke dalang |
| **Analogi** | Kasus yang ditemukan Ombudsman RI — afiliasi politik dalam pengelolaan dapur MBG |
| **Sinyal Deteksi** | Beberapa vendor terdaftar dari nomor HP/email/IP yang sama; rekening bank atas nama orang lain; pola login identik |
| **Pencegahan** | ✅ **Deduplication Engine** — cross-check: nomor HP, email, IMEI device, IP address, nomor rekening, alamat, NIB saat registrasi |
| **Implementasi** | Saat registrasi → query database vendor existing untuk similarity match → flag jika > 3 data point overlap |
| **Severity** | 🔴 Tinggi — melanggar prinsip pelibatan UMKM lokal |

### F1.3 — Sertifikat Palsu/Expired

| | Detail |
|---|--------|
| **Modus** | Upload sertifikat SLHS, Halal, BPOM, PIRT yang sudah expired, dipalsukan, atau milik badan usaha lain |
| **Sinyal Deteksi** | Nomor sertifikat tidak valid format; tanggal expired sudah lewat; nama badan usaha di sertifikat ≠ nama pendaftar; resolusi foto terlalu rendah (scan scan-an) |
| **Pencegahan** | ✅ **OCR + Cross-Validation** |
| **Implementasi** | (1) OCR extract nomor + tanggal + nama dari foto sertifikat → (2) Validasi format nomor (regex per jenis sertifikat) → (3) Compare nama di sertifikat vs nama di form → (4) Check expiry → (5) Hash sertifikat ke blockchain → (6) Cron job auto-flag 30 hari sebelum expired |
| **Severity** | 🔴 Tinggi — 1.030 SPPG ditutup karena masalah perizinan |

### F1.4 — Foto Dapur Pinjaman

| | Detail |
|---|--------|
| **Modus** | Saat verifikasi fisik, vendor memfoto dapur milik orang lain yang sudah lulus standar. Dapur asli tidak memenuhi syarat |
| **Sinyal Deteksi** | GPS foto tidak match dengan alamat terdaftar; foto dapur identik dengan vendor lain; metadata EXIF menunjukkan device berbeda dari biasanya |
| **Pencegahan** | ✅ **GPS Geofencing + Photo Fingerprinting** |
| **Implementasi** | (1) Foto wajib diambil via PWA (bukan gallery) → enforced camera-only → (2) GPS embedded di metadata → (3) Harus dalam radius 200m dari alamat vendor → (4) pHash foto disimpan → (5) Compare dengan database foto dapur semua vendor → (6) Similarity > 90% = flagged |
| **Severity** | 🟡 Sedang |

---

## FASE 2: PROCUREMENT (PENGADAAN)

### F2.1 — Price Inflation (Mark-up Harga)

| | Detail |
|---|--------|
| **Modus** | Vendor beli bahan di atas harga pasar, baik karena kolusi dengan supplier atau karena tidak ada pembanding |
| **Sinyal Deteksi** | Harga PO > 120% dari median harga produk sejenis di platform; harga konsisten di atas pasar tanpa justifikasi (misal: lokasi remote = wajar lebih mahal) |
| **Pencegahan** | ✅ **Dynamic Price Index + Alert** |
| **Implementasi** | (1) Maintain running median/mean per product category per region → (2) Saat vendor create PO → compare harga → (3) > 120% median → warning di UI + alert admin → (4) > 150% median → block PO, butuh approval manual → (5) Faktor koreksi untuk daerah remote (cost adjustment per kabupaten) |
| **Severity** | 🟡 Sedang — bisa signifikan jika sistematis |

### F2.2 — Fictitious PO (PO Fiktif)

| | Detail |
|---|--------|
| **Modus** | Vendor dan supplier sepakat bikin PO palsu. Bahan tidak pernah dikirim/diterima. Dana tetap diklaim |
| **Sinyal Deteksi** | PO tanpa CP1 foto bahan diterima; supplier tidak submit proof of delivery; GPS vendor dan supplier tidak pernah di lokasi yang sama pada hari delivery; PO dibuat dan di-confirm dalam waktu < 5 menit (tidak realistis) |
| **Pencegahan** | ✅ **Multi-Signal Verification Gate** |
| **Implementasi** | PO status `delivered` butuh **4 sinyal independen**: (1) Supplier submit foto pengiriman + GPS gudang → (2) Vendor submit foto penerimaan CP1 + GPS dapur → (3) Timestamp selisih logis (supplier kirim jam 04:00, vendor terima jam 05:30 = masuk akal, jarak 30km) → (4) Foto bahan match dengan jenis produk di PO (Vision AI). Jika < 3 dari 4 sinyal terpenuhi → PO **tidak bisa di-close**, eskalasi otomatis |
| **Severity** | 🔴 Tinggi |

### F2.3 — Kickback Scheme (Suap Supplier)

| | Detail |
|---|--------|
| **Modus** | Vendor selalu pilih Supplier X meskipun lebih mahal. Supplier X kasih "komisi" ke vendor di luar platform — 5-10% dari nilai PO |
| **Sinyal Deteksi** | Vendor A membeli dari Supplier B > 80% of total PO selama 3 bulan, meskipun ada 5+ supplier alternatif di radius yang sama dengan harga lebih rendah |
| **Pencegahan** | ✅ **Supplier Concentration Alert** |
| **Implementasi** | (1) Hitung % PO per vendor per supplier per bulan → (2) Jika 1 supplier > 70% dan ada alternatif lebih murah dalam radius → alert → (3) Dashboard admin menampilkan "concentration risk" per vendor → (4) Rekomendasi AI: "Supplier C menawarkan produk serupa 12% lebih murah dan 4.5★ rating" |
| **Severity** | 🟡 Sedang |

### F2.4 — Short Delivery (Kiriman Kurang)

| | Detail |
|---|--------|
| **Modus** | PO menyebut 50kg ayam, supplier kirim 40kg. Vendor tidak berani komplain karena ketergantungan. Atau: vendor dan supplier sama-sama tahu, selisih dibagi |
| **Sinyal Deteksi** | Foto timbangan di CP1 menunjukkan angka yang tidak match dengan qty PO |
| **Pencegahan** | ✅ **OCR Timbangan + Weight Validation** |
| **Implementasi** | (1) CP1 wajib foto timbangan digital → (2) AI OCR baca angka di timbangan → (3) Compare dengan qty di PO → (4) Toleransi ±5% → (5) Selisih > 5% → auto-flag + vendor diminta konfirmasi (terima/dispute). Dispute otomatis eskalasi ke admin BGN |
| **Severity** | 🟡 Sedang |

### F2.5 — Bait & Switch (Ganti Kualitas)

| | Detail |
|---|--------|
| **Modus** | PO untuk "Ayam Fillet Grade A", supplier kirim "Ayam Potong biasa" yang lebih murah. Selisih margin masuk ke supplier |
| **Sinyal Deteksi** | Foto bahan di CP1 tidak sesuai dengan deskripsi produk di PO |
| **Pencegahan** | ✅ **Vision AI Product Matching** |
| **Implementasi** | (1) Setiap produk di katalog punya reference photo → (2) CP1 foto bahan diterima → (3) Vision AI compare dengan product reference → (4) Mismatch tinggi → flag + vendor diminta konfirmasi → (5) Pattern: supplier X sering di-flag bait&switch → auto-suspend listing |
| **Severity** | 🟡 Sedang |

---

## FASE 3: PRODUKSI (MEMASAK)

### F3.1 — Ghost Portions (Porsi Hantu)

| | Detail |
|---|--------|
| **Modus** | Vendor klaim masak 650 porsi, sebenarnya hanya 400. Selisih 250 porsi × Rp15.000 = Rp3.750.000/hari = **Rp750 juta/tahun per vendor** |
| **Sinyal Deteksi** | Foto CP3 menunjukkan jumlah wadah yang jauh lebih sedikit dari klaim; rasio bahan yang dibeli vs porsi yang dilaporkan tidak masuk akal |
| **Pencegahan** | ✅ **Multi-layer Verification** |
| **Implementasi** | Layer 1: **Vision AI** — hitung jumlah wadah/kontainer di foto CP3 → compare dengan porsi yang diklaim → selisih > 15% = flag. Layer 2: **Material Balance** — kg bahan dibeli (dari PO) ÷ gr per porsi (dari resep menu) = estimasi max porsi yang bisa dimasak → jika klaim > estimasi = flag. Layer 3: **School Confirmation** — sekolah konfirmasi jumlah porsi diterima → jika < klaim = flag. Layer 4: **Blockchain** — jumlah porsi yang lolos semua layer = jumlah yang eligible untuk pembayaran. Dana release hanya untuk porsi terverifikasi |
| **Severity** | 🔴 Sangat Tinggi — fraud paling umum dan berdampak paling besar |

### F3.2 — Menu Substitution (Ganti Menu)

| | Detail |
|---|--------|
| **Modus** | Plan menu Nasi Ayam Teriyaki (food cost Rp9.000), tapi masak Nasi Goreng Telur (food cost Rp4.000). Dana tetap cair sesuai menu mahal |
| **Sinyal Deteksi** | Foto makanan jadi di CP3 tidak match visual menu yang di-plan |
| **Pencegahan** | ✅ **Vision AI Menu Matching** |
| **Implementasi** | (1) Setiap menu yang di-plan punya expected visual profile → (2) Foto CP3 → Vision AI classify jenis makanan → (3) Compare dengan menu hari ini → (4) Mismatch → flag + toast: "Menu terdaftar: Ayam Teriyaki. Terdeteksi: Nasi Goreng." → (5) Vendor bisa submit justification (misal: ayam habis di pasar, ganti mendadak — admin review) |
| **Severity** | 🔴 Tinggi |

### F3.3 — Porsi Under-size

| | Detail |
|---|--------|
| **Modus** | Wadah diisi setengah, bukan penuh sesuai standar porsi PMK. Anak dapat makan lebih sedikit dari yang seharusnya |
| **Sinyal Deteksi** | Foto CP3 menunjukkan wadah terisi < 80% |
| **Pencegahan** | ✅ **Vision AI Fill-level Analysis** |
| **Implementasi** | (1) Foto wadah dari atas → (2) AI estimate fill-level percentage → (3) < 80% → warning → (4) < 60% → auto-flag + penalti → (5) Reference: foto "porsi standar" dari SOP sebagai baseline training |
| **Severity** | 🟡 Sedang — tidak finansial tapi berdampak nutrisi anak |

### F3.4 — Recycled Photos (Foto Daur Ulang)

| | Detail |
|---|--------|
| **Modus** | Vendor simpan foto kemarin → upload lagi hari ini. Atau: download foto makanan dari internet |
| **Sinyal Deteksi** | Hash foto identik/mirip dengan foto sebelumnya; metadata EXIF tidak konsisten; foto resolusi terlalu tinggi/professional (stock photo) |
| **Pencegahan** | ✅ **Multi-layer Photo Authentication** |
| **Implementasi** | Layer 1: **Perceptual Hash** — pHash setiap foto → compare dengan semua foto vendor ini dalam 30 hari → similarity > 92% = reject. Layer 2: **EXIF Check** — timestamp, GPS, device model harus konsisten → foto dari gallery = reject, harus live camera via PWA. Layer 3: **Steganographic Watermark** — PWA inject invisible watermark (tanggal+vendor_id) saat capture → server verify watermark ada dan match. Layer 4: **Reverse Image Search** — check apakah foto ada di Google Images (anti stock-photo) |
| **Severity** | 🔴 Tinggi |

### F3.5 — Makanan Tidak Layak Konsumsi

| | Detail |
|---|--------|
| **Modus** | Vendor kirim makanan mentah, basi, terkontaminasi, atau tidak higienis. Bisa karena lalai atau sengaja menghemat biaya |
| **Analogi** | Kasus nyata: lele mentah, makanan berbelatung, makanan basi di beberapa SPPG |
| **Sinyal Deteksi** | Visual: warna tidak normal, tekstur mencurigakan, ada kontaminan visible |
| **Pencegahan** | ✅ **Vision AI Food Safety Check** |
| **Implementasi** | (1) Foto CP3 → Vision AI analisis: warna makanan (brownish = OK, greenish = suspect), tekstur (smooth vs slimy), kebersihan wadah → (2) Score 0-100 → (3) < 70 = warning + mandatory human review → (4) < 40 = auto-reject + immediate alert ke admin BGN + alert ke sekolah: "JANGAN distribusikan" → (5) Repeat offender 3x dalam sebulan → auto-suspend vendor |
| **Severity** | 🔴 Sangat Tinggi — berdampak langsung pada kesehatan anak |

---

## FASE 4: DISTRIBUSI & SERAH TERIMA

### F4.1 — Fake Location (Lokasi Palsu)

| | Detail |
|---|--------|
| **Modus** | Vendor submit foto checkpoint dari lokasi berbeda (bukan dapur atau bukan sekolah tujuan). GPS dipalsukan via mock location app |
| **Pencegahan** | ✅ **Anti-Spoofing GPS** |
| **Implementasi** | (1) Deteksi mock location API di device → jika enabled → reject capture → (2) Triangulasi: GPS + cell tower + WiFi BSSID → jika tidak konsisten → flag → (3) Geofence: CP1-CP3 harus dalam 200m dari alamat dapur, CP4 harus dalam 200m dari alamat sekolah → (4) Historical baseline: jika vendor biasanya di titik A tapi hari ini di titik B yang jauhnya 50km → warning |
| **Severity** | 🟡 Sedang |

### F4.2 — Timestamp Manipulation

| | Detail |
|---|--------|
| **Modus** | Vendor submit semua checkpoint sekaligus di malam hari, bukan real-time sepanjang proses. Artinya proses sebenarnya tidak terjadi sesuai prosedur |
| **Pencegahan** | ✅ **Server-side Time Windows** |
| **Implementasi** | (1) **Gunakan server timestamp, bukan client** → (2) Time windows: CP1 (03:00-06:00), CP2 (05:00-08:00), CP3 (07:00-10:00), CP4 (09:00-12:00) → (3) Jeda minimum antar CP: 45 menit → (4) Submit di luar window → reject + flag → (5) Pattern: vendor sering submit di menit terakhir window → monitoring flag |
| **Severity** | 🟡 Sedang |

### F4.3 — Fake School Confirmation

| | Detail |
|---|--------|
| **Modus** | Sekolah dan vendor berkolusi — sekolah mengonfirmasi terima makanan padahal belum/tidak sampai |
| **Pencegahan** | ✅ **Independent Multi-party Evidence** |
| **Implementasi** | Konfirmasi valid harus punya **4 bukti independen**: (1) Vendor foto di sekolah (GPS match) → (2) Sekolah scan QR unik (QR berubah tiap hari, tidak bisa dikirim via chat) → (3) Vendor dan sekolah harus di GPS yang sama ± 10 menit → (4) Random spot check: AI call ke nomor HP guru yang di-register untuk verify via IVR (Interactive Voice Response) — "Apakah makanan sudah diterima? Tekan 1 untuk ya, 2 untuk belum" |
| **Severity** | 🔴 Tinggi |

### F4.4 — Delivery Route Fraud

| | Detail |
|---|--------|
| **Modus** | Vendor klaim kirim ke 5 sekolah, sebenarnya cuma 3. Klaim transport fee untuk 5 |
| **Pencegahan** | ✅ **GPS Trail Verification** |
| **Implementasi** | (1) PWA track GPS route selama jam delivery → (2) Auto-detect stop points → (3) Compare stop points dengan alamat sekolah yang di-assign → (4) Missing school = belum delivery = dana hold → (5) Tampilkan route map di dashboard admin untuk visual audit |
| **Severity** | 🟡 Sedang |

---

## FASE 5: KEUANGAN & PEMBAYARAN

### F5.1 — Double Claiming (Klaim Ganda)

| | Detail |
|---|--------|
| **Modus** | Vendor submit klaim pembayaran dua kali untuk hari yang sama — bug atau sengaja |
| **Pencegahan** | ✅ **Idempotency Guard** |
| **Implementasi** | (1) Unique constraint: 1 klaim = 1 vendor + 1 tanggal → (2) Smart contract escrow: dana per hari sudah di-lock → tidak bisa release dua kali → (3) Database unique index pada (vendor_id, date, school_id) |
| **Severity** | 🟡 Sedang |

### F5.2 — Invoice Inflation

| | Detail |
|---|--------|
| **Modus** | Vendor menaikkan total invoice di atas nilai PO yang sebenarnya. Atau: memasukkan biaya fiktif (transport, packaging) |
| **Pencegahan** | ✅ **Auto-generated Invoice** |
| **Implementasi** | Invoice **tidak dibuat manual** oleh vendor. Sistem auto-generate berdasarkan: (1) PO yang sudah confirmed → (2) Porsi yang terverifikasi AI → (3) Tarif per porsi yang sudah fixed di kontrak → (4) Deduction untuk penalti → (5) Blockchain hash invoice = immutable. DB trigger `auto_generate_invoice()` sudah ada di migration! |
| **Severity** | 🟡 Sedang |

### F5.3 — Rekening Bank Fraud

| | Detail |
|---|--------|
| **Modus** | Vendor daftarkan rekening atas nama orang lain, atau rekening yang dikendalikan pihak ketiga |
| **Pencegahan** | ✅ **Bank Account Verification** |
| **Implementasi** | (1) Nama pemilik rekening harus match dengan nama di NIB → (2) API verification via BI SNAP API (if available) → (3) Satu rekening hanya bisa terdaftar untuk 1 vendor → (4) Perubahan rekening butuh: upload foto buku tabungan + approval admin + cooldown 14 hari |
| **Severity** | 🟡 Sedang |

---

## FASE 6: FRAUD SISTEMIK & TERORGANISIR

### F6.1 — Vendor Ring (Kartel Vendor)

| | Detail |
|---|--------|
| **Modus** | Grup vendor koordinasi: rotasi siapa yang benar-benar masak, sisanya submit foto palsu. Keuntungan dibagi. Atau: satu orang operasikan banyak "vendor" |
| **Sinyal Deteksi** | Beberapa vendor submit foto dari device yang sama (IMEI); login patterns identik; foto background dapur identik meskipun alamat berbeda; transfer antar rekening vendor saling bersilangan |
| **Pencegahan** | ✅ **Network Analysis** |
| **Implementasi** | (1) Graph database: node = vendor, edge = shared signals (device, IP, photo similarity, bank transfer) → (2) Cluster detection: jika 3+ vendor share 2+ signals → flag sebagai "suspected ring" → (3) Dashboard admin: visual network graph → (4) Automatic deep-audit trigger |
| **Severity** | 🔴 Sangat Tinggi — bisa involve ratusan juta per ring |

### F6.2 — Inspector Corruption

| | Detail |
|---|--------|
| **Modus** | Inspektur BGN approve vendor tanpa visiting, atau approve meskipun tidak layak — karena suap |
| **Pencegahan** | ✅ **Evidence-based Approval** |
| **Implementasi** | (1) Inspeksi harus submit: ≥ 10 foto dapur (GPS-tagged, timestamp, landmark berbeda) + video 30 detik walk-through → (2) AI verify: apakah 10 foto dari lokasi yang sama? Apakah menunjukkan area berbeda? → (3) Blockchain hash semua evidence → (4) Random re-inspection: 10% vendor di-audit ulang oleh inspektur berbeda → (5) Compare hasil: jika inspektur A selalu pass tapi re-inspection menunjukkan fail → flag inspektur A |
| **Severity** | 🔴 Tinggi |

### F6.3 — Admin Data Manipulation

| | Detail |
|---|--------|
| **Modus** | Admin platform mengubah skor vendor, menghapus penalti, atau memanipulasi data dashboard sebelum laporan ke BPKP |
| **Pencegahan** | ✅ **Blockchain Immutability + Multi-sig** |
| **Implementasi** | (1) Setiap skor, penalti, PO → hash ke blockchain real-time → (2) End-of-day: merkle root seluruh data hari itu → simpan ke chain → (3) Perubahan data retroaktif: harus melalui multi-approval (min 2 admin) + alasan tertulis + log di blockchain → (4) Public verifier: siapa saja bisa compare hash di chain vs data di DB → mismatch = tampered |
| **Severity** | 🔴 Tinggi |

---

## FASE 7: KEAMANAN DIGITAL

### F7.1 — Account Takeover

| | Detail |
|---|--------|
| **Modus** | Hacker ambil alih akun vendor → submit checkpoint palsu → cairkan dana ke rekening yang sudah diganti |
| **Pencegahan** | ✅ **Multi-factor + Anomaly Detection** |
| **Implementasi** | (1) 2FA wajib untuk vendor (OTP via SMS/WhatsApp) → (2) Device binding: akun hanya bisa diakses dari max 2 device → (3) Login anomaly: IP/lokasi baru → force re-auth → (4) Perubahan rekening bank = cooldown 14 hari + approval admin → (5) Alert ke vendor via SMS jika ada login dari device baru |
| **Severity** | 🟡 Sedang |

### F7.2 — API Manipulation

| | Detail |
|---|--------|
| **Modus** | Vendor atau developer nakal bypass frontend, langsung hit API untuk submit checkpoint tanpa foto yang valid |
| **Pencegahan** | ✅ **Server-side Validation** |
| **Implementasi** | (1) Semua validasi (GPS, timestamp, photo hash) dilakukan di server, bukan client → (2) Rate limiting per endpoint → (3) Foto minimum file size 100KB (anti blank/tiny image) → (4) Photo must contain EXIF data → (5) API request signing dengan device-specific token |
| **Severity** | 🟡 Sedang |

---

## Implementation Priority untuk Hackathon

| Layer | Fraud yang Dicegah | Effort | Demo Impact |
|-------|-------------------|--------|-------------|
| **Vision AI Checkpoint** | Ghost portions, recycled photos, menu swap, food safety, under-size, bait & switch | 3-5 hari | ⭐⭐⭐⭐⭐ |
| **GPS Geofencing** | Fake location, fake confirmation, delivery route | 1-2 hari | ⭐⭐⭐⭐ |
| **Blockchain Audit** | Data tamper, admin manipulation, invoice fraud, double claim | 2-3 hari | ⭐⭐⭐⭐ |
| **OCR Document Verify** | Fake/expired certs | 2-3 hari | ⭐⭐⭐⭐ |
| **Smart Contract Escrow** | Ghost portions (dana), PO fiktif | 2-3 hari | ⭐⭐⭐⭐ |
| **Time Window Rules** | Timestamp manipulation | 0.5 hari | ⭐⭐⭐ |
| **Price Index Engine** | Price inflation, kickback | 1-2 hari | ⭐⭐⭐ |
| **Deduplication Engine** | Shell company, straw man, vendor ring | 1-2 hari | ⭐⭐⭐ |
| **Photo Authentication** | Recycled photos, stock photos | 1 hari | ⭐⭐⭐ |
| **Network Analysis** | Vendor ring, collusion | 3-5 hari | ⭐⭐ |

---

## Satu Kalimat untuk Pitch

> *"Platform kami bukan sekadar dashboard — kami adalah **sistem imun digital** untuk program MBG senilai Rp71 Triliun. Setiap porsi makanan diverifikasi AI, setiap rupiah dilacak blockchain, dan setiap anomali terdeteksi sebelum menjadi kerugian negara."*
