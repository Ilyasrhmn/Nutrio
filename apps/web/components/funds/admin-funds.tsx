"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  Wallet, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Landmark,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { api } from "@/lib/api-client"
import { toQueryError } from "@/lib/services/error-handler"

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface FundSummary {
  totalAlokasi: number;
  totalTersalurkan: number;
  sisaAnggaran: number;
  realisasiPct: number;
  trendData: { date: string; amount: number }[];
}

interface FundTransaction {
  id: string;
  vendorName: string;
  paidAt: string | null;
  amount: number;
  status: string;
  invoiceNumber: string | null;
}

function formatTriliun(value: number) {
  return (value / 1_000_000_000_000).toFixed(1)
}

export function AdminFundsDashboard() {
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
  const [summary, setSummary] = React.useState<FundSummary | null>(null)
  const [transactions, setTransactions] = React.useState<FundTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const [summaryData, txData] = await Promise.all([
        api.get<FundSummary>('/funds/summary'),
        api.get<FundTransaction[]>('/funds/transactions'),
      ])
      setSummary(summaryData)
      setTransactions(txData)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const chartOptions: any = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
      fontFamily: 'inherit'
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#059669'] // emerald-600
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100],
        colorStops: [
          { offset: 0, color: '#10b981', opacity: 0.4 },
          { offset: 100, color: '#10b981', opacity: 0.05 }
        ]
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: summary?.trendData.map(t => t.date) ?? [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
          fontWeight: 600
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `Rp ${val}T`,
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
          fontWeight: 600
        }
      }
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val: number) => `Rp ${val} Triliun` }
    }
  }

  const chartSeries = [{
    name: 'Pencairan',
    data: (summary?.trendData.map(t => t.amount / 1_000_000_000_000)) ?? []
  }]

  return (
    <QueryState
      status={loadError ? loadError.status : loading ? "loading" : !summary ? "empty" : "success"}
      errorMessage={loadError?.errorMessage}
      isNetworkError={loadError?.isNetworkError}
      onRetry={load}
      emptyTitle="Data dana belum tersedia"
      emptyMessage="Belum ada data alokasi anggaran yang dikonfigurasi."
    >
    {summary && (
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-500 pb-12">

      {/* VIBRANT EMERALD HERO SECTION */}
      <div className="relative bg-gradient-to-br from-teal-800 via-emerald-800 to-emerald-900 pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] mix-blend-overlay opacity-20 bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-24 -right-24 size-96 bg-emerald-400/30 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <Badge className="bg-white/10 text-emerald-50 border border-white/20 hover:bg-white/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                Sistem Keuangan Negara
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Transparansi & Pencairan Dana
              </h1>
              <p className="text-emerald-100 font-medium text-sm max-w-2xl">
                Ringkasan alokasi anggaran dan pencairan pembayaran mitra SPPG.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={load} className="h-12 px-6 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20 shadow-lg font-bold rounded-2xl gap-2 transition-transform active:scale-95">
                <RefreshCw className="size-4" />
                Muat Ulang
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Overlapping Hero) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 -mt-20 space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-white">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Landmark className="size-32" />
            </div>
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between mb-4">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Alokasi APBN 2026</p>
                 <div className="size-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                   <Wallet className="size-6" />
                 </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">Rp {formatTriliun(summary.totalAlokasi)} <span className="text-xl text-slate-400 font-bold">Triliun</span></h3>
                <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-2">
                  <ShieldCheck className="size-3.5 text-emerald-500" /> Alokasi Terkonfigurasi
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-white">
             <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <TrendingUp className="size-32" />
            </div>
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between mb-4">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Tersalurkan</p>
                 <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                   <TrendingUp className="size-6" />
                 </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">Rp {formatTriliun(summary.totalTersalurkan)} <span className="text-xl text-slate-400 font-bold">Triliun</span></h3>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Realisasi</span>
                    <span className="text-emerald-600">{summary.realisasiPct.toFixed(1)}%</span>
                  </div>
                  <Progress value={summary.realisasiPct} className="h-2 bg-slate-100 [&>div]:bg-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-white">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <RefreshCw className="size-32" />
            </div>
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between mb-4">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sisa Anggaran</p>
                 <div className="size-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                   <RefreshCw className="size-6" />
                 </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl lg:text-4xl font-black text-amber-500 tracking-tighter">Rp {formatTriliun(summary.sisaAnggaran)} <span className="text-xl text-amber-700/50 font-bold">Triliun</span></h3>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mt-2 bg-slate-50 w-fit px-2.5 py-1 rounded-md">
                  <div className={cn("size-1.5 rounded-full animate-pulse", summary.realisasiPct < 70 ? "bg-emerald-500" : "bg-amber-500")} />
                  {summary.realisasiPct < 70 ? "Alokasi Aman (Tersedia > 30%)" : "Alokasi Menipis"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Section */}
          <Card className="lg:col-span-2 rounded-[24px] border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="pb-2 p-6 md:p-8 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold">Kecepatan Pencairan Dana MBG</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-500">Tren pengeluaran APBN 30 hari terakhir</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ReactApexChart 
                  options={chartOptions} 
                  series={chartSeries} 
                  type="area" 
                  height={300} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats or Info */}
          <div className="space-y-6">
             <Card className="rounded-[24px] border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg overflow-hidden relative">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:14px_24px]" />
               <CardContent className="p-8 relative z-10">
                 <div className="size-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-6 border border-white/10">
                   <ShieldCheck className="size-6" />
                 </div>
                 <div className="flex items-center gap-2 mb-2">
                   <h3 className="text-lg font-bold">Pencairan Otomatis</h3>
                   <Badge className="bg-amber-500/20 text-amber-200 border-none text-[9px] font-bold uppercase">Konsep — Belum Aktif</Badge>
                 </div>
                 <p className="text-xs font-medium text-slate-300 leading-relaxed">
                   Rencana ke depan: pencairan dana otomatis tervalidasi saat 3 syarat terpenuhi. Saat ini pencairan masih diproses manual.
                 </p>
                 <ul className="mt-4 space-y-3">
                   {["Validasi Gizi AI (Foto)", "Validasi GPS Armada", "Scan QR Kedatangan"].map((rule, i) => (
                     <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-100">
                       <CheckCircle2 className="size-4 text-slate-500" /> {rule}
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
          </div>
        </div>

        {/* Smart Contract Ledger Table */}
        <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 md:px-8 border-b border-slate-100">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Riwayat Transaksi Terkini</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">Pencairan dana ke mitra SPPG.</CardDescription>
            </div>
          </CardHeader>
          <div className="p-2">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-400">Belum ada transaksi.</div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-12">Nama Mitra</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 hidden md:table-cell">Tanggal & Waktu</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12">Nominal (Rp)</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((item, i) => {
                  const isPaid = item.status === 'paid'
                  const Icon = isPaid ? CheckCircle2 : AlertTriangle
                  const color = isPaid ? 'emerald' : 'amber'
                  return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "group border-none transition-colors cursor-pointer rounded-xl overflow-hidden relative",
                      hoveredRow === i ? "bg-slate-50" : "bg-transparent"
                    )}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "size-10 rounded-full flex items-center justify-center shrink-0 border",
                          `bg-${color}-50 border-${color}-100 text-${color}-600`
                        )}>
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{item.vendorName}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 md:hidden">{item.paidAt ? new Date(item.paidAt).toLocaleString('id-ID') : 'Estimasi'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden md:table-cell">
                      <span className="font-bold text-slate-500 text-xs">{item.paidAt ? new Date(item.paidAt).toLocaleString('id-ID') : 'Estimasi'}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-black text-slate-900 text-sm">Rp {item.amount.toLocaleString('id-ID')}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={cn(
                        "border-none font-bold uppercase text-[9px] px-3 py-1 tracking-widest",
                        isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            )}
          </div>
        </Card>

      </div>
    </div>
    )}
    </QueryState>
  )
}
