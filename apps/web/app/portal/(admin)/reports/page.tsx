"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import {
  Search,
  FilePlus,
  BrainCircuit,
  AlertCircle,
  ShieldAlert,
  Zap,
  ChevronRight,
  TrendingUp,
  Activity,
  Loader2,
  RefreshCw,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface ReportStats {
  complianceRate: number
  fraudPreventionRate: number
  stats: {
    highScore: number
    midScore: number
    lowScore: number
    totalWithData: number
    totalActive: number
    cpDoneToday: number
    cpTotalToday: number
    cp3DoneToday: number
  }
  anomalies: { vendorId: string; vendorName: string; score: number; lastReason: string }[]
}

export default function AIReportsPage() {
  const [data, setData] = React.useState<ReportStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState("")

  const fetchData = React.useCallback(() => {
    setLoading(true)
    import("@/lib/api-client").then(({ api }) => {
      api.get<ReportStats>("/command-center/reports")
        .then((res) => { if (res) setData(res) })
        .catch(() => {})
        .finally(() => setLoading(false))
    })
  }, [])

  React.useEffect(() => { fetchData() }, [fetchData])

  const complianceChartOptions: any = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        track: { background: '#e2e8f0', strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 10, fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a',
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    colors: ['#22c55e'],
    stroke: { lineCap: 'round' }
  }

  const fraudChartOptions: any = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        track: { background: '#e2e8f0', strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 10, fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a',
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    colors: ['#6366f1'],
    stroke: { lineCap: 'round' }
  }

  const scoreRiskLabel = (score: number) => {
    if (score < 60) return { label: "Tinggi", cn: "bg-red-50 text-red-600 border-red-100" }
    if (score < 80) return { label: "Sedang", cn: "bg-amber-50 text-amber-600 border-amber-100" }
    return { label: "Rendah", cn: "bg-emerald-50 text-emerald-600 border-emerald-100" }
  }

  const filteredAnomalies = (data?.anomalies ?? []).filter(a =>
    !q || a.vendorName.toLowerCase().includes(q.toLowerCase()) || a.lastReason.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8 bg-background">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Analitik AI & Kepatuhan Gizi</h2>
          <p className="text-muted-foreground text-sm">Analisis deep learning untuk mendeteksi anomali gizi dan pola kecurangan (fraud) MBG.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-10 h-10 bg-card border-border rounded-lg"
              placeholder="Cari vendor atau indikator..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchData} className="gap-2 h-10 font-bold rounded-full">
            <RefreshCw className="size-4" /> Refresh
          </Button>
          <Button className="gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold">
            <FilePlus className="size-4" />
            Buat Laporan Bulanan
          </Button>
        </div>
      </div>

      {/* Two Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <BrainCircuit className="size-5 text-primary" />
              <CardTitle className="text-lg font-bold">Tingkat Kepatuhan Gizi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center p-8 gap-8">
            <div className="w-[200px] flex justify-center">
              {loading ? (
                <div className="size-[200px] flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-slate-300" />
                </div>
              ) : (
                <ReactApexChart
                  options={complianceChartOptions}
                  series={[data?.complianceRate ?? 0]}
                  type="radialBar"
                  width={240}
                />
              )}
            </div>
            <div className="flex-1 grid grid-cols-1 gap-4 w-full">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-xs font-bold text-muted-foreground uppercase">Skor Tinggi (≥80)</span>
                <span className="text-sm font-black text-foreground">{data?.stats.highScore ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-xs font-bold text-muted-foreground uppercase">Skor Menengah (60–79)</span>
                <span className="text-sm font-black text-foreground">{data?.stats.midScore ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-destructive/5">
                <span className="text-xs font-bold text-destructive uppercase">Skor Kritis (&lt;60)</span>
                <span className="text-sm font-black text-destructive">{data?.stats.lowScore ?? "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-primary" />
              <CardTitle className="text-lg font-bold">Pencegahan Risiko Fraud</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center p-8 gap-8">
            <div className="w-[200px] flex justify-center">
              {loading ? (
                <div className="size-[200px] flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-slate-300" />
                </div>
              ) : (
                <ReactApexChart
                  options={fraudChartOptions}
                  series={[data?.fraudPreventionRate ?? 0]}
                  type="radialBar"
                  width={240}
                />
              )}
            </div>
            <div className="flex-1 grid grid-cols-1 gap-4 w-full">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-xs font-bold text-muted-foreground uppercase">Total Vendor Aktif</span>
                <span className="text-sm font-black text-foreground">{data?.stats.totalActive ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
                <span className="text-xs font-bold text-emerald-600 uppercase">CP3 Selesai Hari Ini</span>
                <span className="text-sm font-black text-emerald-600">{data?.stats.cp3DoneToday ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
                <span className="text-xs font-bold text-amber-600 uppercase">Anomali Terdeteksi</span>
                <span className="text-sm font-black text-amber-600">{data?.anomalies.length ?? "—"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground tracking-tight">Anomali Terdeteksi AI</h3>
          </div>
          <span className="text-xs text-muted-foreground font-medium italic">
            {loading ? "Memuat..." : `${filteredAnomalies.length} vendor dengan skor rendah hari ini`}
          </span>
        </div>

        {/* Summary cards from real data */}
        {data && data.anomalies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.anomalies.slice(0, 3).map((anomaly) => {
              const risk = scoreRiskLabel(anomaly.score)
              return (
                <Card key={anomaly.vendorId} className={cn("bg-card shadow-sm border-l-4", anomaly.score < 60 ? "border-destructive" : anomaly.score < 80 ? "border-amber-500" : "border-primary")}>
                  <CardContent className="p-6 space-y-4">
                    <Badge variant="outline" className={cn("font-bold text-[10px] uppercase border", risk.cn)}>
                      Skor {anomaly.score}
                    </Badge>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground truncate">{anomaly.vendorName}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{anomaly.lastReason}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Risiko: {risk.label}</span>
                      <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs font-bold gap-1">
                        Lihat Detail <ChevronRight className="size-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Table */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-6 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Log Kepatuhan Detail</CardTitle>
          <CardDescription className="text-muted-foreground font-medium italic">
            {loading ? "Memuat data..." : `Vendor dengan skor anomali hari ini (${filteredAnomalies.length} entri)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/50">
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pl-8">Nama Vendor</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Indikator Utama</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest text-center">Skor Risiko</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pr-8 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="size-6 animate-spin text-slate-300 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredAnomalies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Zap className="size-8 opacity-20" />
                      <p className="text-sm font-medium">
                        {q ? "Tidak ada hasil pencarian" : "Tidak ada anomali hari ini"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnomalies.map((anomaly) => {
                  const risk = scoreRiskLabel(anomaly.score)
                  return (
                    <TableRow key={anomaly.vendorId} className="group border-border/50">
                      <TableCell className="font-black text-foreground pl-8 py-5 truncate max-w-[200px]">
                        {anomaly.vendorName}
                      </TableCell>
                      <TableCell className="font-bold text-slate-700 text-xs max-w-[200px] truncate">
                        {anomaly.lastReason}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("font-bold px-2 py-0.5 text-[10px] border", risk.cn)}>
                          {risk.label} ({anomaly.score})
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className={cn("size-1.5 rounded-full", anomaly.score < 60 ? "bg-red-500" : "bg-amber-500")} />
                          <span className={cn("text-xs font-bold", anomaly.score < 60 ? "text-red-600" : "text-amber-600")}>
                            {anomaly.score < 60 ? "Kritis" : "Perhatian"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-primary hover:bg-primary/5 font-bold text-xs rounded-full">
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
