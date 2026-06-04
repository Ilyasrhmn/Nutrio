"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import {
  MapPin,
  Search,
  Download,
  Users,
  Utensils,
  ChevronRight,
  Filter,
  Loader2,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import type { VendorPin } from "@/components/map/vendor-map"

// Dynamic import to avoid SSR issues with Leaflet
const VendorMap = dynamic(
  () => import("@/components/map/vendor-map").then((m) => m.VendorMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <Loader2 className="size-8 animate-spin text-slate-400" />
      </div>
    ),
  }
)

function scoreToStatus(score: number): { label: string; variant: string } {
  if (score >= 80) return { label: "Aman", variant: "success" }
  if (score >= 60) return { label: "Peringatan", variant: "warning" }
  return { label: "Risiko Tinggi", variant: "destructive" }
}

export default function MapDistributionPage() {
  const [vendors, setVendors] = React.useState<VendorPin[]>([])
  const [overview, setOverview] = React.useState<{ totalActiveVendors: number; totalPorsiToday: number } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState("")
  const [selectedVendor, setSelectedVendor] = React.useState<VendorPin | null>(null)

  const fetchVendors = React.useCallback((search?: string) => {
    import("@/lib/api-client").then(({ api }) => {
      const params = new URLSearchParams({ limit: "50" })
      if (search) params.set("q", search)

      api.get<VendorPin[]>(`/public/sppg/search?${params}`)
        .then((r) => setVendors(r ?? []))
        .catch(() => setVendors([]))
        .finally(() => setLoading(false))
    })
  }, [])

  React.useEffect(() => {
    import("@/lib/api-client").then(({ api }) => {
      api.get<{ totalActiveVendors: number; totalPorsiToday: number }>("/public/overview")
        .then((r) => setOverview(r))
        .catch(() => {})
    })
    fetchVendors()
  }, [fetchVendors])

  // Debounced search
  React.useEffect(() => {
    const t = setTimeout(() => fetchVendors(q || undefined), 300)
    return () => clearTimeout(t)
  }, [q, fetchVendors])

  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Peta Sebaran Mitra SPPG</h2>
          <p className="text-muted-foreground text-sm">Pemantauan cakupan wilayah dan kapasitas dapur umum (SPPG) secara nasional.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold rounded-full">
            <Download className="size-4" />
            Export Peta (PDF)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 600 }}>
        {/* Map Area */}
        <Card className="lg:col-span-2 p-0 overflow-hidden border-border bg-card relative" style={{ minHeight: 600 }}>
          {/* Search overlay */}
          <div className="absolute top-4 left-4 z-[1000] w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-10 bg-background/90 backdrop-blur-md border-border shadow-lg rounded-full h-11 focus-visible:ring-primary"
                placeholder="Cari nama vendor atau kota..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          {/* Legend overlay */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-background/90 backdrop-blur-md p-4 rounded-2xl border border-border shadow-xl space-y-3 min-w-[160px]">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Legenda Status</p>
            <div className="space-y-2">
              {[
                { color: "bg-emerald-500", label: "Aman (≥80)" },
                { color: "bg-amber-500", label: "Peringatan (60–79)" },
                { color: "bg-red-500", label: "Risiko Tinggi (<60)" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${color} shadow-sm`} />
                  <span className="text-[11px] font-bold text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaflet Map */}
          <div className="w-full h-full" style={{ minHeight: 600 }}>
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <Loader2 className="size-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <VendorMap
                vendors={vendors}
                className="w-full h-full rounded-[inherit]"
                onVendorClick={setSelectedVendor}
              />
            )}
          </div>
        </Card>

        {/* Right Panel */}
        <Card className="flex flex-col border-border bg-card shadow-sm h-full overflow-hidden" style={{ minHeight: 600 }}>
          <CardHeader className="border-b border-border bg-muted/10 pb-6">
            <CardTitle className="text-lg font-bold">
              {selectedVendor ? selectedVendor.name : "Detail Area"}
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              {selectedVendor
                ? `${selectedVendor.addressCity}, ${selectedVendor.addressProvince}`
                : "Klik pin pada peta untuk melihat detail vendor"}
            </CardDescription>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Total Mitra</span>
                </div>
                <p className="text-lg font-black text-foreground">{overview?.totalActiveVendors ?? "—"}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Utensils className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Porsi Hari Ini</span>
                </div>
                <p className="text-lg font-black text-foreground">
                  {overview?.totalPorsiToday?.toLocaleString("id-ID") ?? "—"}
                </p>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 pb-1">
                {vendors.length > 0 ? `${vendors.length} Vendor Ditemukan` : "Daftar Vendor"}
              </p>

              {vendors.length === 0 && !loading && (
                <p className="text-[11px] text-muted-foreground text-center py-6">
                  Tidak ada data vendor aktif
                </p>
              )}

              {vendors.map((vendor) => {
                const { label: statusLabel, variant: statusVariant } = scoreToStatus(vendor.score)
                const isSelected = selectedVendor?.id === vendor.id
                return (
                  <div
                    key={vendor.id}
                    onClick={() => setSelectedVendor(vendor)}
                    className={cn(
                      "p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden",
                      isSelected ? "border-primary/40 bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{vendor.name}</h4>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3 text-primary" />
                          {vendor.addressCity}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Users className="size-3" />
                          {vendor.schoolCount} sekolah
                        </p>
                      </div>
                      <Badge
                        variant={statusVariant as any}
                        className={cn(
                          "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md",
                          statusVariant === "success" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                          statusVariant === "warning" && "bg-amber-50 text-amber-600 border-amber-100",
                          statusVariant === "destructive" && "bg-destructive/10 text-destructive border-destructive/10"
                        )}
                      >
                        {statusLabel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-[10px] font-medium text-slate-500 italic">Target: {vendor.targetPorsi} porsi/hari</span>
                      <span className="text-[10px] font-black" style={{ color: vendor.score >= 80 ? "#10b981" : vendor.score >= 60 ? "#f59e0b" : "#ef4444" }}>
                        Skor {vendor.score}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border bg-muted/5">
            <Button variant="ghost" className="w-full text-xs font-bold text-primary gap-2 hover:bg-primary/5">
              Lihat Analisis Sebaran Lengkap
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
