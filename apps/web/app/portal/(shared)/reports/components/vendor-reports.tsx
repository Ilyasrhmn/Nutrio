"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import { 
  FileText, 
  UtensilsCrossed, 
  TrendingDown, 
  PieChart, 
  Download,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Scale,
  Wallet,
  Clock
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
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

export default function VendorReportsPage() {
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  const foodCostChartOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#10b981'], // emerald-500
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 600 } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { show: false },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
    tooltip: { theme: 'light' }
  };

  const foodCostSeries = [{ name: 'Pengeluaran (Rp)', data: [2100000, 1950000, 2300000, 1800000, 2400000, 2150000] }];

  const wastageChartOptions: any = {
    chart: { type: 'donut' },
    labels: ['Sayur & Buah', 'Daging & Protein', 'Karbohidrat', 'Bumbu & Lainnya'],
    colors: ['#10b981', '#f59e0b', '#3b82f6', '#94a3b8'],
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, fontSize: '10px', fontWeight: 600, color: '#64748b' },
            value: { show: true, fontSize: '24px', fontWeight: 900, color: '#0f172a', formatter: (val: string) => `${val} Kg` },
            total: { show: true, showAlways: true, label: 'Total Sisa', fontSize: '10px', color: '#64748b', formatter: function (w: any) {
              return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0) + " Kg"
            }}
          }
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    legend: { show: false }
  };

  const wastageSeries = [12, 4, 8, 2];

  return (
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-500 pb-12">
      
      {/* VENDOR GREEN HERO SECTION */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <UtensilsCrossed className="size-64" />
        </div>
        
        <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <Badge className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full flex w-fit items-center">
                Dapur Pusat
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Laporan Operasional Dapur
              </h1>
              <p className="text-emerald-100/80 font-medium text-sm max-w-2xl leading-relaxed">
                Pantau efisiensi pengeluaran bahan baku (Food Cost), persentase sisa makanan (Wastage), dan tingkat ketercapaian target porsi harian.
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" className="h-12 px-6 bg-transparent text-white border-white/20 hover:bg-white/10 font-bold rounded-2xl gap-2 transition-colors">
                <Calendar className="size-4" />
                Bulan Ini
              </Button>
              <Button className="h-12 px-6 bg-white text-emerald-900 hover:bg-emerald-50 shadow-sm font-bold rounded-2xl gap-2 transition-transform active:scale-95 border-none">
                <Download className="size-4" />
                Unduh PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Overlapping Hero) */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-6 lg:px-12 -mt-20 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Porsi Terkirim</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">12.450</h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center"><TrendingUp className="size-3 mr-0.5" /> +5%</span>
                </div>
              </div>
              <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                <UtensilsCrossed className="size-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Food Cost Ratio</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">42.5%</h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center"><TrendingDown className="size-3 mr-0.5" /> Ideal</span>
                </div>
              </div>
              <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                <Wallet className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sisa Bahan (Wastage)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">26 <span className="text-sm">kg</span></h3>
                  <span className="text-xs font-bold text-red-500 flex items-center"><TrendingUp className="size-3 mr-0.5" /> +2kg</span>
                </div>
              </div>
              <div className="size-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100">
                <Scale className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ketepatan Waktu Masak</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">98%</h3>
                  <span className="text-xs font-bold text-emerald-600">Sesuai SLA</span>
                </div>
              </div>
              <div className="size-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                <Clock className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-[24px] border border-slate-200 bg-white overflow-hidden flex flex-col">
            <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Tren Pengeluaran Bahan Baku</CardTitle>
                <CardDescription className="text-xs font-medium mt-1">Total belanja harian dari Supplier dalam seminggu terakhir.</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 border-slate-200">
                Minggu Ini
              </Badge>
            </CardHeader>
            <CardContent className="p-6 md:p-8 flex-1 flex flex-col justify-end">
              <div className="h-[250px] w-full">
                <ReactApexChart options={foodCostChartOptions} series={foodCostSeries} type="area" height="100%" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border border-slate-200 bg-white overflow-hidden flex flex-col">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="text-base font-bold text-slate-900">Analisis Sisa Bahan (Wastage)</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Rincian sisa bahan dapur yang terbuang berdasarkan kategori.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-[220px]">
                <ReactApexChart options={wastageChartOptions} series={wastageSeries} type="donut" width="100%" />
              </div>
              
              <div className="w-full mt-8 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2"><div className="size-2.5 rounded-full bg-emerald-500" /> Sayur & Buah</div>
                  <span className="text-slate-900">12 Kg</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2"><div className="size-2.5 rounded-full bg-amber-500" /> Daging & Protein</div>
                  <span className="text-slate-900">4 Kg</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2"><div className="size-2.5 rounded-full bg-blue-500" /> Karbohidrat</div>
                  <span className="text-slate-900">8 Kg</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail Table */}
        <Card className="rounded-[24px] border border-slate-200 bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-50">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Log Produksi Dapur Harian</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Rincian target porsi vs realisasi setiap harinya.</CardDescription>
            </div>
            <Button variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-600 rounded-lg gap-2">
              <FileText className="size-3" /> Rekap Lengkap
            </Button>
          </CardHeader>
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-10">Tanggal</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10">Menu Utama</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10 text-center">Target Porsi</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10 text-center">Realisasi</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10">Status Kualitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { date: "12 Nov 2023", menu: "Ayam Goreng Mentega", target: 500, real: 500, status: "Aman", statusColor: "emerald" },
                  { date: "11 Nov 2023", menu: "Ikan Fillet Asam Manis", target: 500, real: 495, status: "Evaluasi (Porsi Kurang)", statusColor: "amber" },
                  { date: "10 Nov 2023", menu: "Soto Ayam Lamongan", target: 500, real: 500, status: "Aman", statusColor: "emerald" },
                  { date: "09 Nov 2023", menu: "Telur Balado Pedas", target: 500, real: 500, status: "Aman", statusColor: "emerald" },
                ].map((row, i) => (
                  <TableRow 
                    key={i} 
                    className={cn(
                      "group border-none transition-colors rounded-xl overflow-hidden",
                      hoveredRow === i ? "bg-slate-50" : "bg-transparent"
                    )}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell className="pl-6 py-3">
                      <p className="font-bold text-slate-900 text-xs">{row.date}</p>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-semibold text-slate-600 text-xs">{row.menu}</span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="font-bold text-slate-900 text-xs">{row.target}</span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className={cn("font-bold text-xs", row.real < row.target ? "text-amber-600" : "text-emerald-600")}>
                        {row.real}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-1.5 rounded-full", `bg-${row.statusColor}-500`)} />
                        <span className={cn("text-[10px] font-bold tracking-widest uppercase", `text-${row.statusColor}-700`)}>
                          {row.status}
                        </span>
                      </div>
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
