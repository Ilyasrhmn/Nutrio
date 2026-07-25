"use client"

import * as React from "react"
import {
  MapPin,
  Search,
  Users,
  Utensils,
  ChevronRight,
  Globe,
} from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { api } from "@/lib/api-client"
import { toQueryError } from "@/lib/services/error-handler"

interface VendorSummary {
  vendorId: string;
  vendorName: string;
  score: number;
  cpDone: number;
  hasData: boolean;
}

function statusFor(score: number) {
  if (score < 60) return { label: "Risiko Tinggi", variant: "destructive" as const }
  if (score < 80) return { label: "Peringatan", variant: "warning" as const }
  return { label: "Aman", variant: "success" as const }
}

export default function MapDistributionPage() {
  const [activeVendor, setActiveVendor] = React.useState<string | null>(null)
  const [vendors, setVendors] = React.useState<VendorSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [search, setSearch] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const data = await api.get<VendorSummary[]>('/command-center/vendors')
      setVendors(data)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = vendors.filter(v => v.vendorName.toLowerCase().includes(search.toLowerCase()))
  const avgScore = vendors.length > 0 ? Math.round(vendors.reduce((a, v) => a + v.score, 0) / vendors.length) : 0

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F0F3F7] animate-in fade-in duration-500 pb-6 flex flex-col relative">

      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 pt-8 pb-32 px-6 lg:px-8 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative z-10 w-full space-y-6">
          <div className="space-y-2">
            <Badge className="bg-white/10 text-cyan-50 border border-white/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Globe className="size-3" /> Direktori Mitra
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Sebaran Mitra SPPG
            </h1>
            <p className="text-cyan-100 font-medium text-sm max-w-xl">
              Status kepatuhan mitra aktif. Peta lokasi belum tersedia — sistem belum menyimpan koordinat dapur mitra.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 w-full px-6 lg:px-8 -mt-20 flex-1 min-h-0 flex flex-col">
        <QueryState
          status={loadError ? loadError.status : loading ? "loading" : filtered.length === 0 ? "empty" : "success"}
          errorMessage={loadError?.errorMessage}
          isNetworkError={loadError?.isNetworkError}
          onRetry={load}
          emptyTitle="Belum ada mitra"
          emptyMessage="Belum ada mitra aktif yang cocok dengan pencarian ini."
        >
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">

          {/* Left column - no coordinates available */}
          <div className="lg:col-span-2 rounded-[24px] overflow-hidden border border-slate-200/60 bg-slate-100 relative shadow-xl shadow-cyan-900/10 h-full flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="size-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm border border-slate-200">
              <MapPin className="size-8" />
            </div>
            <div>
              <p className="font-bold text-slate-600">Peta lokasi belum tersedia</p>
              <p className="text-sm text-slate-400 max-w-sm mt-1">
                Backend belum menyimpan koordinat dapur mitra. Daftar status di samping tetap data asli.
              </p>
            </div>
          </div>

          {/* Right column - real vendor list */}
          <div className="flex flex-col border border-slate-200/60 bg-white rounded-[24px] shadow-xl shadow-cyan-900/10 h-full overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  className="pl-9 h-10 rounded-xl"
                  placeholder="Cari mitra..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-7 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                      <Users className="size-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Mitra</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{vendors.length}</p>
                </div>
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-7 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Utensils className="size-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rata-rata Skor</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{avgScore}</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 bg-white">
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 pb-2 pt-2">Daftar Mitra</p>
                {filtered.map((vendor) => {
                  const status = statusFor(vendor.score)
                  return (
                  <div
                    key={vendor.vendorId}
                    onMouseEnter={() => setActiveVendor(vendor.vendorId)}
                    onMouseLeave={() => setActiveVendor(null)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden mx-2",
                      activeVendor === vendor.vendorId
                        ? "bg-slate-50 border-slate-200 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-slate-50/50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">{vendor.vendorName}</h4>
                        <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                          <MapPin className="size-3 text-slate-400" />
                          Skor {vendor.score}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "text-[9px] font-bold uppercase px-3 py-1 rounded-lg border-none tracking-widest",
                          status.variant === 'success' && "bg-emerald-100 text-emerald-700",
                          status.variant === 'warning' && "bg-amber-100 text-amber-700",
                          status.variant === 'destructive' && "bg-red-100 text-red-700"
                        )}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Utensils className="size-3 text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-700">{vendor.cpDone} checkpoint selesai</span>
                      </div>
                      <ChevronRight className={cn(
                        "size-4 transition-transform",
                        activeVendor === vendor.vendorId ? "text-cyan-600 translate-x-0.5" : "text-slate-300"
                      )} />
                    </div>
                  </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

        </div>
        </QueryState>
      </div>
    </div>
  )
}
