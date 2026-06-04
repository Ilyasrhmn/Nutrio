"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import { 
  Search, 
  FilePlus, 
  BrainCircuit, 
  ShieldAlert, 
  Activity,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  CheckCircle2
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
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  const complianceChartOptions: any = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: '65%' },
        track: { background: '#f1f5f9', strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 10,
            fontSize: '36px',
            fontWeight: 900,
            color: '#0f172a',
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    colors: ['#10b981'], // emerald-500
    stroke: { lineCap: 'round' }
  }

  const fraudChartOptions: any = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: '65%' },
        track: { background: '#f1f5f9', strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 10,
            fontSize: '36px',
            fontWeight: 900,
            color: '#0f172a',
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    colors: ['#8b5cf6'], // violet-500
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
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-500 pb-12">
      
      {/* VIBRANT INDIGO HERO SECTION */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        {/* Abstract AI Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop')] mix-blend-overlay opacity-20 bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute -top-24 -right-24 size-[500px] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-72 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <Badge className="bg-white/10 text-violet-50 border border-white/20 hover:bg-white/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full gap-1.5 flex w-fit items-center">
                <Sparkles className="size-3" /> Didukung oleh AI
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Analitik AI & Laporan Fraud
              </h1>
              <p className="text-indigo-100 font-medium text-sm max-w-2xl leading-relaxed">
                Platform pengawasan deep learning untuk mendeteksi anomali gizi pada foto makanan dan pola kecurangan (fraud) pada rute logistik secara otomatis.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-violet-200" />
                <Input 
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-violet-200 rounded-2xl h-12 focus-visible:ring-white/30 font-medium shadow-inner" 
                  placeholder="Cari ID laporan atau vendor..." 
                />
              </div>
              <Button className="h-12 px-6 bg-white text-violet-900 hover:bg-violet-50 shadow-lg shadow-black/10 font-bold rounded-2xl gap-2 transition-transform active:scale-95">
                <FilePlus className="size-4" />
                Buat Laporan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Overlapping Hero) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 -mt-20 space-y-8">
        
        {/* Top Section - 2 Large Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden bg-white">
            <CardHeader className="pb-0 pt-6 px-8 border-b border-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <BrainCircuit className="size-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akurasi Visual</p>
                  <CardTitle className="text-lg font-bold">Tingkat Kepatuhan Gizi</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center p-8 gap-8">
              <div className="w-[180px] shrink-0 flex justify-center">
                <ReactApexChart options={complianceChartOptions} series={[94]} type="radialBar" width={220} />
              </div>
              <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-slate-400" /> Batch Tervalidasi
                  </span>
                  <span className="text-base font-black text-slate-900">1,248</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="size-3.5 text-slate-400" /> Menunggu Cek Lab
                  </span>
                  <span className="text-base font-black text-slate-900">52</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-red-100 bg-red-50">
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="size-3.5 text-red-500" /> Gagal / Ditolak
                  </span>
                  <span className="text-base font-black text-red-600">14</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden bg-white">
            <CardHeader className="pb-0 pt-6 px-8 border-b border-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-violet-50 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="size-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skor Keamanan</p>
                  <CardTitle className="text-lg font-bold">Pencegahan Risiko Fraud</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center p-8 gap-8">
              <div className="w-[180px] shrink-0 flex justify-center">
                <ReactApexChart options={fraudChartOptions} series={[78]} type="radialBar" width={220} />
              </div>
              <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint className="size-3.5 text-slate-400" /> Indikasi Kecurangan
                  </span>
                  <span className="text-base font-black text-slate-900">23</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-100 bg-emerald-50">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-emerald-500" /> Diblokir Otomatis
                  </span>
                  <span className="text-base font-black text-emerald-700">18</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-100 bg-amber-50">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="size-3.5 text-amber-500" /> Dalam Investigasi
                  </span>
                  <span className="text-base font-black text-amber-700">5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section - Anomali Title */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <Activity className="size-4" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Anomali Terdeteksi AI</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Last updated: Just now</span>
          </div>

          {/* 3 Alert Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
              <CardContent className="p-6 space-y-5">
                <Badge className="bg-red-50 text-red-700 border-red-100 font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                  Confidence Tinggi (98%)
                </Badge>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">Indikasi Korupsi Gizi</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Analisis foto Batch #9921 menunjukkan defisit volume protein 15% dari standar kontrak.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor: #VN-8842</span>
                  <Button variant="ghost" size="sm" className="h-8 text-red-600 bg-red-50 hover:bg-red-100 text-[10px] font-bold uppercase tracking-widest rounded-lg gap-1.5">
                    Analisis <ChevronRight className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              <CardContent className="p-6 space-y-5">
                <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                  Confidence Sedang (75%)
                </Badge>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Penyimpangan Rute</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Logistik ID #TRK-882 melenceng 12km dari rute sekolah. Tidak ada laporan kemacetan rute.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logistik: #TRK-882</span>
                  <Button variant="ghost" size="sm" className="h-8 text-amber-600 bg-amber-50 hover:bg-amber-100 text-[10px] font-bold uppercase tracking-widest rounded-lg gap-1.5">
                    Lihat Peta <ChevronRight className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
              <CardContent className="p-6 space-y-5">
                <Badge className="bg-violet-50 text-violet-700 border-violet-100 font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                  Pattern Match (82%)
                </Badge>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">Manipulasi Waktu</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Waktu eksekusi smart contract mendahului waktu foto riil di lapangan. Indikasi bypass sistem.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contract: #SC-9912</span>
                  <Button variant="ghost" size="sm" className="h-8 text-violet-600 bg-violet-50 hover:bg-violet-100 text-[10px] font-bold uppercase tracking-widest rounded-lg gap-1.5">
                    Verifikasi <ChevronRight className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Detail Table */}
        <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 md:px-8 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-bold">Log Kepatuhan Detail</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Hasil inspeksi AI menyeluruh untuk setiap batch pengiriman.</CardDescription>
            </div>
            <Button variant="ghost" className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl gap-2">
              Lihat Semua <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-12">ID Batch</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 hidden md:table-cell">Waktu Analisis</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 text-center">Skor Risiko AI</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12">Indikator Utama</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12">Status</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-6 h-12 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "#MBG-2291-A", time: "Today, 14:20", risk: "Tinggi", issue: "Defisit Protein (15%)", status: "Ditolak", statusColor: "red" },
                  { id: "#MBG-2288-B", time: "Today, 13:45", risk: "Sedang", issue: "Penyimpangan GPS (2km)", status: "Review", statusColor: "amber" },
                  { id: "#MBG-2285-C", time: "Today, 12:10", risk: "Rendah", issue: "Sesuai Standar", status: "Lolos", statusColor: "emerald" },
                  { id: "#MBG-2282-D", time: "Today, 11:05", risk: "Rendah", issue: "Sesuai Standar", status: "Lolos", statusColor: "emerald" },
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
                      <p className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{item.id}</p>
                    </TableCell>
                    <TableCell className="py-4 hidden md:table-cell">
                      <span className="font-bold text-slate-500 text-xs">{item.time}</span>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Badge className={cn(
                        "border-none font-bold uppercase text-[9px] px-3 py-1 tracking-widest",
                        item.risk === 'Tinggi' ? 'bg-red-100 text-red-700' :
                        item.risk === 'Sedang' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      )}>
                        {item.risk}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-bold text-slate-700 text-xs">{item.issue}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 bg-slate-50 w-fit px-2.5 py-1 rounded-md border border-slate-100">
                        <div className={cn(
                          "size-1.5 rounded-full",
                          `bg-${item.statusColor}-500`
                        )} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", `text-${item.statusColor}-700`)}>
                          {item.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className={cn(
                        "h-8 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                        hoveredRow === i ? "bg-white shadow-sm text-indigo-600 border border-slate-200" : "text-slate-400 bg-transparent border border-transparent"
                      )}>
                        Detail
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
