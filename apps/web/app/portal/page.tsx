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
  ShoppingCart,
  CookingPot,
  CalendarDays,
  Scale,
  ClipboardList,
  FileBarChart,
  Truck
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
import { Separator } from "@workspace/ui/components/separator"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/common"

export default function DashboardPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (user?.role === UserRole.SUPPLIER) {
    return <SupplierDashboard />
  }

  if (user?.role === UserRole.VENDOR) {
    return <VendorDashboard />
  }

  return <AdminDashboard />
}

// --- VENDOR DASHBOARD ---
function VendorDashboard() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dapur Operasional</h2>
          <p className="text-muted-foreground font-medium text-sm">Monitor perencanaan menu dan kepatuhan SOP dapur Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary text-white border-none font-bold px-3 py-1">Vendor Aktif</Badge>
          <Button variant="outline" size="icon" className="rounded-full relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-white"></span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Jadwal Masak", value: "08:00 WIB", sub: "Makan Siang", icon: CalendarDays, color: "blue" },
          { label: "Target Porsi", value: "1,250", sub: "Siswa Terdaftar", icon: Users, color: "primary" },
          { label: "Bahan Baku", value: "85%", sub: "Stok Tersedia", icon: Package, color: "amber" },
          { label: "Skor Gizi AI", value: "98/100", sub: "Terverifikasi", icon: ShieldCheck, color: "emerald" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className={`size-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center text-${stat.color}-600 mb-4`}>
                <stat.icon className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-[10px] font-medium text-slate-400 italic">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
            <div>
              <CardTitle className="text-lg font-bold">Rencana Menu Hari Ini</CardTitle>
              <CardDescription>Detail porsi dan kebutuhan bahan baku.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Kelola Menu</Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[
                { name: "Nasi Putih", qty: "150 kg", status: "Ready" },
                { name: "Ayam Goreng Mentega", qty: "125 kg", status: "In Progress" },
                { name: "Tumis Sayur Mayur", qty: "80 kg", status: "Waiting" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">{i+1}</div>
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Kebutuhan: {item.qty}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-bold text-[10px] uppercase">{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-3xl bg-slate-900 text-white p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="font-bold text-lg">Alert Kepatuhan</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-primary uppercase mb-1 tracking-widest">SOP Logistik</p>
                <p className="text-xs text-slate-300 leading-relaxed">Suhu chiller saat ini 8°C (Melebihi batas aman 5°C). Harap cek kompresor.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-widest">Jadwal Distribusi</p>
                <p className="text-xs text-slate-400">Armada pengiriman akan tiba dalam 15 menit.</p>
              </div>
            </div>
            <Button className="w-full rounded-full font-bold bg-primary text-white hover:bg-primary/90">
              Buka SOP Digital
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// --- SUPPLIER DASHBOARD ---
function SupplierDashboard() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Portal Supplier</h2>
          <p className="text-muted-foreground font-medium text-sm">Kelola stok bahan baku dan pantau pesanan dari Vendor SPPG.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500 text-white border-none font-bold px-3 py-1">Verified Partner</Badge>
          <Button variant="outline" size="icon" className="rounded-full relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-white"></span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "View Produk", value: "2,450", change: "+15%", icon: Eye, color: "blue" },
          { label: "Chat Aktif", value: "18", change: "+3", icon: MessageSquare, color: "primary" },
          { label: "Produk Tayang", value: "24", change: "Stabil", icon: Package, color: "amber" },
          { label: "Omzet Estimasi", value: "Rp 45.2jt", change: "+8%", icon: ShoppingCart, color: "emerald" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`size-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center text-${stat.color}-600`}>
                  <stat.icon className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-none bg-slate-50">{stat.change}</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
            <div>
              <CardTitle className="text-lg font-bold">Pesanan Masuk (Draft Nego)</CardTitle>
              <CardDescription>Vendor yang sedang mengajukan permintaan harga.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Lihat Laporan Penjualan</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-none">
                  <TableHead className="font-black text-[10px] uppercase pl-6">Vendor</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Produk</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Catering Jakarta 01", item: "Daging Ayam", qty: "200kg" },
                  { name: "Dapur MBG Bandung", item: "Telur Ayam", qty: "50kg" },
                  { name: "Mitra SPPG Bogor", item: "Sayur Sop", qty: "100kg" },
                ].map((row, i) => (
                  <TableRow key={i} className="border-slate-50">
                    <TableCell className="font-bold text-slate-900 pl-6">{row.name}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{row.item} ({row.qty})</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="text-primary font-bold text-xs hover:bg-primary/5">Balas Chat</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-3xl p-8 bg-emerald-900 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="size-24" />
          </div>
          <div className="space-y-6 relative z-10">
            <h3 className="font-bold text-lg">Performa Penjualan</h3>
            <div className="space-y-2">
              <p className="text-4xl font-black">92%</p>
              <p className="text-xs text-emerald-200 font-medium leading-relaxed">Produk Anda sering dicari oleh Vendor di wilayah Jawa Barat.</p>
            </div>
            <Separator className="bg-white/20" />
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Suplai Stabil</span>
            </div>
            <Button className="w-full bg-white text-emerald-900 hover:bg-white/90 font-bold rounded-full">Buka Laporan</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// --- ADMIN DASHBOARD ---
function AdminDashboard() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">BGN Oversight Center</h2>
          <p className="text-muted-foreground text-sm font-medium">Pemantauan data makro dan administrasi sistem nasional.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-10 h-10 bg-card border-border rounded-xl" placeholder="Cari data statistik..." />
          </div>
          <Button className="gap-2 px-5 bg-primary text-white hover:bg-primary/90 rounded-full font-bold">
            <FileBarChart className="size-4" /> Export Report PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Vendor Aktif</p>
              <h3 className="text-3xl font-black text-foreground">19,412</h3>
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <TrendingUp className="size-3" /> +2.4% <span className="text-muted-foreground font-normal text-[10px]">minggu ini</span>
              </div>
            </div>
            <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Users className="size-6" /></div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl text-left">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dana Terdistribusi</p>
              <h3 className="text-3xl font-black text-foreground">Rp 1.2T</h3>
              <div className="flex items-center gap-2 text-primary text-xs font-bold">
                <CheckCircle className="size-3" /> 98.2% <span className="text-muted-foreground font-normal text-[10px]">Terserap</span>
              </div>
            </div>
            <div className="size-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600"><Scale className="size-6" /></div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aktivitas Sistem</p>
              <h3 className="text-3xl font-black text-foreground">Normal</h3>
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <ShieldCheck className="size-3" /> 0 Insiden <span className="text-muted-foreground font-normal text-[10px]">24 Jam terakhir</span>
              </div>
            </div>
            <div className="size-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600"><RefreshCw className="size-6" /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-slate-50/30">
            <CardTitle className="text-lg font-bold">Peta Sebaran Nasional</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[350px] flex items-center justify-center bg-muted/20 relative">
             <div className="absolute inset-0 opacity-10 grayscale bg-[url('https://images.unsplash.com/photo-1555505019-8c3f4c19e309?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
             <div className="relative z-10 text-center space-y-4">
                <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-full border shadow-xl font-bold text-primary text-sm uppercase tracking-widest">
                  National Monitoring View
                </div>
                <div className="flex justify-center gap-2">
                  <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="size-2 bg-amber-500 rounded-full animate-pulse delay-100"></div>
                  <div className="size-2 bg-red-500 rounded-full animate-pulse delay-200"></div>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-slate-50/30 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Log Administrasi Terbaru</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Lihat Audit</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[
                { user: "SuperAdmin", act: "Update Role: Vendor Jakarta", time: "2m ago" },
                { user: "Inspector_01", act: "Approve Laporan: Dapur Pusat", time: "15m ago" },
                { user: "System", act: "Backup Database: Selesai", time: "1h ago" },
                { user: "Admin_Fin", act: "Alokasi Dana: Wilayah Timur", time: "3h ago" },
              ].map((log, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black">{log.user[0]}</div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-slate-900">{log.act}</p>
                      <p className="text-[10px] text-muted-foreground">Oleh {log.user}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
