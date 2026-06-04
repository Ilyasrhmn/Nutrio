"use client"

import * as React from "react"
import { api } from "../../../../lib/api-client"
import { bgnClient } from "../../../../lib/realtime-client"
import { TokenStorage } from "../../../../lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  AlertTriangle, Users, TrendingDown, Bell, Search,
  CheckCircle2, Clock, XCircle, ChevronRight, RefreshCw,
  Building2, Loader2,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface Overview {
  totalActive: number
  notStarted: number
  critical: number
  alertPending: number
}

interface AlertItem {
  id: string
  vendorId: string
  vendorName: string
  alertType: string
  severity: "critical" | "warning" | "info"
  title: string
  body: string
  vendorScore: number | null
  createdAt: string
}

interface VendorRow {
  vendorId: string
  vendorName: string
  score: number
  cpDone: number
  hasData: boolean
}

interface SppgDetail {
  vendorId: string
  vendorName: string
  lifecycleStatus: string
  score: number
  scoreHistory: { date: string; score: number }[]
  checkpoints: { cpType: string; cpStatus: string; completedAt: string | null }[]
  recentAlerts: { id: string; severity: string; alertType: string; title: string; createdAt: string }[]
  sppg: { targetPorsi: number; assignedSchools: string[] } | null
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
}

const CP_STATUS_ICON = {
  done: <CheckCircle2 className="size-3.5 text-green-600" />,
  pending: <Clock className="size-3.5 text-slate-300" />,
  failed: <XCircle className="size-3.5 text-red-500" />,
  force_closed: <XCircle className="size-3.5 text-slate-400" />,
}

