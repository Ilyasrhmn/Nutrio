"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"

const CP_CONTEXT: Record<string, { title: string; body: string; checklist: string[] }> = {
  CP1: {
    title: 'CP1 — Persiapan Masak',
    body: 'Foto kondisi dapur, bahan baku, dan area memasak sebelum mulai memasak. Pastikan semua bahan sudah siap dan area bersih.',
    checklist: ['Area dapur bersih', 'Bahan baku lengkap', 'Alat masak tersedia', 'APD dipakai'],
  },
  CP2: {
    title: 'CP2 — Selesai Masak',
    body: 'Foto hasil masakan yang sudah selesai. Tampilkan semua porsi yang siap dikemas. Pastikan makanan dalam kondisi baik.',
    checklist: ['Masakan selesai semua porsi', 'Suhu makanan aman', 'Penampilan sesuai standar'],
  },
  CP3: {
    title: 'CP3 — Siap Kirim',
    body: 'Foto kemasan yang sudah siap dikirim. Semua porsi sudah dikemas rapi dan diberi label. Token pengiriman akan dibuat setelah ini.',
    checklist: ['Semua porsi sudah dikemas', 'Label terpasang', 'Siap diserahkan ke kurir'],
  },
  CP4: {
    title: 'CP4 — Serah Terima',
    body: 'Foto proses serah terima ke sekolah. Pastikan kurir dan penerima di sekolah hadir. Foto harus menampilkan makanan dan penerima.',
    checklist: ['Kurir hadir', 'Penerima sekolah hadir', 'Jumlah porsi sesuai'],
  },
}

export default function CPContextPage() {
  const { cpId } = useParams<{ cpId: string }>()
  const router = useRouter()
  const ctx = CP_CONTEXT[cpId] ?? {
    title: `${cpId} — Checkpoint`,
    body: 'Ambil foto untuk checkpoint ini.',
    checklist: [],
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-6" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="flex-1">
        <button
          onClick={() => router.back()}
          className="text-slate-400 text-sm mb-6 flex items-center gap-1"
        >
          ← Kembali
        </button>

        <div className="mb-2">
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">{cpId}</span>
        </div>
        <h1 className="text-2xl font-bold mt-2 mb-4">{ctx.title}</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">{ctx.body}</p>

        <div className="space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Yang harus ada di foto:</p>
          {ctx.checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        className="w-full h-14 text-base font-bold bg-green-600 hover:bg-green-700 mt-8"
        onClick={() => router.push(`/cp/${cpId}/capture`)}
      >
        Mulai Foto →
      </Button>
    </div>
  )
}
