"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Loader2, CalendarClock, AlertTriangle } from "lucide-react"
import { useOperationDayCheck } from "@/hooks/use-operation-day-check"

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
  const { check, retry } = useOperationDayCheck()
  const ctx = CP_CONTEXT[cpId] ?? {
    title: `${cpId} — Checkpoint`,
    body: 'Ambil foto untuk checkpoint ini.',
    checklist: [],
  }

  if (check.status === "checking") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
        <p className="text-slate-300 text-sm">Memeriksa hari operasional...</p>
      </div>
    )
  }

  if (check.status === "no-menu-plan") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center" style={{ maxWidth: 480, margin: '0 auto' }}>
        <Card className="border-none shadow-sm w-full">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <CalendarClock className="h-7 w-7" />
            </div>
            <p className="font-bold text-slate-900">Rencana Menu Belum Dibuat</p>
            <p className="text-sm text-slate-500">
              Susun target porsi dan bahan hari ini di halaman Kalkulasi Bahan (portal web)
              sebelum memulai checkpoint.
            </p>
            <Button variant="outline" onClick={retry}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (check.status === "insufficient-inventory") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6" style={{ maxWidth: 480, margin: '0 auto' }}>
        <Card className="border-none shadow-sm w-full">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Stok Belum Cukup</p>
                <p className="text-sm text-slate-500">Kebutuhan menu hari ini melebihi stok tersedia.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {check.shortages.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-red-50 rounded-lg px-3 py-2">
                  <span className="text-red-700 font-medium">Kurang {s.shortage} {s.unit}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={retry} className="w-full">Sudah Belanja, Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (check.status === "error") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center gap-3" style={{ maxWidth: 480, margin: '0 auto' }}>
        <p className="text-sm text-red-300">{check.message}</p>
        <Button variant="outline" onClick={retry}>Coba Lagi</Button>
      </div>
    )
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
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">{cpId}</span>
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
        className="w-full h-14 text-base font-bold mt-8"
        onClick={() => router.push(`/cp/${cpId}/capture`)}
      >
        Mulai Foto →
      </Button>
    </div>
  )
}
