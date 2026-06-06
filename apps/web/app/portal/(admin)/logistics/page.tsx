"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { 
  Search, 
  FileText, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Navigation, 
  Clock, 
  MoreHorizontal,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  Package
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

// Reuse the MapView we created for the Map Distribution Page
const MapView = dynamic(() => import("@/components/dashboard/map-view"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 space-y-4 rounded-3xl border border-slate-100">
      <div className="size-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Memuat GPS Tracking...</p>
    </div>
  )
})

export default function LogisticsPage() {
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  // Example tracking location for the map
  const activeTracker = [
    {
      id: 1,
      name: "Dapur SPPG Kebayoran",
      location: "Titik Asal",
      status: "Berangkat",
      variant: "success",
      capacity: "TRX-9921",
      lat: -7.7656, 
      lng: 110.3725,
      color: "#3b82f6" // blue-500 for active tracker
    },
    {
      id: 2,
      name: "SDN 01 Menteng",
      location: "Tujuan (Sekolah)",
      status: "Menunggu",
      variant: "warning",
      capacity: "TRX-9921",
      lat: -7.7336, 
      lng: 110.3925,
      color: "#cbd5e1" // slate-300 for destination
    }
  ]

  return (
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-500">
      
      {/* VIBRANT HERO SECTION (Marketplace Style) */}
      <div className="relative bg-[#0064D2] pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2000&auto=format&fit=crop')] mix-blend-overlay opacity-20 bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -bottom-24 -right-24 size-96 bg-blue-400/30 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <Badge className="bg-white/10 text-blue-50 border border-white/20 hover:bg-white/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                Sistem Pengawasan Terpadu
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Pemantauan Logistik MBG
              </h1>
              <p className="text-blue-100 font-medium text-sm max-w-2xl">
                Pantau pergerakan armada pengiriman secara real-time dari Dapur SPPG ke Sekolah. Didukung AI untuk mendeteksi deviasi rute dan estimasi keterlambatan.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-blue-200" />
                <Input 
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-blue-200 rounded-2xl h-12 focus-visible:ring-white/30 font-medium shadow-inner" 
                  placeholder="Lacak No. Pengiriman (TRX)..." 
                />
              </div>
              <Button className="h-12 px-6 bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-black/10 font-bold rounded-2xl gap-2 transition-transform active:scale-95">
                <FileText className="size-4" />
                Manifes Harian
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Overlapping Hero) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 -mt-20 space-y-8 pb-12">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Truck className="size-32" />
            </div>
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sedang Berjalan</p>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter">42</h3>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 rounded-full font-bold text-[10px]">+4 Armada Aktif</Badge>
                  </div>
                </div>
                <div className="size-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <Truck className="size-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <AlertTriangle className="size-32" />
            </div>
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Risiko Terlambat</p>
                  <div className="space-y-1.5">
                    <h3 className="text-5xl font-black text-amber-500 tracking-tighter">7</h3>
                    <p className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-md inline-flex items-center gap-1.5">
                      <Clock className="size-3" /> Mendekati batas SLA
                    </p>
                  </div>
                </div>
                <div className="size-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                  <AlertTriangle className="size-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <CheckCircle2 className="size-32" />
            </div>
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tervalidasi (Hari Ini)</p>
                  <div className="space-y-1.5">
                    <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">1,248</h3>
                    <p className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-md inline-flex items-center gap-1.5">
                      <CheckCircle2 className="size-3" /> Validasi Guru & AI
                    </p>
                  </div>
                </div>
                <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 className="size-7" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* GPS Tracking Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Tracking Status Card */}
          <Card className="xl:col-span-1 rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <Badge className="bg-blue-100 text-blue-700 border-none px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-widest mb-1.5">Tracking Aktif</Badge>
                <CardTitle className="text-lg font-bold">Resi: <span className="text-blue-600">#TRX-9921</span></CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-slate-900 rounded-full bg-white border border-slate-200 shadow-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 lg:p-8 flex-1">
              <div className="relative space-y-10 pl-8 border-l-2 border-slate-100 ml-4">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[45px] size-8 bg-emerald-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                    <CheckCircle2 className="size-4 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-slate-900">Dapur SPPG Kebayoran</p>
                      <span className="text-xs font-bold text-slate-400">06:00 AM</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Pick-up Selesai</p>
                    <div className="inline-flex items-center gap-1.5 mt-2 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      <div className="size-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">AI Cek Gizi: Lolos</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 (Active) */}
                <div className="relative">
                  <div className="absolute -left-[45px] size-8 bg-blue-600 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-40" />
                    <Truck className="size-4 text-white relative z-10" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-blue-700">Dalam Perjalanan</p>
                      <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">Live</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600">Melalui Jl. Tol Sektor 7</p>
                    <div className="inline-flex items-center gap-2 mt-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Navigation className="size-3.5 text-blue-500" />
                      <span className="text-xs font-bold text-slate-700">Kecepatan: 45 km/h</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 (Pending) */}
                <div className="relative">
                  <div className="absolute -left-[45px] size-8 bg-slate-100 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                    <MapPin className="size-4 text-slate-300" />
                  </div>
                  <div className="space-y-1.5 opacity-50">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-slate-500">SDN 01 Menteng</p>
                      <span className="text-xs font-bold text-slate-400 italic">Est: 07:30 AM</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Menunggu Kedatangan</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* REAL Interactive Map */}
          <Card className="xl:col-span-2 rounded-[24px] border border-slate-200/60 shadow-sm bg-white flex flex-col overflow-hidden relative">
            
            {/* Map Overlay Header */}
            <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 pointer-events-auto">
                <div className="size-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Navigation className="size-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live GPS Monitor</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update tiap 15 detik</p>
                </div>
              </div>
              <Button className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 shadow-lg border border-slate-100 h-10 px-4 rounded-xl font-bold gap-2 pointer-events-auto">
                <RefreshCw className="size-4" />
                Sync
              </Button>
            </div>

            {/* The Map itself */}
            <div className="flex-1 bg-slate-100 relative min-h-[400px]">
              <MapView vendors={activeTracker} />
            </div>

            {/* Floating Stats over Map (Bottom) */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex gap-4 pointer-events-none flex-col sm:flex-row">
              <div className="flex-1 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white flex items-center gap-4 pointer-events-auto hover:scale-[1.02] transition-transform">
                <div className="size-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100">
                  <Clock className="size-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimasi Waktu Tiba</p>
                  <p className="text-2xl font-black text-slate-900">12 <span className="text-base font-bold text-slate-500">Menit</span></p>
                </div>
              </div>
              <div className="flex-1 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white flex items-center gap-4 pointer-events-auto hover:scale-[1.02] transition-transform">
                <div className="size-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 ring-1 ring-amber-100">
                  <Navigation className="size-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jarak Tersisa</p>
                  <p className="text-2xl font-black text-slate-900">4.2 <span className="text-base font-bold text-slate-500">Km</span></p>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* History Table (Rich E-commerce Style) */}
        <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 md:px-8 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-bold">Riwayat & Manifes Harian</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Data operasional logistik hari ini.</CardDescription>
            </div>
            <Button variant="ghost" className="text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl gap-2">
              Lihat Semua <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-12">Detail Pengiriman</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 hidden md:table-cell">Tujuan</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 text-center">Jadwal</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-6 h-12 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "#TRX-9921", vendor: "Catering Ibu Budi", dest: "SDN 01 Menteng", time: "06:00 AM", status: "Di Jalan", color: "blue", icon: Truck },
                  { id: "#TRX-9918", vendor: "Dapur Nusantara", dest: "SMPN 216 Jakarta", time: "05:45 AM", status: "Terkirim", color: "emerald", icon: CheckCircle2 },
                  { id: "#TRX-9915", vendor: "Berkah Catering", dest: "SDN 05 Tanah Abang", time: "05:15 AM", status: "Terlambat", color: "red", icon: AlertTriangle },
                  { id: "#TRX-9912", vendor: "Sari Rasa Katering", dest: "SMAN 8 Jakarta", time: "05:00 AM", status: "Terkirim", color: "emerald", icon: CheckCircle2 },
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
                          <p className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{item.id}</p>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">{item.vendor}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700 text-sm">{item.dest}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Clock className="size-3.5 text-slate-500" />
                        <span className="text-xs font-bold text-slate-700">{item.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Badge className={cn(
                          "border-none font-bold uppercase text-[9px] px-3 py-1 tracking-widest",
                          item.status === 'Di Jalan' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'Terkirim' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        )}>
                          {item.status}
                        </Badge>
                        <div className={cn(
                          "size-8 rounded-full flex items-center justify-center transition-all",
                          hoveredRow === i ? "bg-white shadow-sm text-slate-900 border border-slate-200" : "text-slate-300"
                        )}>
                          <ChevronRight className="size-4" />
                        </div>
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
