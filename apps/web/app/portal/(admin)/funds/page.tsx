"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  FileText, 
  ExternalLink,
  ChevronRight,
  RefreshCw
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

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function FundTrackingPage() {
  const chartOptions: any = {
    chart: {
      type: 'area',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      sparkline: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['hsl(var(--primary))']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
        colorStops: [
          {
            offset: 0,
            color: 'hsl(var(--primary))',
            opacity: 0.4
          },
          {
            offset: 100,
            color: 'hsl(var(--primary))',
            opacity: 0.05
          }
        ]
      }
    },
    grid: {
      show: false
    },
    xaxis: {
      categories: ['1 Mar', '5 Mar', '10 Mar', '15 Mar', '20 Mar', '25 Mar', '30 Mar'],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: 'hsl(var(--muted-foreground))',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      show: false
    },
    tooltip: {
      theme: 'light',
      x: {
        show: true
      },
      y: {
        formatter: (val: number) => `Rp ${val.toLocaleString()}M`
      }
    }
  }

  const chartSeries = [{
    name: 'Pencairan',
    data: [30, 45, 35, 60, 49, 70, 91]
  }]

  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Transparansi & Pencairan Dana</h2>
          <p className="text-muted-foreground text-sm">Buku besar real-time untuk alokasi anggaran APBN dan pembayaran mitra SPPG.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 h-10 border-border bg-card font-medium">
            <Calendar className="size-4" />
            Pilih Tanggal
          </Button>
          <Button className="gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold">
            <Download className="size-4" />
            Unduh Laporan BPK
          </Button>
        </div>
      </div>

      {/* Main Chart Section */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Kecepatan Pencairan Dana MBG</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Tren pengeluaran 30 hari terakhir</CardDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
               <TrendingUp className="size-3.5" />
               <span className="text-xs font-bold">+18.4%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Alokasi APBN</p>
               <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                 <Wallet className="size-5" />
               </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-foreground">Rp 71.000.000.000.000</h3>
              <p className="text-xs text-muted-foreground font-medium italic">*Anggaran Tahun 2026</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Tersalurkan</p>
               <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                 <TrendingUp className="size-5" />
               </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-foreground">Rp 14.250.500.000</h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Realisasi Anggaran</span>
                  <span className="text-primary">20.1%</span>
                </div>
                <Progress value={20.1} className="h-2 bg-slate-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Sisa Anggaran</p>
               <div className="size-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                 <RefreshCw className="size-5" />
               </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-emerald-600">Rp 56.749.500.000</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <div className="size-1.5 bg-emerald-500 rounded-full" />
                Alokasi aman (Threshold &gt; 70%)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Contract Ledger Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold tracking-tight">Riwayat Transaksi Terkini</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Buku besar publik untuk pencairan dana via Smart Contract.</CardDescription>
          </div>
          <Button variant="ghost" className="text-xs font-bold text-primary gap-1">
            Lihat Semua <ChevronRight className="size-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/50">
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pl-8">Nama Mitra</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Tanggal & Waktu</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Nominal (Rp)</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pr-8 text-right">Bukti</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="group border-border/50">
                <TableCell className="font-bold text-foreground pl-8 py-5">Catering Ibu Budi</TableCell>
                <TableCell className="text-muted-foreground font-medium text-xs">14 Mar 2026, 09:30</TableCell>
                <TableCell className="font-black text-foreground">Rp 45.000.000</TableCell>
                <TableCell>
                  <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2 py-0.5 text-[10px] uppercase">
                    Tercairkan
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Button variant="ghost" size="sm" className="size-8 p-0 rounded-full text-primary hover:bg-primary/5">
                    <ExternalLink className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow className="group border-border/50">
                <TableCell className="font-bold text-foreground pl-8 py-5">Dapur Nusantara</TableCell>
                <TableCell className="text-muted-foreground font-medium text-xs">14 Mar 2026, 11:15</TableCell>
                <TableCell className="font-black text-foreground">Rp 120.500.000</TableCell>
                <TableCell>
                  <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-100 font-bold px-2 py-0.5 text-[10px] uppercase">
                    Tertahan (Smart Contract)
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Button variant="ghost" size="sm" className="size-8 p-0 rounded-full text-primary hover:bg-primary/5">
                    <ExternalLink className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow className="group border-border/50">
                <TableCell className="font-bold text-foreground pl-8 py-5">Berkah Catering Jaya</TableCell>
                <TableCell className="text-muted-foreground font-medium text-xs">13 Mar 2026, 16:45</TableCell>
                <TableCell className="font-black text-foreground">Rp 88.200.000</TableCell>
                <TableCell>
                  <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2 py-0.5 text-[10px] uppercase">
                    Tercairkan
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <Button variant="ghost" size="sm" className="size-8 p-0 rounded-full text-primary hover:bg-primary/5">
                    <ExternalLink className="size-4" />
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
