"use client"

import * as React from "react"
import Link from "next/link"
import {
  Package, ChefHat, BoxSelect, Truck,
  CheckCircle2, TrendingDown, Wallet,
  RefreshCw, Loader2, Zap, ExternalLink,
  Activity,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { api } from "../../../../lib/api-client"

interface ScoreEvent {
  id: string
  eventType: string
  scoreDelta: number
  reason: string
  regulationRef: string | null
  occurredAt: string
}

interface DailyScore {
  score: number
  disbursementEstimate: number
  events: ScoreEvent[]
}

interface CpEvent {
  cpType: "CP1" | "CP2" | "CP3" | "CP4"
  cpStatus: "pending" | "in_progress" | "done" | "failed" | "force_closed"
  completedAt: string | null
}

const CP_STEPS: Array<{ key: "CP1" | "CP2" | "CP3" | "CP4"; label: string; Icon: React.ElementType }> = [
  { key: "CP1", label: "Penerimaan", Icon: Package },
  { key: "CP2", label: "Produksi", Icon: ChefHat },
  { key: "CP3", label: "Pengemasan", Icon: BoxSelect },
  { key: "CP4", label: "Distribusi", Icon: Truck },
]

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-500" : "text-red-500"
  const bgColor = score >= 80 ? "bg-emerald-50" : score >= 60 ? "bg-amber-50" : "bg-red-50"
  const ringColor = score >= 80 ? "ring-emerald-100" : score >= 60 ? "ring-amber-100" : "ring-red-100"
  const label = score >= 80 ? "AMAN" : score >= 60 ? "PERINGATAN" : "KRITIS"
  const labelColor = score >= 80 ? "bg-emerald-100 text-emerald-700" : score >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"

  return (
    <div className={cn("flex flex-col items-center justify-center py-8 rounded-2xl ring-4", bgColor, ringColor)}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skor Real-Time</p>
      <p className={cn("text-7xl font-black leading-none tabular-nums", color)}>{score}</p>
      <p className="text-slate-400 text-sm mt-1.5 font-medium">/ 100</p>
      <Badge className={cn("mt-3 font-black text-xs uppercase tracking-widest border-none", labelColor)}>
        {label}
      </Badge>
    </div>
  )
}

export default function LivePage() {
  const [scoring, setScoring] = React.useState<DailyScore | null>(null)
  const [checkpoints, setCheckpoints] = React.useState<Partial<Record<string, CpEvent>>>({})
  const [loading, setLoading] = React.useState(true)
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)

  const today = new Date().toISOString().split("T")[0]!

  const fetchAll = React.useCallback(async () => {
    try {
      const [scoreData, cpData] = await Promise.allSettled([
        api.get<DailyScore>("/scoring/today"),
        api.get<CpEvent[]>("/checkpoints/today"),
      ])

      if (scoreData.status === "fulfilled" && scoreData.value) {
        setScoring(scoreData.value)
      }
      if (cpData.status === "fulfilled" && cpData.value) {
        const map: Partial<Record<string, CpEvent>> = {}
        for (const ev of cpData.value) map[ev.cpType] = ev
        setCheckpoints(map)
      }
      setLastUpdated(new Date())
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30_000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const doneCount = CP_STEPS.filter(s => checkpoints[s.key]?.cpStatus === "done").length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Activity className="size-6 text-primary" />
            Operasional Live
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={fetchAll}
            className="rounded-full font-bold text-sm gap-2 text-muted-foreground h-9"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          {lastUpdated && (
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>

      {/* Score gauge + disbursement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ScoreGauge score={scoring?.score ?? 100} />

        <Card className="rounded-2xl border-emerald-200 bg-emerald-50/50">
          <CardContent className="flex flex-col justify-center h-full py-8 px-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <Wallet className="size-5" />
              <p className="text-[10px] font-black uppercase tracking-widest">Estimasi Pencairan Dana</p>
            </div>
            <p className="text-3xl font-black text-emerald-700">
              Rp {(scoring?.disbursementEstimate ?? 0).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Berdasarkan skor × target porsi × tarif dasar MBG
            </p>
            {doneCount === 4 && (
              <Link href={`/portal/debrief/${today}`}>
                <Button variant="outline" className="rounded-full gap-2 font-bold text-xs h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-100 mt-1">
                  <ExternalLink className="size-3" />
                  Lihat Debrief
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CP Progress */}
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              Progress Checkpoint Hari Ini
            </CardTitle>
            <Link href="/portal/checkpoints">
              <Button variant="ghost" className="h-7 text-xs font-bold text-primary gap-1 px-2 rounded-full">
                Kelola <ExternalLink className="size-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            {CP_STEPS.map((step, i) => {
              const ev = checkpoints[step.key]
              const done = ev?.cpStatus === "done"
              const active = !done && (i === 0 || checkpoints[CP_STEPS[i - 1]!.key]?.cpStatus === "done")
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center border-2 transition-all mx-auto",
                      done && "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200",
                      active && "bg-primary/10 border-primary text-primary",
                      !done && !active && "bg-slate-100 border-slate-200 text-slate-300",
                    )}>
                      {done ? <CheckCircle2 className="size-5" /> : <step.Icon className="size-5" />}
                    </div>
                    <div className="text-center">
                      <p className={cn("text-[10px] font-black", done ? "text-emerald-600" : active ? "text-primary" : "text-slate-400")}>
                        {step.key}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium leading-tight">{step.label}</p>
                      {done && ev?.completedAt && (
                        <p className="text-[9px] text-emerald-500 font-bold">
                          {new Date(ev.completedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                  {i < 3 && (
                    <div className={cn("h-0.5 flex-1 rounded-full mb-6 transition-all", done ? "bg-emerald-400" : "bg-slate-200")} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
          <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
            {doneCount}/4 checkpoint selesai
          </p>
        </CardContent>
      </Card>

      {/* Scoring events */}
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <TrendingDown className="size-4 text-slate-500" />
            Riwayat Skor Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {!scoring?.events?.length ? (
            <div className="text-center py-6 text-slate-400">
              <p className="text-sm font-medium">Belum ada perubahan skor hari ini</p>
              <p className="text-xs mt-1 font-medium">Skor dimulai dari 100 dan berkurang jika ada penalti.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scoring.events.slice(0, 8).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className={cn(
                    "size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black",
                    ev.scoreDelta < 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600",
                  )}>
                    {ev.scoreDelta > 0 ? `+${ev.scoreDelta}` : ev.scoreDelta}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 leading-tight truncate">{ev.reason}</p>
                    {ev.regulationRef && (
                      <p className="text-[10px] text-slate-400 font-mono">{ev.regulationRef}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold shrink-0">
                    {new Date(ev.occurredAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
