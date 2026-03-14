import * as React from "react"
import { 
  Search, 
  Bell, 
  FileDown, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Map as MapIcon,
  RefreshCw,
  Filter,
  ShieldCheck,
  AlertTriangle,
  ChevronRight
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

export default function DashboardPage() {
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
            <FileDown className="size-4" />
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