export default function CommandCenterPage() {
  const [overview, setOverview] = React.useState<Overview | null>(null)
  const [alerts, setAlerts] = React.useState<AlertItem[]>([])
  const [vendors, setVendors] = React.useState<VendorRow[]>([])
  const [detail, setDetail] = React.useState<SppgDetail | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [severityFilter, setSeverityFilter] = React.useState<string | undefined>()

  const load = React.useCallback(async () => {
    const [ov, al, vd] = await Promise.all([
      api.get<Overview>("/command-center/overview").catch(() => null),
      api.get<{ data: AlertItem[] }>(`/command-center/alerts${severityFilter ? `?severity=${severityFilter}` : ""}`).catch(() => null),
      api.get<VendorRow[]>("/command-center/vendors").catch(() => null),
    ])
    if (ov) setOverview(ov)
    if (al) setAlerts(al.data)
    if (vd) setVendors(vd)
    setLoading(false)
  }, [severityFilter])

  React.useEffect(() => { load() }, [load])

  // WebSocket subscription
  React.useEffect(() => {
    const token = TokenStorage.getAccessToken()
    if (!token) return
    bgnClient.connect(token)
    const handler = (payload: unknown) => {
      const a = payload as AlertItem
      setAlerts(prev => [a, ...prev])
      setOverview(prev => prev ? { ...prev, alertPending: prev.alertPending + 1 } : prev)
    }
    bgnClient.on("alert:new", handler)
    return () => bgnClient.off("alert:new", handler)
  }, [])

  const openDetail = async (vendorId: string) => {
    const d = await api.get<SppgDetail>(`/command-center/sppg/${vendorId}`).catch(() => null)
    if (d) { setDetail(d); setDetailOpen(true) }
  }

  const markRead = async (id: string) => {
    await api.patch(`/command-center/alerts/${id}/read`).catch(() => {})
    setAlerts(prev => prev.filter(a => a.id !== id))
    setOverview(prev => prev ? { ...prev, alertPending: Math.max(0, prev.alertPending - 1) } : prev)
  }

  const filteredVendors = vendors.filter(v =>
    !search || v.vendorName.toLowerCase().includes(search.toLowerCase())
  )
  const criticalAlerts = alerts.filter(a => a.severity === "critical")
  const otherAlerts = alerts.filter(a => a.severity !== "critical")

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">BGN</p>
          <h1 className="text-2xl font-black mt-0.5">Command Center</h1>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 text-xs">
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stat Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Users className="size-5 text-green-600" />, label: "SPPG Aktif", value: overview?.totalActive ?? 0, bg: "bg-green-50" },
          { icon: <Clock className="size-5 text-slate-400" />, label: "Belum Mulai", value: overview?.notStarted ?? 0, bg: "bg-slate-50" },
          { icon: <TrendingDown className="size-5 text-red-600" />, label: "Kritis (<60)", value: overview?.critical ?? 0, bg: "bg-red-50" },
          { icon: <Bell className="size-5 text-yellow-600" />, label: "Alert Pending", value: overview?.alertPending ?? 0, bg: "bg-yellow-50" },
        ].map((stat, i) => (
          <Card key={i} className={cn("border-0", stat.bg)}>
            <CardContent className="pt-5 pb-4 flex items-center gap-4">
              <div className="p-2.5 bg-white rounded-2xl shadow-sm shrink-0">{stat.icon}</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                <p className="text-3xl font-black mt-0.5">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alert Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold">Filter:</p>
            {[undefined, "critical", "warning"].map(s => (
              <button key={String(s)} onClick={() => setSeverityFilter(s)}
                className={cn("px-3 py-1 rounded-full text-xs font-bold border transition-all",
                  severityFilter === s ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200")}>
                {s === undefined ? "Semua" : s === "critical" ? "Kritis" : "Peringatan"}
              </button>
            ))}
          </div>

          {/* Critical alerts */}
          {criticalAlerts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-red-600">🔴 Kritis — Perlu Tindakan Segera</p>
              {criticalAlerts.map(a => (
                <AlertCard key={a.id} alert={a} onView={() => openDetail(a.vendorId)} onDismiss={() => markRead(a.id)} />
              ))}
            </div>
          )}

          {/* Other alerts */}
          {otherAlerts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-yellow-600">⚠️ Perlu Diperhatikan</p>
              {otherAlerts.map(a => (
                <AlertCard key={a.id} alert={a} onView={() => openDetail(a.vendorId)} onDismiss={() => markRead(a.id)} />
              ))}
            </div>
          )}

          {alerts.length === 0 && (
            <Card className="border-dashed bg-slate-50">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="size-10 text-green-500 mx-auto mb-3" />
                <p className="font-bold text-slate-600">Tidak ada alert aktif</p>
                <p className="text-sm text-slate-400 mt-1">Semua SPPG berjalan normal</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Vendor List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <p className="text-sm font-bold">Daftar SPPG Aktif</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs" placeholder="Cari nama SPPG..." />
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredVendors.map(v => (
              <button key={v.vendorId} onClick={() => openDetail(v.vendorId)}
                className="w-full text-left p-3 rounded-xl border bg-white hover:bg-slate-50 hover:border-primary/30 transition-all group">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold truncate flex-1 mr-2">{v.vendorName}</p>
                  <ChevronRight className="size-3.5 text-slate-300 group-hover:text-primary shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className={cn("h-1.5 flex-1 rounded-full overflow-hidden bg-slate-100")}>
                    <div className={cn("h-full rounded-full transition-all",
                      v.score >= 80 ? "bg-green-500" : v.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                    )} style={{ width: `${v.score}%` }} />
                  </div>
                  <span className={cn("text-[11px] font-black shrink-0",
                    v.score >= 80 ? "text-green-600" : v.score >= 60 ? "text-yellow-600" : "text-red-600"
                  )}>{v.score}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {v.cpDone} CP selesai hari ini {!v.hasData && "· belum mulai"}
                </p>
              </button>
            ))}
            {filteredVendors.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Tidak ada hasil</p>
            )}
          </div>
        </div>
      </div>

      {/* SPPG Detail Sheet */}
      {detailOpen && detail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setDetailOpen(false)} />
          <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Detail SPPG</p>
                <h2 className="text-xl font-black mt-0.5">{detail.vendorName}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDetailOpen(false)}>✕</Button>
            </div>
            <div className="p-6 space-y-5">
              {/* Score */}
              <div className={cn("rounded-2xl p-5 text-center",
                detail.score >= 80 ? "bg-green-50" : detail.score >= 60 ? "bg-yellow-50" : "bg-red-50"
              )}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Skor Hari Ini</p>
                <p className={cn("text-5xl font-black",
                  detail.score >= 80 ? "text-green-600" : detail.score >= 60 ? "text-yellow-600" : "text-red-600"
                )}>{detail.score}</p>
              </div>

              {/* Checkpoints */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Checkpoint Hari Ini</p>
                <div className="grid grid-cols-4 gap-2">
                  {["CP1", "CP2", "CP3", "CP4"].map(cp => {
                    const c = detail.checkpoints.find(x => x.cpType === cp)
                    return (
                      <div key={cp} className={cn("rounded-xl p-3 text-center border",
                        c?.cpStatus === "done" ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"
                      )}>
                        <p className="text-[10px] font-black text-slate-500">{cp}</p>
                        <div className="flex justify-center mt-1">
                          {CP_STATUS_ICON[c?.cpStatus as keyof typeof CP_STATUS_ICON ?? "pending"] ?? CP_STATUS_ICON.pending}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* SPPG Info */}
              {detail.sppg && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Sekolah yang Dilayani</p>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-bold">{detail.sppg.targetPorsi}</span> <span className="text-slate-500">porsi target</span></p>
                    {detail.sppg.assignedSchools.map((s, i) => (
                      <p key={i} className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5">{s}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Alerts */}
              {detail.recentAlerts.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Alert Terakhir</p>
                  <div className="space-y-1.5">
                    {detail.recentAlerts.map(a => (
                      <div key={a.id} className="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-slate-50">
                        <AlertTriangle className={cn("size-3.5 shrink-0",
                          a.severity === "critical" ? "text-red-500" : "text-yellow-500"
                        )} />
                        <span className="flex-1 truncate text-slate-700">{a.title}</span>
                        <span className="text-slate-400 shrink-0">
                          {new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert, onView, onDismiss }: {
  alert: AlertItem
  onView: () => void
  onDismiss: () => void
}) {
  return (
    <Card className={cn("border-l-4 transition-all",
      alert.severity === "critical" ? "border-l-red-500" : "border-l-yellow-500"
    )}>
      <CardContent className="pt-4 pb-3 flex items-start gap-3">
        <AlertTriangle className={cn("size-4 shrink-0 mt-0.5",
          alert.severity === "critical" ? "text-red-500" : "text-yellow-500"
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold">{alert.title}</p>
            <Badge variant="outline" className={cn("text-[10px] font-bold h-4 px-1.5", SEVERITY_COLOR[alert.severity])}>
              {alert.severity}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{alert.vendorName}</p>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{alert.body}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={onView} className="text-xs font-bold text-primary hover:underline">
              Lihat Detail →
            </button>
            <button onClick={onDismiss} className="text-xs text-slate-400 hover:text-slate-600">
              Tandai selesai
            </button>
            {alert.vendorScore !== null && (
              <span className={cn("text-xs font-black ml-auto",
                alert.vendorScore >= 80 ? "text-green-600" : alert.vendorScore >= 60 ? "text-yellow-600" : "text-red-600"
              )}>
                Skor: {alert.vendorScore}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
