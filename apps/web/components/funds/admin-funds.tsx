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

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function AdminFundsDashboard() {
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

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
      categories: ['1 Mar', '5 Mar', '10 Mar', '15 Mar', '20 Mar', '25 Mar', '30 Mar'],
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
    data: [1.2, 2.5, 4.1, 6.8, 8.2, 9.5, 10.2]
  }]

  return (
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
                Buku besar publik secara real-time untuk alokasi anggaran APBN dan pembayaran mitra SPPG berbasis Smart Contract.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="h-12 px-6 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20 shadow-lg font-bold rounded-2xl gap-2 transition-transform active:scale-95">
                <Calendar className="size-4" />
                Pilih Periode
              </Button>
              <Button className="h-12 px-6 bg-white text-emerald-800 hover:bg-emerald-50 shadow-lg shadow-black/10 font-bold rounded-2xl gap-2 transition-transform active:scale-95">
                <Download className="size-4" />
                Laporan BPK
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
                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">Rp 71.0 <span className="text-xl text-slate-400 font-bold">Triliun</span></h3>
                <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-2">
                  <ShieldCheck className="size-3.5 text-emerald-500" /> Disahkan Kemenkeu
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
                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">Rp 14.2 <span className="text-xl text-slate-400 font-bold">Triliun</span></h3>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Realisasi</span>
                    <span className="text-emerald-600">20.1%</span>
                  </div>
                  <Progress value={20.1} className="h-2 bg-slate-100 [&>div]:bg-emerald-500" />
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
                <h3 className="text-3xl lg:text-4xl font-black text-amber-500 tracking-tighter">Rp 56.7 <span className="text-xl text-amber-700/50 font-bold">Triliun</span></h3>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mt-2 bg-slate-50 w-fit px-2.5 py-1 rounded-md">
                  <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Alokasi Aman (Tersedia &gt; 70%)
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
                  <CardDescription className="text-xs font-medium text-slate-500">Tren pengeluaran APBN 30 hari terakhir (Maret 2026)</CardDescription>
                </div>
                <Badge className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none rounded-full">
                  <TrendingUp className="size-3.5" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">+18.4%</span>
                </Badge>
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
                 <h3 className="text-lg font-bold mb-2">Smart Contract BGN</h3>
                 <p className="text-xs font-medium text-slate-300 leading-relaxed">
                   Seluruh pencairan dana di-trigger otomatis oleh AI saat 3 parameter terpenuhi:
                 </p>
                 <ul className="mt-4 space-y-3">
                   {["Validasi Gizi AI (Foto)", "Validasi GPS Armada", "Scan QR Kedatangan"].map((rule, i) => (
                     <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-100">
                       <CheckCircle2 className="size-4 text-emerald-400" /> {rule}
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
          </div>
        </div>

        {/* Smart Contract Ledger Table */}
        <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 md:px-8 border-b border-slate-100">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Riwayat Transaksi Terkini</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">Buku besar publik untuk pencairan dana via Smart Contract.</CardDescription>
            </div>
            <Button variant="ghost" className="text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl gap-2">
              Lihat Semua <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-12">Nama Mitra</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 hidden md:table-cell">Tanggal & Waktu</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12">Nominal (Rp)</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12">Status</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-6 h-12 text-right">Bukti</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { vendor: "Catering Ibu Budi", time: "14 Mar 2026, 09:30", amount: "Rp 45.000.000", status: "Tercairkan", color: "emerald", icon: CheckCircle2 },
                  { vendor: "Dapur Nusantara", time: "14 Mar 2026, 11:15", amount: "Rp 120.500.000", status: "Tertahan", color: "amber", icon: AlertTriangle },
                  { vendor: "Berkah Catering Jaya", time: "13 Mar 2026, 16:45", amount: "Rp 88.200.000", status: "Tercairkan", color: "emerald", icon: CheckCircle2 },
                  { vendor: "Sari Rasa Katering", time: "13 Mar 2026, 15:20", amount: "Rp 210.000.000", status: "Tercairkan", color: "emerald", icon: CheckCircle2 },
                ].map((item, i) => (
                  <TableRow 
                    key={i} 
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
                          `bg-${item.color}-50 border-${item.color}-100 text-${item.color}-600`
                        )}>
                          <item.icon className="size-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{item.vendor}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 md:hidden">{item.time}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden md:table-cell">
                      <span className="font-bold text-slate-500 text-xs">{item.time}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-black text-slate-900 text-sm">{item.amount}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={cn(
                        "border-none font-bold uppercase text-[9px] px-3 py-1 tracking-widest",
                        item.status === 'Tercairkan' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className={cn(
                        "size-8 rounded-full transition-all",
                        hoveredRow === i ? "bg-white shadow-sm text-slate-900 border border-slate-200" : "text-slate-400"
                      )}>
                        <ExternalLink className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

      </div>
    </div>
  )
}
