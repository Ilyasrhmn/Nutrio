"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import {
  UtensilsCrossed,
  Info,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { api } from "@/lib/api-client"
import { toQueryError } from "@/lib/services/error-handler"

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ScoreHistoryEntry {
  date: string
  score: number
  cpDone: number
}

export default function VendorReportsPage() {
  const [history, setHistory] = React.useState<ScoreHistoryEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const data = await api.get<ScoreHistoryEntry[]>('/scoring/history?days=14')
      setHistory(data)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const avgScore = history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.score ?? 0), 0) / history.length) : null
  const avgCpDone = history.length > 0 ? (history.reduce((s, h) => s + (h.cpDone ?? 0), 0) / history.length).toFixed(1) : null

  const scoreChartOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#10b981'],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: history.map((h) => new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
      labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 600 } },
    },
    yaxis: { min: 0, max: 100 },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    tooltip: { theme: 'light' },
  }
  const scoreSeries = [{ name: 'Skor Kepatuhan', data: history.map((h) => h.score) }]

  return (
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-500 pb-12">

      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <UtensilsCrossed className="size-64" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto space-y-3">
          <Badge className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full w-fit">
            Dapur Pusat
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Laporan Operasional Dapur
          </h1>
          <p className="text-emerald-100/80 font-medium text-sm max-w-2xl leading-relaxed">
            Skor kepatuhan checkpoint 14 hari terakhir.
          </p>
        </div>
      </div>

      <div className="relative z-20 max-w-[1400px] mx-auto px-6 lg:px-12 -mt-20 space-y-6">
        <QueryState
          status={loadError ? loadError.status : loading ? "loading" : "success"}
          errorMessage={loadError?.errorMessage}
          isNetworkError={loadError?.isNetworkError}
          onRetry={load}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rata-rata Skor (14 hari)</p>
                <h3 className="text-2xl font-black text-slate-900">{avgScore ?? '-'}</h3>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rata-rata Checkpoint Selesai</p>
                <h3 className="text-2xl font-black text-slate-900">{avgCpDone ?? '-'} <span className="text-sm font-bold text-slate-400">/ 4</span></h3>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[24px] border border-slate-200 bg-white overflow-hidden mt-6">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="text-base font-bold text-slate-900">Tren Skor Kepatuhan</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Dari GET /scoring/history.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Belum ada riwayat skor.</p>
              ) : (
                <div className="h-[250px] w-full">
                  <ReactApexChart options={scoreChartOptions} series={scoreSeries} type="area" height="100%" />
                </div>
              )}
            </CardContent>
          </Card>

          <Alert className="bg-amber-50 border-amber-200 rounded-2xl mt-6">
            <Info className="size-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Laporan food cost, analisis sisa bahan (wastage per kategori), dan log produksi
              harian belum tersedia — backend belum melacak data ini per hari (hanya saldo stok
              saat ini via <code className="bg-white px-1.5 py-0.5 rounded text-xs">GET /inventory/current</code>,
              tanpa riwayat harian per kategori bahan).
            </AlertDescription>
          </Alert>
        </QueryState>
      </div>
    </div>
  )
}
