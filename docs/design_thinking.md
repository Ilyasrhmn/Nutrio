Ini insight paling kritis yang gue butuhkan. Mari kita mulai auditnya.

---

## Design Thinking Audit — Nutrio (Fokus: Vendor & Calon Vendor)

---

### EMPATHIZE — Siapa sebenarnya mereka?

Gue reconstruct dua persona dari konteks yang ada:

**Persona 1: Calon Vendor "Bu Ratna"**
> Punya katering rumahan 5 tahun, mau daftar jadi SPPG. Tidak punya staf admin, semua diurus sendiri. Pertama kali dengar soal SLHS, NKV, BPOM dari grup WhatsApp sesama pengusaha. Sudah ke kantor dinas sekali, disuruh balik lagi karena dokumen kurang.

Apa yang dia rasakan:
- Overwhelmed: "Ternyata banyak sekali syaratnya"
- Tidak yakin: "Ini dokumen yang bener gak ya?"
- Takut salah: "Kalau ditolak, apa bisa daftar ulang?"
- Tidak punya reference point: Tidak ada vendor lain yang bisa jadi template

**Persona 2: Vendor Aktif "Pak Hendra"**
> Sudah 3 bulan jadi SPPG, punya 4 staf dapur. Setiap hari masak untuk 300 porsi. Beberapa kali kena penalti tapi tidak tahu alasannya. Staf-nya kadang lupa foto karena sibuk masak. Dana sering cair terlambat dan jumlahnya berbeda-beda.

Apa yang dia rasakan:
- Frustrasi: "Saya sudah ikuti aturan tapi tetap kena penalti"
- Tidak berdaya: "Staf saya susah disuruh foto-foto, mereka sibuk"
- Tidak predictable: "Tidak tahu dapat berapa bulan ini"
- Disconnected: "BGN minta ini itu tapi tidak ada yang jelasin kenapa"

---

### DEFINE — Problem Statement yang Sebenarnya

Ini bagian paling penting dari audit ini, dan ini yang **berbeda dari assumption awal kamu.**

> ❌ **Assumption lama:** "Vendor tidak patuh karena tidak ada sistem digital."
>
> ✅ **Problem statement yang benar:** "Vendor tidak patuh karena mereka tidak pernah benar-benar **mengerti** apa yang diminta, **kenapa** itu diminta, dan **apa konsekuensinya** — dan platform yang ada saat ini pun tidak menjelaskan itu."

Ini perbedaan besar. Kalau problem-nya adalah "tidak ada sistem", maka solusinya adalah "buat sistem." Tapi kalau problem-nya adalah "tidak mengerti + tidak ada feedback loop", maka sistem yang dibangun harus **mengajarkan sambil mengoperasikan.**

**3 Root Cause:**

| # | Root Cause | Manifestasi di Lapangan |
|---|-----------|------------------------|
| 1 | **Regulation is written for bureaucrats, not vendors** | Juknis BGN pakai bahasa hukum, vendor tidak paham |
| 2 | **No just-in-time guidance** | Vendor baru tahu salah setelah kena penalti, bukan sebelumnya |
| 3 | **Staff ≠ Owner** | Owner bisa paham aturan, tapi yang eksekusi di dapur adalah staf yang belum pernah baca aturan apapun |

---

### IDEATE — Gap Analysis antara Platform Saat Ini vs. Kebutuhan Nyata

Gue cross-reference halaman yang sudah ada dengan kebutuhan nyata vendor:

**Gap 1: Calon Vendor tidak tahu "di mana mulai"**

Saat ini platform punya form registrasi 3-step. Tapi masalahnya bukan form-nya — masalahnya adalah **sebelum isi form pun, vendor sudah bingung.** Mereka tidak tahu:
- Apakah mereka eligible?
- Dokumen apa yang harus disiapkan dulu?
- Berapa lama prosesnya?
- Apa yang terjadi setelah submit?

Platform sekarang langsung loncat ke "isi form" tanpa **pre-flight checklist** dan **expectation setting.**

