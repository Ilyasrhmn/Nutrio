"use client"

import * as React from "react"
import { 
  Search, 
  Bell, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Map as MapIcon,
  RefreshCw,
  Filter,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Store,
  Package,
  MessageSquare,
  ArrowUpRight,
  Eye,
  ShoppingCart
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
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/common"

export default function DashboardPage() {
  const { user } = useAuth()
  const isSupplier = user?.role === UserRole.SUPPLIER

  if (isSupplier) {
    return <SupplierDashboard />
  }

  return <AdminDashboard />
}

function SupplierDashboard() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Supplier</h2>
          <p className="text-muted-foreground font-medium text-sm">Selamat datang kembali, PT Tani Makmur Sejahtera.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500 text-white border-none font-bold px-3 py-1">Verified Supplier</Badge>
          <Button variant="outline" size="icon" className="rounded-full relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-white"></span>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "View Profil", value: "1,240", change: "+12%", icon: Eye, color: "blue" },
          { label: "Chat Masuk", value: "24", change: "+5", icon: MessageSquare, color: "primary" },
          { label: "Produk Aktif", value: "12", change: "Stabil", icon: Package, color: "amber" },
          { label: "Total Pesanan", value: "86", change: "+8%", icon: ShoppingCart, color: "emerald" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`size-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center text-${stat.color}-600`}>
                  <stat.icon className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-none bg-slate-50">{stat.change}</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inquiries */}
        <Card className="lg:col-span-2 border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
            <div>
              <CardTitle className="text-lg font-bold">Permintaan Penawaran Terbaru</CardTitle>
              <CardDescription>Vendor yang tertarik dengan produk Anda.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Lihat Semua</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                  <TableHead className="font-black text-[10px] uppercase pl-6 text-slate-400">Vendor</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Produk</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-slate-400">Kuantitas</TableHead>
                  <TableHead className="font-black text-[10px] uppercase pr-6 text-right text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Catering Ibu Budi", product: "Daging Ayam", qty: "200 kg", time: "2m ago" },
                  { name: "Dapur Nusantara", product: "Beras Rojolele", qty: "500 kg", time: "15m ago" },
                  { name: "Mitra SPPG Tebet", product: "Telur Grade A", qty: "50 kg", time: "1h ago" },
                ].map((row, i) => (
                  <TableRow key={i} className="group border-slate-50">
                    <TableCell className="font-bold text-slate-900 pl-6">{row.name}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{row.product}</TableCell>
                    <TableCell className="font-black text-slate-900">{row.qty}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5 font-bold text-[11px]">
                        Balas Chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Shop Performance Summary */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm rounded-3xl bg-slate-900 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Store className="size-24" />
            </div>
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="space-y-2">
                <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Kesehatan Toko</p>
                <h3 className="text-3xl font-black">Sempurna</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Respons Chat</span>
                  <span className="text-sm font-black text-primary">98%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98%]" />
                </div>
              </div>
              <Button className="w-full rounded-full font-bold bg-white text-slate-900 hover:bg-white/90 gap-2">
                Buka Etalase <ArrowUpRight className="size-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Tips BGN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="size-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle className="size-4" />
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-600">
                  Foto produk <span className="font-bold text-slate-900">Beras Rojolele</span> sudah berumur 6 bulan. Update foto riil terbaru untuk mempertahankan badge verifikasi.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">BGN Command Center</h2>
          <p className="text-muted-foreground text-sm">Pemantauan real-time vendor MBG nasional.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-10 bg-card border-border" placeholder="Cari vendor atau audit..." />
          </div>
          <Button variant="outline" size="icon" className="rounded-full bg-card border-border relative">
            <Bell className="size-4 text-muted-foreground" />
            <span className="absolute top-2 right-2.5 size-2 bg-destructive rounded-full border-2 border-card"></span>
          </Button>
          <Button className="gap-2 px-5 bg-primary text-primary-foreground hover:bg-primary/90">
            {/* <FileDown className="size-4" /> */}
            Export Laporan PDF
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Vendor Aktif</p>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-foreground">19,412</h3>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <TrendingUp className="size-4" />
                    <span className="text-xs font-bold">+2.4%</span>
                    <span className="text-xs text-muted-foreground font-normal">minggu ini</span>
                  </div>
                </div>
              </div>
              <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Users className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Rata-rata Kepatuhan SOP</p>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-foreground">87%</h3>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <TrendingUp className="size-4" />
                    <span className="text-xs font-bold">+5.2%</span>
                    <span className="text-xs text-muted-foreground font-normal">vs bulan lalu</span>
                  </div>
                </div>
              </div>
              <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <CheckCircle className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Vendor Risiko Tinggi</p>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-destructive">48</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="h-5 px-2 text-[10px] animate-pulse">Critical</Badge>
                    <span className="text-xs text-muted-foreground">butuh intervensi</span>
                  </div>
                </div>
              </div>
              <div className="size-12 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive">
                <AlertCircle className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peta Sebaran Nasional */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <MapIcon className="size-4 text-primary" />
              <CardTitle className="text-base font-bold">Peta Sebaran Nasional</CardTitle>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-emerald-500"></div>
                <span className="text-muted-foreground">Aman</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-amber-500"></div>
                <span className="text-muted-foreground">Waspada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-destructive"></div>
                <span className="text-muted-foreground">Bahaya</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="relative h-[400px] w-full bg-muted rounded-xl overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555505019-8c3f4c19e309?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale"></div>
               <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="bg-background/80 backdrop-blur-md px-6 py-3 rounded-full border border-border shadow-xl">
                    <p className="text-sm font-bold text-primary">MAP VIEW: INDONESIA ARCHIPELAGO</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="size-4 bg-emerald-500 rounded-full border-2 border-background shadow-lg ring-4 ring-emerald-500/20"></div>
                    <div className="size-4 bg-amber-500 rounded-full border-2 border-background shadow-lg ring-4 ring-amber-500/20"></div>
                    <div className="size-4 bg-destructive rounded-full border-2 border-background shadow-lg ring-4 ring-destructive/20"></div>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Alert & Compliance */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <ShieldCheck className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Live Alert & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alert Item 1 */}
            <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="text-xs font-bold text-destructive uppercase">Critical</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">1m ago</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground leading-tight">AI Mismatch: Nutrisi Kurang</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dapur X (Jakarta Selatan): Deteksi protein hewani tidak sesuai standar porsi MBG.
                </p>
              </div>
              <Button size="sm" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm font-bold text-[10px] uppercase tracking-wider h-8">
                Tindak Lanjut
              </Button>
            </div>

            {/* Alert Item 2 */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase">Warning</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">12m ago</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground leading-tight">SOP Terlewat: Logistik</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dapur Y (Bandung): Armada pengiriman terlambat 15 menit dari jadwal distribusi.
                </p>
              </div>
            </div>
            
            <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary transition-colors gap-1">
              Lihat Semua Laporan <ChevronRight className="size-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Live Vendor Monitoring Table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold">Live Vendor Monitoring</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Data real-time kepatuhan vendor nasional</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 h-9 px-3 text-muted-foreground font-semibold border-border bg-card">
              <Filter className="size-3.5" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-9 px-3 text-muted-foreground font-semibold border-border bg-card">
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-t border-border">
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider pl-6">Nama Dapur</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Lokasi</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Skor Gizi (AI)</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Status SOP</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="group border-border">
                <TableCell className="font-semibold text-foreground pl-6">Catering Ibu Budi</TableCell>
                <TableCell className="text-muted-foreground font-medium">Jakarta Selatan</TableCell>
                <TableCell>
                  <Badge variant="success" className="font-bold text-[10px] px-2 py-0.5 rounded-md">98% (Sesuai)</Badge>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-1.5 text-foreground font-medium">
                     <div className="size-1.5 rounded-full bg-emerald-500"></div>
                     Sesuai SOP
                   </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5 font-bold text-xs h-8">
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
              
              <TableRow className="group border-border">
                <TableCell className="font-semibold text-foreground pl-6">Dapur Nusantara</TableCell>
                <TableCell className="text-muted-foreground font-medium">Surabaya</TableCell>
                <TableCell>
                  <Badge variant="success" className="font-bold text-[10px] px-2 py-0.5 rounded-md">92% (Sesuai)</Badge>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-1.5 text-foreground font-medium">
                     <div className="size-1.5 rounded-full bg-emerald-500"></div>
                     Sesuai SOP
                   </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5 font-bold text-xs h-8">
                    Detail
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow className="group border-border">
                <TableCell className="font-semibold text-foreground pl-6">Berkah Catering</TableCell>
                <TableCell className="text-muted-foreground font-medium">Bandung</TableCell>
                <TableCell>
                  <Badge variant="destructive" className="font-bold text-[10px] px-2 py-0.5 rounded-md">65% (Rendah)</Badge>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-1.5 text-destructive font-medium">
                     <div className="size-1.5 rounded-full bg-destructive"></div>
                     Terlambat
                   </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5 font-bold text-xs h-8">
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
