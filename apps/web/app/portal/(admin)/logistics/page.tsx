"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import {
  Search,
  FileText,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Clock,
  RefreshCw,
  Package,
  Loader2,
  MapPin,
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
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import type { VendorPin } from "@/components/map/vendor-map"

const VendorMap = dynamic(
  () => import("@/components/map/vendor-map").then((m) => m.VendorMap),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100"><Loader2 className="size-8 animate-spin text-slate-400" /></div> }
)

interface DeliveryRow {
  token: string
  status: string
  vendorName: string
  schoolId: string
  porsiCount: number
  generatedAt: string
  arrivedAt: string | null
  completedAt: string | null
  schoolConfirmedAt: string | null
  schoolKondisi: string | null
  gpsLat: number | null
  gpsLng: number | null
}

const STATUS_META: Record<string, { label: string; cn: string }> = {
  active:                { label: "Belum Berangkat", cn: "bg-slate-100 text-slate-600 border-slate-200" },
  in_progress:           { label: "Dalam Perjalanan", cn: "bg-blue-100 text-blue-700 border-blue-200" },
  waiting_school_confirm:{ label: "Menunggu Konfirmasi", cn: "bg-amber-100 text-amber-700 border-amber-200" },
  used:                  { label: "Selesai ✓", cn: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  expired:               { label: "Kedaluwarsa", cn: "bg-red-100 text-red-700 border-red-200" },
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function DeliveryStatusCard({ deliveries }: { deliveries: DeliveryRow[] }) {
  const counts = deliveries.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const items = [
    { key: "in_progress", label: "Dalam Perjalanan", icon: Truck, color: "text-blue-600 bg-blue-50" },
    { key: "waiting_school_confirm", label: "Menunggu Konfirmasi", icon: Clock, color: "text-amber-600 bg-amber-50" },
    { key: "used", label: "Selesai", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { key: "active", label: "Belum Berangkat", icon: Package, color: "text-slate-500 bg-slate-50" },
  ]

  return (
    <div className="space-y-2">
      {items.map(({ key, label, icon: Icon, color }) => (
        <div key={key} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
          <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", color)}>
            <Icon className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-700">{label}</p>
          </div>
          <p className="text-lg font-black text-foreground">{counts[key] ?? 0}</p>
        </div>
      ))}
    </div>
  )
}

export default function LogisticsPage() {
  const [overview, setOverview] = React.useState<{ totalActive: number; critical: number } | null>(null)
  const [publicOverview, setPublicOverview] = React.useState<{ totalActiveVendors: number; totalPorsiToday: number } | null>(null)
  const [deliveries, setDeliveries] = React.useState<DeliveryRow[]>([])
  const [vendors, setVendors] = React.useState<VendorPin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState("")

  const fetchAll = React.useCallback(() => {
    import("@/lib/api-client").then(({ api }) => {
      Promise.allSettled([
        api.get<{ totalActive: number; critical: number }>("/command-center/overview"),
        api.get<{ totalActiveVendors: number; totalPorsiToday: number }>("/public/overview"),
        api.get<DeliveryRow[]>("/command-center/deliveries?limit=100"),
        api.get<VendorPin[]>("/public/sppg/search?limit=100"),
      ]).then(([ov, pub, del, vend]) => {
        if (ov.status === "fulfilled" && ov.value) setOverview(ov.value)
        if (pub.status === "fulfilled" && pub.value) setPublicOverview(pub.value)
        if (del.status === "fulfilled" && del.value) setDeliveries(del.value)
        if (vend.status === "fulfilled" && vend.value) setVendors(vend.value)
        setLoading(false)
      })
    })
  }, [])

  React.useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = deliveries.filter(d =>
    !q || d.vendorName.toLowerCase().includes(q.toLowerCase()) || d.token.includes(q) || d.schoolId.toLowerCase().includes(q.toLowerCase())
  )

  const activeCount = deliveries.filter(d => d.status === "in_progress").length

  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pemantauan Logistik MBG</h2>
          <p className="text-muted-foreground text-sm">Status armada dan pengiriman real-time dari Dapur SPPG ke Sekolah.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-10 bg-card border-border rounded-full"
              placeholder="Cari vendor, sekolah, atau ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Button onClick={fetchAll} variant="outline" className="gap-2 rounded-full font-bold text-sm h-10">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button className="gap-2 px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold rounded-full h-10">
            <FileText className="size-4" />
            Unduh Manifes
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm overflow-hidden">
          <CardContent className="p-6 flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Vendor Aktif</p>
              <h3 className="text-4xl font-black text-foreground">{overview?.totalActive ?? "—"}</h3>
            </div>
            <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Truck className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pengiriman Aktif</p>
              <h3 className="text-4xl font-black text-blue-600">{loading ? "—" : activeCount}</h3>
              <p className="text-xs text-muted-foreground font-medium">Sedang dalam perjalanan</p>
            </div>
            <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Navigation className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Porsi Hari Ini</p>
              <h3 className="text-4xl font-black text-emerald-600">
                {publicOverview?.totalPorsiToday?.toLocaleString("id-ID") ?? "—"}
              </h3>
            </div>
            <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle: status summary + map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-card border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Status Pengiriman</CardTitle>
            <CardDescription>Ringkasan semua token pengiriman hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-slate-300" /></div>
            ) : deliveries.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center gap-3 text-muted-foreground">
                <Package className="size-10 opacity-20" />
                <p className="text-sm font-medium">Belum ada pengiriman hari ini</p>
                <p className="text-xs">Token dibuat otomatis setelah CP3 selesai.</p>
              </div>
            ) : (
              <DeliveryStatusCard deliveries={deliveries} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card border-border shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-primary" />
              <CardTitle className="text-base font-bold">Sebaran Titik SPPG</CardTitle>
            </div>
            <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wide">
              {vendors.length} SPPG
            </Badge>
          </CardHeader>
          <div className="flex-1 min-h-[380px] relative">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <Loader2 className="size-8 animate-spin text-slate-300" />
              </div>
            ) : vendors.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <MapPin className="size-10 opacity-20" />
                <p className="text-sm font-medium">Tidak ada data lokasi SPPG</p>
              </div>
            ) : (
              <VendorMap vendors={vendors} className="w-full h-full" />
            )}
          </div>
        </Card>
      </div>

      {/* Delivery history table */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold">Manifes Pengiriman Hari Ini</CardTitle>
            <CardDescription>
              {loading ? "Memuat data..." : `${filtered.length} dari ${deliveries.length} pengiriman`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/50">
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pl-6">ID Token</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Nama Mitra</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Tujuan (Sekolah)</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Porsi</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Tiba</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pr-6 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="size-6 animate-spin text-slate-300 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Clock className="size-8 opacity-20" />
                      <p className="text-sm font-medium">
                        {q ? "Tidak ada hasil pencarian" : "Belum ada pengiriman hari ini"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((d) => {
                  const meta = STATUS_META[d.status] ?? STATUS_META.active!
                  return (
                    <TableRow key={d.token} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6">
                        <span className="font-mono text-xs text-slate-500">
                          {d.token.slice(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[160px]">{d.vendorName}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium text-slate-600 truncate max-w-[140px]">{d.schoolId}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-bold text-slate-700">{d.porsiCount.toLocaleString("id-ID")}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-slate-500">{fmtTime(d.arrivedAt)}</span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Badge className={cn("font-bold text-[10px] uppercase border", meta.cn)}>
                          {meta.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