**Gap 2: SOP halaman terpisah = tidak pernah dibaca**

`/portal/sop` adalah halaman tersendiri. Ini adalah design anti-pattern klasik untuk user dengan literasi digital rendah. Manual yang terpisah tidak pernah dibaca. SOP harus **embedded di titik keputusan** — muncul tepat saat vendor butuh, bukan di halaman lain.

**Gap 3: Daily loop terlalu banyak navigasi untuk "orang baru digital"**

Untuk menyelesaikan satu hari kerja, vendor harus navigasi ke: jadwal → menu → kalkulasi → marketplace → live → checkpoints. Itu **6 halaman berbeda** untuk user yang baru pertama kali pakai sistem digital. Setiap perpindahan halaman adalah potensi dropout.

**Gap 4: Staf dapur tidak punya interface mereka sendiri**

PWA sudah ada, tapi dari struktur direktorinya masih sangat generic. Staf dapur yang tugasnya cuma "foto CP1, foto CP2, foto CP3" harus navigasi interface yang sama dengan vendor owner yang ngurusin keuangan dan planning. **Interface yang terlalu kompleks untuk staf = foto checkpoint sering terlewat.**

**Gap 5: Scoring tidak transparan = vendor merasa "dipermainkan"**

`/portal/checkpoints` ada, tapi jika scoring-nya tidak real-time dan tidak ada penjelasan "kenapa skor kamu -10 hari ini," maka vendor tidak bisa memperbaiki perilakunya. Mereka hanya tau hasilnya, bukan prosesnya.

---

### 3 Pendekatan Design Direction

Berdasarkan audit di atas, ada 3 arah yang bisa kamu ambil:

---

**Pendekatan A: "Compliance Dashboard"**
> Platform tetap multi-page tapi diperkuat dengan notifikasi, in-page tooltip, dan status indicator.

Pros: Effort rendah, tidak perlu redesign besar, bisa dibangun di atas yang sudah ada.
Cons: Tidak menyelesaikan root cause. User masih harus navigasi banyak halaman. Staf dapur masih pakai interface yang sama dengan owner. **Ini adalah pendekatan yang paling umum diambil kompetitor** — tapi tidak menyelesaikan masalah sebenarnya.

---

**Pendekatan B: "Guided Daily Mode" (rekomendasi gue)**
> Platform punya dua mode: **Setup Mode** (onboarding/perizinan) dan **Daily Mode** (operasional harian). Daily Mode adalah wizard linear yang memandu vendor step-by-step setiap hari, dengan SOP embedded di setiap langkah.

```
Daily Mode:
[MULAI HARI INI] → CP1 Terima Bahan → CP2 Masak → CP3 Siap Kirim → CP4 Serah Terima → [SELESAI + LIHAT SKOR]
```

Pros: Sesuai mental model vendor ("hari ini harus ngapain?"). SOP embedded bukan terpisah. Staf dapur bisa pakai PWA simplified yang cuma ada flow ini. Scoring real-time dengan penjelasan di setiap step. **Ini yang akan kelihatan "wow" di demo hackathon.**
Cons: Perlu redesign flow utama. Effort lebih besar.

---

**Pendekatan C: "Perizinan Wizard First"**
> Fokus utama pada calon vendor — buat onboarding perizinan yang sangat smooth, dengan document checklist, AI eligibility check, dan progress tracking yang jelas. Daily operations tetap seperti sekarang.

Pros: Menjawab satu pain point dengan sangat baik. Demo yang focused.
Cons: Hanya setengah dari value proposition platform. Vendor aktif masih punya masalah monitoring.

---

**Rekomendasi gue: Pendekatan B**, dengan elemen kunci dari A (tidak full redesign tapi optimize flows yang ada) dan sentuhan C untuk calon vendor onboarding.

---

Apakah arah **Pendekatan B — "Guided Daily Mode"** ini align dengan vision kamu, atau ada yang perlu direvisi sebelum gue lanjut ke detailed design?