"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import { 
  Truck, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  FileText
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

export default function SupplierReportsPage() {
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  const wholesaleVolumeChartOptions: any = {
    chart: { type: 'bar', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#ea580c'], // orange-600
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      }
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: {
      categories: ['Min 1', 'Min 2', 'Min 3', 'Min 4'],
      labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 600 } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { 
      labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 600 }, formatter: (val: number) => `${val} Ton` } 
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
    tooltip: { theme: 'light' }
  };

  const wholesaleVolumeSeries = [{ name: 'Volume Grosir (Ton)', data: [120, 145, 130, 185] }];

  const deliverySlaChartOptions: any = {
    chart: { type: 'radialBar' },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: '60%' },
        track: { background: '#f1f5f9', strokeWidth: '100%' },
        dataLabels: {
          name: { offsetY: 20, fontSize: '10px', color: '#64748b', fontWeight: 600 },
          value: { offsetY: -10, fontSize: '28px', color: '#0f172a', fontWeight: 900, formatter: (val: number) => `${val}%` }
        }
      }
    },
    colors: ['#ea580c'],
    stroke: { lineCap: 'round' },
    labels: ['On-Time Rate']
  };

  const deliverySlaSeries = [96];

  return (
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-500 pb-12">
      
      {/* SUPPLIER ORANGE HERO SECTION */}
      <div className="relative bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Truck className="size-64" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full flex w-fit items-center gap-1.5">
                <Store className="size-3" /> Supplier B2B
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Laporan Distribusi & B2B
              </h1>
              <p className="text-orange-100/80 font-medium text-sm max-w-2xl leading-relaxed">
                Pantau metrik penjualan grosir bulanan, tingkat ketepatan waktu pengiriman (SLA), dan rasio retur barang dari rantai pasok ke Vendor.
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" className="h-12 px-6 bg-transparent text-white border-white/20 hover:bg-white/10 font-bold rounded-2xl gap-2 transition-colors">
                <Calendar className="size-4" />
                Periode Q3
              </Button>
              <Button className="h-12 px-6 bg-white text-orange-900 hover:bg-orange-50 font-bold rounded-2xl gap-2 transition-transform active:scale-95 border-none">
                <Download className="size-4" />
                Ekspor Laporan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Overlapping Hero) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 -mt-20 space-y-6">
        
        {/* KPI Cards (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volume Terjual (Grosir)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">580 <span className="text-sm">Ton</span></h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center"><TrendingUp className="size-3 mr-0.5" /> +12%</span>
                </div>
              </div>
              <div className="size-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
                <Package className="size-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ketepatan SLA Logistik</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">96%</h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center"><ShieldCheck className="size-3 mr-0.5" /> Top Tier</span>
                </div>
              </div>
              <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                <Clock className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tingkat Retur (Rusak)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">1.2%</h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center"><TrendingDown className="size-3 mr-0.5" /> Membaik</span>
                </div>
              </div>
              <div className="size-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100">
                <AlertTriangle className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cakupan Vendor BGN</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">84 <span className="text-sm">Mitra</span></h3>
                  <span className="text-xs font-bold text-orange-600">+5 Mitra Baru</span>
                </div>
              </div>
              <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Store className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-[24px] border border-slate-200 bg-white overflow-hidden flex flex-col">
            <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Tren Volume Pengiriman Grosir</CardTitle>
                <CardDescription className="text-xs font-medium mt-1">Tonase barang pokok yang didistribusikan per minggu (Bulan Ini).</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 border-slate-200">
                Bulan Ini
              </Badge>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-end">
              <div className="h-[250px] w-full">
                <ReactApexChart options={wholesaleVolumeChartOptions} series={wholesaleVolumeSeries} type="bar" height="100%" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border border-slate-200 bg-white overflow-hidden flex flex-col">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="text-base font-bold text-slate-900">Performa Delivery SLA</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Persentase pengiriman tiba sesuai target waktu di Vendor.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col items-center justify-center relative">
              <div className="w-full max-w-[250px] -mt-4">
                <ReactApexChart options={deliverySlaChartOptions} series={deliverySlaSeries} type="radialBar" width="100%" />
              </div>
              <div className="absolute bottom-6 w-full px-8">
                <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 flex items-start gap-3">
                  <MapPin className="size-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                    Sistem mencatat <strong className="text-slate-900">96%</strong> dari 420 rute pengiriman minggu ini tiba sebelum pukul 06:00 pagi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail Table */}
        <Card className="rounded-[24px] border border-slate-200 bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-50">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Rekapitulasi Pengiriman B2B Terkini</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Status logistik ke berbagai mitra Vendor (Dapur Pusat) hari ini.</CardDescription>
            </div>
            <Button variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-600 rounded-lg gap-2">
              <FileText className="size-3" /> Lihat PO Lengkap
            </Button>
          </CardHeader>
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-10">PO ID</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10">Tujuan (Vendor)</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10">Komoditas Utama</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10 text-center">Volume</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10">Status Logistik</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "PO-BGN-881", vendor: "Dapur Ibu Pertiwi (Jaksel)", items: "Ayam, Telur", volume: "1.2 Ton", status: "Terkirim", statusColor: "emerald" },
                  { id: "PO-BGN-882", vendor: "Katering Sejahtera (Depok)", items: "Beras, Sayuran", volume: "850 Kg", status: "Dalam Perjalanan", statusColor: "blue" },
                  { id: "PO-BGN-883", vendor: "CV Makmur Abadi (Bekasi)", items: "Minyak, Bumbu", volume: "200 Liter", status: "Terkirim", statusColor: "emerald" },
                  { id: "PO-BGN-884", vendor: "Dapur Ceria (Tangerang)", items: "Daging Sapi", volume: "450 Kg", status: "Kendala Rute", statusColor: "amber" },
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
                      <p className="font-bold text-slate-900 text-xs">{row.id}</p>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-semibold text-slate-600 text-xs">{row.vendor}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-bold text-slate-900 text-xs">{row.items}</span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="font-bold text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200">{row.volume}</span>
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
