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
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  Activity
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

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AIReportsPage() {
  const complianceChartOptions: any = {
    chart: {
      type: 'radialBar',
      sparkline: { enabled: true }
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        track: {
          background: '#e2e8f0',
          strokeWidth: '100%',
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 10,
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#0f172a',
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    colors: ['#22c55e'],
    stroke: { lineCap: 'round' }
  };

  const fraudChartOptions: any = {
    chart: {
      type: 'radialBar',
      sparkline: { enabled: true }
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        track: {
          background: '#e2e8f0',
          strokeWidth: '100%',
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 10,
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#0f172a',
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    colors: ['#6366f1'],
    stroke: { lineCap: 'round' }
  };

  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Analitik AI & Kepatuhan Gizi</h2>
          <p className="text-muted-foreground text-sm">Analisis deep learning untuk mendeteksi anomali gizi dan pola kecurangan (fraud) MBG.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-10 h-10 bg-card border-border rounded-lg" placeholder="Cari batch atau laporan..." />
          </div>
          <Button className="gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold">
            <FilePlus className="size-4" />
            Buat Laporan Bulanan
          </Button>
        </div>
      </div>

      {/* Top Section - 2 Large Charts */}
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
              <ReactApexChart options={complianceChartOptions} series={[94]} type="radialBar" width={240} />
            </div>
            <div className="flex-1 grid grid-cols-1 gap-4 w-full">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-xs font-bold text-muted-foreground uppercase">Batch Tervalidasi</span>
                <span className="text-sm font-black text-foreground">1,248</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-xs font-bold text-muted-foreground uppercase">Menunggu Cek Lab</span>
                <span className="text-sm font-black text-foreground">52</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-destructive/5">
                <span className="text-xs font-bold text-destructive uppercase">Gagal / Ditolak</span>
                <span className="text-sm font-black text-destructive">14</span>
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
              <ReactApexChart options={fraudChartOptions} series={[78]} type="radialBar" width={240} />
            </div>
            <div className="flex-1 grid grid-cols-1 gap-4 w-full">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-xs font-bold text-muted-foreground uppercase">Indikasi Kecurangan</span>
                <span className="text-sm font-black text-foreground">23</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
                <span className="text-xs font-bold text-emerald-600 uppercase">Diblokir Otomatis</span>
                <span className="text-sm font-black text-emerald-600">18</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
                <span className="text-xs font-bold text-amber-600 uppercase">Dalam Investigasi</span>
                <span className="text-sm font-black text-amber-600">5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section - Anomali Title */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground tracking-tight">Anomali Terdeteksi AI</h3>
          </div>
          <span className="text-xs text-muted-foreground font-medium italic">Last updated: Just now</span>
        </div>

        {/* 3 Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-l-4 border-destructive shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/10 font-bold text-[10px] uppercase">
                Confidence Tinggi (98%)
              </Badge>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Indikasi Korupsi Gizi (Protein)</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Analisis foto Batch #9921 menunjukkan defisit volume protein 15% dari standar kontrak.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Vendor: #VN-8842</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs font-bold gap-1">
                  Lihat Analisis <ChevronRight className="size-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-l-4 border-amber-500 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Badge variant="warning" className="bg-amber-50 text-amber-600 border-amber-100 font-bold text-[10px] uppercase">
                Confidence Sedang (75%)
              </Badge>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Penyimpangan Rute GPS</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Logistik ID #TRK-882 melenceng 12km dari rute sekolah. Tidak ada laporan kemacetan.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Logistik: #TRK-882</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs font-bold gap-1">
                  Lihat Peta <ChevronRight className="size-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-l-4 border-primary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold text-[10px] uppercase">
                Pattern Match (82%)
              </Badge>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Manipulasi Waktu Laporan</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Waktu eksekusi smart contract mendahului waktu foto riil di lapangan.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Contract: #SC-9912</span>
                <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs font-bold gap-1">
                  Verifikasi Hash <ChevronRight className="size-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section - Detail Table */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-6 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Log Kepatuhan Detail</CardTitle>
          <CardDescription className="text-muted-foreground font-medium italic">Hasil inspeksi AI menyeluruh untuk setiap batch pengiriman.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/50">
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pl-8">ID Batch</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Waktu Analisis</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest text-center">Skor Risiko AI</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Indikator Utama</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pr-8 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="group border-border/50">
                <TableCell className="font-black text-foreground pl-8 py-5">#MBG-2291-A</TableCell>
                <TableCell className="text-muted-foreground font-medium text-xs">Today, 14:20</TableCell>
                <TableCell className="text-center">
                  <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 font-bold px-2 py-0.5 text-[10px]">Tinggi</Badge>
                </TableCell>
                <TableCell className="font-bold text-slate-700 text-xs">Defisit Protein (15%)</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-red-500 rounded-full" />
                    <span className="text-xs font-bold text-red-600">Ditolak</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-primary hover:bg-primary/5 font-bold text-xs rounded-full">
                    Detail
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow className="group border-border/50">
                <TableCell className="font-black text-foreground pl-8 py-5">#MBG-2288-B</TableCell>
                <TableCell className="text-muted-foreground font-medium text-xs">Today, 13:45</TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold px-2 py-0.5 text-[10px]">Sedang</Badge>
                </TableCell>
                <TableCell className="font-bold text-slate-700 text-xs">Penyimpangan GPS (2km)</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-amber-500 rounded-full" />
                    <span className="text-xs font-bold text-amber-600">Review</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-primary hover:bg-primary/5 font-bold text-xs rounded-full">
                    Detail
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow className="group border-border/50">
                <TableCell className="font-black text-foreground pl-8 py-5">#MBG-2285-C</TableCell>
                <TableCell className="text-muted-foreground font-medium text-xs">Today, 12:10</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-2 py-0.5 text-[10px]">Rendah</Badge>
                </TableCell>
                <TableCell className="font-bold text-slate-700 text-xs">Sesuai Standar</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-xs font-bold text-emerald-600">Lolos</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-primary hover:bg-primary/5 font-bold text-xs rounded-full">
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
