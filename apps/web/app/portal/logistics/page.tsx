"use client"

import * as React from "react"
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
  ArrowRight
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

export default function LogisticsPage() {
  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pemantauan Logistik MBG</h2>
          <p className="text-muted-foreground text-sm">Pemantauan real-time status armada dan waktu pengiriman dari Dapur SPPG ke Sekolah.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-10 bg-card border-border rounded-full" placeholder="Cari ID Pengiriman..." />
          </div>
          <Button className="gap-2 px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold rounded-full">
            <FileText className="size-4" />
            Unduh Manifes
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Sedang Dalam Perjalanan</p>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-4xl font-black text-foreground">42</h3>
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50">+4 Aktif</Badge>
                </div>
              </div>
              <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Truck className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Risiko Terlambat / Basi</p>
                <div className="space-y-1">
                  <h3 className="text-4xl font-black text-amber-500">7</h3>
                  <p className="text-xs text-muted-foreground font-medium italic">Melewati batas SLA 2 jam</p>
                </div>
              </div>
              <div className="size-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                <AlertTriangle className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Selesai & Tervalidasi</p>
                <div className="space-y-1">
                  <h3 className="text-4xl font-black text-emerald-600">1,248</h3>
                  <p className="text-xs text-muted-foreground font-medium italic">Tervalidasi oleh Guru & AI</p>
                </div>
              </div>
              <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestone Timeline */}
        <Card className="lg:col-span-1 bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold">Status Pengiriman: <span className="text-primary">#TRX-9921</span></CardTitle>
              <Badge className="bg-blue-50 text-blue-600 border-blue-100 uppercase text-[10px] font-bold">Transit</Badge>
            </div>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-8 pl-6 border-l-2 border-slate-100 ml-3">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[33px] size-6 bg-emerald-500 rounded-full border-4 border-background shadow-sm flex items-center justify-center">
                  <CheckCircle2 className="size-3 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Dapur SPPG</p>
                    <span className="text-[10px] font-bold text-slate-400">06:00 AM</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Departed: Kebayoran Baru</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="size-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">AI Validasi Gizi: Lolos</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[33px] size-6 bg-primary rounded-full border-4 border-background shadow-sm flex items-center justify-center animate-pulse">
                  <Truck className="size-3 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primary">Sedang Dikirim</p>
                    <span className="text-[10px] font-bold text-primary animate-pulse">Live</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Current: Jalan Tol Sektor 7</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="size-1.5 bg-blue-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">GPS Aktif (Speed: 45 km/h)</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-[33px] size-6 bg-slate-100 rounded-full border-4 border-background shadow-sm flex items-center justify-center">
                  <MapPin className="size-3 text-slate-400" />
                </div>
                <div className="space-y-1 opacity-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-500">Tiba di Sekolah</p>
                    <span className="text-[10px] font-bold text-slate-400 italic">ETD: 07:30 AM</span>
                  </div>
                  <p className="text-xs text-muted-foreground">SDN 01 Menteng Pagi</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="size-3 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Menunggu Scan QR Guru</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-8 rounded-full h-10 border-slate-200 text-xs font-bold gap-2 text-slate-600 hover:bg-slate-50">
              Detail Perjalanan <ChevronRight className="size-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Live Map */}
        <Card className="lg:col-span-2 bg-card border-border shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-primary" />
              <CardTitle className="text-base font-bold">Pelacakan GPS Real-time</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-8 px-3 rounded-full border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <RefreshCw className="size-3" />
              Refresh GPS
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-4 pt-0">
            <div className="relative h-full min-h-[400px] w-full bg-muted rounded-2xl overflow-hidden border border-slate-100">
               {/* Mock Map Texture */}
               <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1569336415962-a4bd4f79c3f2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
               
               {/* Map Pins */}
               <div className="absolute top-1/4 left-1/3 group cursor-pointer">
                  <div className="bg-white p-1 rounded-lg shadow-xl border border-slate-100 flex items-center gap-2 mb-1 translate-x-[-40%] scale-0 group-hover:scale-100 transition-all origin-bottom">
                    <span className="text-[10px] font-bold whitespace-nowrap px-1">Dapur Berkah</span>
                  </div>
                  <MapPin className="size-8 text-emerald-500 fill-emerald-50 drop-shadow-md" />
               </div>

               <div className="absolute top-1/2 left-1/2 group cursor-pointer">
                  <div className="bg-white p-1.5 rounded-xl shadow-2xl border border-primary/20 flex flex-col gap-0.5 mb-2 translate-x-[-40%] ring-4 ring-primary/5">
                    <span className="text-[10px] font-black text-primary uppercase">#TRX-9921</span>
                    <span className="text-[9px] font-bold text-slate-500">OTW Menteng</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 size-8 bg-primary rounded-full animate-ping opacity-20" />
                    <Truck className="size-8 text-primary fill-primary/10 drop-shadow-xl relative z-10" />
                  </div>
               </div>

               <div className="absolute bottom-1/3 right-1/4 group cursor-pointer">
                  <MapPin className="size-8 text-blue-500 fill-blue-50 drop-shadow-md" />
               </div>

               {/* Map Overlay Stats */}
               <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                  <div className="flex-1 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-border shadow-lg flex items-center gap-4">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Estimasi Tiba</p>
                      <p className="text-sm font-black text-foreground">12 Menit Lagi</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-border shadow-lg flex items-center gap-4">
                    <div className="size-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                      <Navigation className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Jarak Tempuh</p>
                      <p className="text-sm font-black text-foreground">4.2 km</p>
                    </div>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Table */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold">Riwayat Perjalanan Logistik</CardTitle>
            <CardDescription className="text-muted-foreground font-medium italic">Data manifes harian pengiriman makanan bergizi.</CardDescription>
          </div>
          <Button variant="ghost" className="text-xs font-bold text-primary gap-1 hover:bg-primary/5 rounded-full">
            Semua Riwayat <ArrowRight className="size-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/50">
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pl-8">ID Pengiriman</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Nama Mitra</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Tujuan (Sekolah)</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Waktu Berangkat</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pr-8 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="group border-border/50">
                <TableCell className="font-black text-primary pl-8 py-5">#TRX-9921</TableCell>
                <TableCell className="font-bold text-foreground">Catering Ibu Budi</TableCell>
                <TableCell className="text-slate-600 font-medium">SDN 01 Menteng Pagi</TableCell>
                <TableCell className="text-slate-500 font-medium text-xs">06:00 AM</TableCell>
                <TableCell className="text-right pr-8">
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase text-[9px] px-2 py-0.5">Di Jalan</Badge>
                </TableCell>
              </TableRow>

              <TableRow className="group border-border/50">
                <TableCell className="font-black text-primary pl-8 py-5">#TRX-9918</TableCell>
                <TableCell className="font-bold text-foreground">Dapur Nusantara</TableCell>
                <TableCell className="text-slate-600 font-medium">SMPN 216 Jakarta</TableCell>
                <TableCell className="text-slate-500 font-medium text-xs">05:45 AM</TableCell>
                <TableCell className="text-right pr-8">
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase text-[9px] px-2 py-0.5">Terkirim</Badge>
                </TableCell>
              </TableRow>

              <TableRow className="group border-border/50">
                <TableCell className="font-black text-primary pl-8 py-5">#TRX-9915</TableCell>
                <TableCell className="font-bold text-foreground">Berkah Catering Jaya</TableCell>
                <TableCell className="text-slate-600 font-medium">SDN 05 Tanah Abang</TableCell>
                <TableCell className="text-slate-500 font-medium text-xs">05:15 AM</TableCell>
                <TableCell className="text-right pr-8">
                  <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 font-bold uppercase text-[9px] px-2 py-0.5">Terlambat</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
