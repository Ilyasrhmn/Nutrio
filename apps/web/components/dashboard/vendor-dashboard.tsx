"use client"

import React from "react"
import {
  CookingPot,
  Users,
  ShieldCheck,
  Package,
  CheckCircle2,
  Clock,
  Wallet,
  AlertTriangle
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

interface CheckpointEvent {
  id: string
  cpType: 'CP1' | 'CP2' | 'CP3' | 'CP4'
  cpStatus: 'pending' | 'in_progress' | 'done' | 'failed' | 'force_closed'
  completedAt: string | null
}

interface TodayScore {
  score: number
  targetPorsi?: number
}

const CP_LABELS: Record<string, string> = {
  CP1: 'Bahan Masuk',
  CP2: 'Proses Masak',
  CP3: 'Porsi Siap',
  CP4: 'Distribusi',
}

const CP_WINDOWS: Record<string, string> = {
  CP1: '06:00',
  CP2: '10:00',
  CP3: '12:00',
  CP4: '13:00',
}

export function VendorDashboard() {
  const [checkpoints, setCheckpoints] = React.useState<CheckpointEvent[]>([])
  const [scoreData, setScoreData] = React.useState<TodayScore | null>(null)
  const [targetPorsi, setTargetPorsi] = React.useState<number | null>(null)

  React.useEffect(() => {
    import("@/lib/api-client").then(({ api }) => {
      api.get<CheckpointEvent[]>('/checkpoints/today')
        .then((r) => setCheckpoints(r ?? []))
        .catch(() => {})
      api.get<TodayScore>('/scoring/today')
        .then((r) => setScoreData(r))
        .catch(() => {})
      api.get<{ targetPorsi?: number }[]>('/public/sppg/search?limit=1')
        .then((r) => setTargetPorsi((r[0] as any)?.targetPorsi ?? null))
        .catch(() => {})
    })
  }, [])

  const cpStatus = (cpType: string) => {
    const cp = checkpoints.find(c => c.cpType === cpType)
    if (!cp) return 'waiting'
    if (cp.cpStatus === 'done') return 'done'
    if (cp.cpStatus === 'in_progress') return 'current'
    return 'waiting'
  }

  const doneCount = checkpoints.filter(c => c.cpStatus === 'done').length

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">DAPUR OPERASIONAL</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Monitor kepatuhan masak dan estimasi pencairan dana hari ini.</p>
        </div>
        <div className="flex gap-3">
          <div className="text-right px-4 py-2 bg-slate-50 rounded-2xl border">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Dapur</p>
            <span className="text-sm font-black text-emerald-600 flex items-center gap-1 justify-end">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" /> TERVERIFIKASI
            </span>
          </div>
        </div>
      </div>

      {/* Production & Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-indigo-600 rounded-[32px] text-white space-y-4 shadow-xl shadow-indigo-100">
          <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Estimasi Pendapatan Hari Ini</p>
            <h3 className="text-2xl font-black">—</h3>
            <p className="text-[10px] text-indigo-200 mt-1">*Berdasarkan porsi terverifikasi AI</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="size-10 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Porsi</p>
            <h3 className="text-2xl font-black text-slate-900">{targetPorsi ?? '—'}</h3>
            <p className="text-[10px] text-slate-400 italic mt-1">Siswa Terdaftar</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="size-10 bg-emerald-50 flex items-center justify-center rounded-xl text-emerald-600">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skor Gizi AI</p>
            <h3 className="text-2xl font-black text-slate-900">{scoreData ? `${scoreData.score}/100` : '—'}</h3>
            <p className="text-[10px] text-slate-400 italic mt-1">Skor hari ini</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="size-10 bg-amber-50 flex items-center justify-center rounded-xl text-amber-600">
            <Package className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checkpoint Selesai</p>
            <h3 className="text-2xl font-black text-slate-900">{doneCount}/4</h3>
            <p className="text-[10px] text-slate-400 italic mt-1">Hari ini</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkpoint Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Timeline Kepatuhan (Checkpoints)</h3>
              <Badge variant="outline" className="bg-white font-bold text-indigo-600 border-indigo-100">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-4 relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
              {(['CP1', 'CP2', 'CP3', 'CP4'] as const).map((cpType, i) => {
                const status = cpStatus(cpType)
                return (
                  <div key={i} className="flex flex-col items-center text-center gap-3 relative z-10">
                    <div className={cn(
                      "size-10 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm transition-all",
                      status === 'done' ? "bg-emerald-500 text-white" :
                      status === 'current' ? "bg-indigo-600 text-white animate-pulse" : "bg-white text-slate-300"
                    )}>
                      {status === 'done' ? <CheckCircle2 className="size-5" /> : <span className="text-xs font-black">{cpType}</span>}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase">{CP_LABELS[cpType]}</p>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                        <Clock className="size-2" /> {CP_WINDOWS[cpType]}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily Menu */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 text-sm uppercase">Menu Harian</h3>
              <Button variant="ghost" size="sm" className="text-indigo-600 font-bold">Lihat Detail Resep</Button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-400 text-center py-4">Data menu akan tersedia setelah diisi di halaman Perencanaan Menu.</p>
            </div>
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <AlertTriangle className="size-20" />
            </div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <div className="size-2 bg-red-500 rounded-full animate-ping" /> Alert AI
            </h3>
            <div className="space-y-4">
              <p className="text-xs text-slate-400 text-center py-4">Tidak ada alert aktif hari ini.</p>
            </div>
            <Button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl h-12 shadow-xl shadow-indigo-950/50">
              Buka Panduan Juknis
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
