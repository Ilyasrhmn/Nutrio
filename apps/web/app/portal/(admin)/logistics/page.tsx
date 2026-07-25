"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import {
  Search,
  Truck,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronRight,
  Package,
} from "lucide-react"

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
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { api } from "@/lib/api-client"
import { toQueryError } from "@/lib/services/error-handler"

const MapView = dynamic(() => import("@/components/dashboard/map-view"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 space-y-4 rounded-3xl border border-slate-100">
      <div className="size-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Memuat GPS Tracking...</p>
    </div>
  )
})

interface Delivery {
  token: string;
  status: string;
  vendorName: string;
  schoolId: string;
  porsiCount: number;
  generatedAt: string;
  expiredAt: string;
  arrivedAt: string | null;
  completedAt: string | null;
  schoolConfirmedAt: string | null;
  schoolKondisi: string | null;
  gpsLat: number | null;
  gpsLng: number | null;
}

function statusBadge(status: string) {
  switch (status) {
    case 'completed': return { label: 'Terkirim', className: 'bg-emerald-100 text-emerald-700' }
    case 'arrived': return { label: 'Tiba', className: 'bg-blue-100 text-blue-700' }
    case 'expired': return { label: 'Kedaluwarsa', className: 'bg-red-100 text-red-700' }
    default: return { label: 'Menunggu', className: 'bg-amber-100 text-amber-700' }
  }
}

export default function LogisticsPage() {
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
  const [deliveries, setDeliveries] = React.useState<Delivery[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [search, setSearch] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const data = await api.get<Delivery[]>('/command-center/deliveries')
      setDeliveries(data)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = deliveries.filter(d =>
    d.vendorName.toLowerCase().includes(search.toLowerCase()) || d.token.toLowerCase().includes(search.toLowerCase())
  )
  const inTransit = deliveries.filter(d => d.status === 'generated' || d.status === 'arrived').length
  const expired = deliveries.filter(d => d.status === 'expired').length
  const completed = deliveries.filter(d => d.status === 'completed').length

  const mapPoints = deliveries
    .filter(d => d.gpsLat !== null && d.gpsLng !== null)
    .map((d, index) => ({
      id: index,
      name: d.vendorName,
      location: d.schoolId,
      status: statusBadge(d.status).label,
      variant: d.status === 'completed' ? 'success' : d.status === 'expired' ? 'destructive' : 'warning',
      capacity: d.token,
      lat: d.gpsLat as number,
      lng: d.gpsLng as number,
      color: d.status === 'completed' ? '#10b981' : d.status === 'expired' ? '#ef4444' : '#3b82f6',
    }))

  return (
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-500">

      {/* HERO SECTION */}
      <div className="relative bg-[#0064D2] pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <Badge className="bg-white/10 text-blue-50 border border-white/20 hover:bg-white/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                Sistem Pengawasan Terpadu
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Pemantauan Logistik MBG
              </h1>
              <p className="text-blue-100 font-medium text-sm max-w-2xl">
                Status pengiriman hari ini dari Dapur SPPG ke Sekolah, berdasarkan token pengiriman.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-blue-200" />
              <Input
                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-blue-200 rounded-2xl h-12 focus-visible:ring-white/30 font-medium shadow-inner"
                placeholder="Cari vendor atau token..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-6 lg:px-12 -mt-20 space-y-8 pb-12">
        <QueryState
          status={loadError ? loadError.status : loading ? "loading" : deliveries.length === 0 ? "empty" : "success"}
          errorMessage={loadError?.errorMessage}
          isNetworkError={loadError?.isNetworkError}
          onRetry={load}
          emptyTitle="Belum ada pengiriman"
          emptyMessage="Belum ada token pengiriman yang dibuat hari ini."
        >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Dalam Perjalanan</p>
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{inTransit}</h3>
                </div>
                <div className="size-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <Truck className="size-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kedaluwarsa</p>
                  <h3 className="text-5xl font-black text-amber-500 tracking-tighter">{expired}</h3>
                </div>
                <div className="size-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                  <AlertTriangle className="size-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Terkirim (Hari Ini)</p>
                  <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">{completed}</h3>
                </div>
                <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 className="size-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white flex flex-col overflow-hidden relative">
          {mapPoints.length === 0 ? (
            <div className="p-16 text-center text-sm text-slate-400">
              Tidak ada pengiriman dengan data GPS untuk ditampilkan di peta.
            </div>
          ) : (
            <div className="min-h-[400px] relative">
              <MapView vendors={mapPoints} />
            </div>
          )}
        </Card>

        {/* History Table */}
        <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 md:px-8 border-b border-slate-100">
            <CardTitle className="text-lg font-bold">Riwayat & Manifes Hari Ini</CardTitle>
            <CardDescription className="text-xs font-medium mt-1">Data token pengiriman.</CardDescription>
          </CardHeader>
          <div className="p-2">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-400">Tidak ada data yang cocok.</div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-12">Detail Pengiriman</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 hidden md:table-cell">Sekolah</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12 text-center">Dibuat</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-6 h-12 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, i) => {
                  const badge = statusBadge(item.status)
                  return (
                  <TableRow
                    key={item.token}
                    className={cn(
                      "group border-none transition-colors cursor-pointer rounded-xl overflow-hidden relative",
                      hoveredRow === i ? "bg-slate-50" : "bg-transparent"
                    )}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full flex items-center justify-center shrink-0 border bg-blue-50 border-blue-100 text-blue-600">
                          <Package className="size-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{item.token.slice(0, 12)}…</p>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">{item.vendorName} · {item.porsiCount} porsi</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700 text-sm">{item.schoolId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Clock className="size-3.5 text-slate-500" />
                        <span className="text-xs font-bold text-slate-700">{new Date(item.generatedAt).toLocaleTimeString('id-ID')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Badge className={cn("border-none font-bold uppercase text-[9px] px-3 py-1 tracking-widest", badge.className)}>
                          {badge.label}
                        </Badge>
                        <ChevronRight className="size-4 text-slate-300" />
                      </div>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            )}
          </div>
        </Card>
        </QueryState>
      </div>
    </div>
  )
}
