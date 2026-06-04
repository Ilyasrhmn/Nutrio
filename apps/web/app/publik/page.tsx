"use client"

import * as React from "react"
import { api } from "../../lib/api-client"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Search, ShieldCheck, TrendingUp, Users, Utensils, Hash, ChevronRight, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface Overview {
  totalActiveVendors: number
  totalPorsiToday: number
  vendorsExcellent: number
  confirmationsToday: number
}

interface SppgCard {
  id: string
  name: string
  score: number
  targetPorsi: number
  schoolCount: number
}

interface SppgDetail {
  id: string
  name: string
  score: number
  targetPorsi: number
  scoreHistory30d: { date: string; score: number }[]
}

export default function PublikPage() {
  const [overview, setOverview] = React.useState<Overview | null>(null)
  const [results, setResults] = React.useState<SppgCard[]>([])
  const [detail, setDetail] = React.useState<SppgDetail | null>(null)
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [searching, setSearching] = React.useState(false)

  React.useEffect(() => {
    Promise.all([
      api.get<Overview>("/public/overview").catch(() => null),
      api.get<SppgCard[]>("/public/sppg/search?limit=12").catch(() => null),
    ]).then(([ov, rs]) => {
      if (ov) setOverview(ov)
      if (rs) setResults(rs)
      setLoading(false)
    })
  }, [])

  // Debounced search
  React.useEffect(() => {
    if (!query && results.length > 0) return
    const t = setTimeout(async () => {
      setSearching(true)
      const rs = await api.get<SppgCard[]>(`/public/sppg/search?q=${encodeURIComponent(query)}&limit=20`).catch(() => null)
      if (rs) setResults(rs)
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const openDetail = async (id: string) => {
    const d = await api.get<SppgDetail>(`/public/sppg/${id}`).catch(() => null)
    if (d) setDetail(d)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-black">Nutrio · Dashboard Publik</h1>
              <p className="text-xs text-slate-500">Transparansi Program Makan Bergizi Gratis</p>
            </div>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
              <Loader2 className="size-4 animate-spin" /> Memuat data...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { icon: <Users className="size-5 text-primary" />, label: "SPPG Aktif", value: overview?.totalActiveVendors ?? 0 },
                { icon: <Utensils className="size-5 text-green-600" />, label: "Porsi Hari Ini", value: (overview?.totalPorsiToday ?? 0).toLocaleString("id-ID") },
                { icon: <TrendingUp className="size-5 text-emerald-600" />, label: "Performa Excellent", value: overview?.vendorsExcellent ?? 0 },
                { icon: <ShieldCheck className="size-5 text-blue-600" />, label: "Konfirmasi Sekolah", value: overview?.confirmationsToday ?? 0 },
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm shrink-0">{s.icon}</div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
                    <p className="text-xl font-black">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)}
            className="pl-11 h-12 rounded-2xl text-sm bg-white shadow-sm"
            placeholder="Cari nama SPPG..." />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* SPPG Grid */}
        {results.length === 0 && !loading ? (
          <div className="text-center py-12">
            <AlertCircle className="size-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Tidak ada SPPG ditemukan</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(s => (
              <button key={s.id} onClick={() => openDetail(s.id)}
                className="text-left bg-white rounded-2xl border p-4 hover:border-primary/40 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-bold leading-tight line-clamp-2">{s.name}</p>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-primary shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full",
                      s.score >= 80 ? "bg-green-500" : s.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                    )} style={{ width: `${s.score}%` }} />
                  </div>
                  <span className={cn("text-sm font-black shrink-0",
                    s.score >= 80 ? "text-green-600" : s.score >= 60 ? "text-yellow-600" : "text-red-600"
                  )}>{s.score}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span><span className="font-bold text-slate-600">{s.targetPorsi}</span> porsi</span>
                  <span><span className="font-bold text-slate-600">{s.schoolCount}</span> sekolah</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* How it works */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <Hash className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-blue-700 mb-1">Verifikasi Data Audit</p>
                <p className="text-xs text-blue-600/80 leading-relaxed">
                  Setiap debrief harian dilengkapi <strong>audit hash</strong> yang dapat diverifikasi.
                  Gunakan endpoint <code className="bg-blue-100 px-1 rounded text-[11px]">GET /api/public/verify/:hash</code> untuk memastikan keaslian data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SPPG Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Profil Publik SPPG</p>
                <h2 className="text-lg font-black mt-0.5">{detail.name}</h2>
              </div>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => setDetail(null)}>✕</Button>
            </div>
            <div className="p-6 space-y-5">
              {/* Score */}
              <div className={cn("rounded-2xl p-5 text-center",
                detail.score >= 80 ? "bg-green-50" : detail.score >= 60 ? "bg-yellow-50" : "bg-red-50"
              )}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Skor Hari Ini</p>
                <p className={cn("text-5xl font-black mt-1",
                  detail.score >= 80 ? "text-green-600" : detail.score >= 60 ? "text-yellow-600" : "text-red-600"
                )}>{detail.score}</p>
                <Badge className={cn("mt-2 text-xs font-bold border-none",
                  detail.score >= 80 ? "bg-green-100 text-green-700" : detail.score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                )}>
                  {detail.score >= 80 ? "EXCELLENT" : detail.score >= 60 ? "CUKUP" : "PERLU PERBAIKAN"}
                </Badge>
              </div>

              {/* Score trend */}
              {detail.scoreHistory30d.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Tren Skor 30 Hari</p>
                  <div className="flex items-end gap-1 h-16">
                    {detail.scoreHistory30d.slice(-20).map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end" title={`${h.date}: ${h.score}`}>
                        <div className={cn("rounded-sm w-full transition-all",
                          h.score >= 80 ? "bg-green-400" : h.score >= 60 ? "bg-yellow-400" : "bg-red-400"
                        )} style={{ height: `${Math.round(h.score * 0.6)}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Target Porsi:</span>
                <span className="font-bold">{detail.targetPorsi.toLocaleString("id-ID")} porsi/hari</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
