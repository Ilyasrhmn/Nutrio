"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  MapPin,
  Star,
  Store,
  ShieldCheck,
  Package,
  ArrowRight,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { suppliersService, SupplierListItem } from "@/lib/services/suppliers.service"
import { toQueryError } from "@/lib/services/error-handler"

const CATEGORY_LABELS: Record<string, string> = {
  sayuran: "Sayuran",
  beras: "Beras",
  protein_nabati: "Protein Nabati",
  protein_hewani: "Protein Hewani",
  bumbu: "Bumbu & Rempah",
  dairy: "Susu & Olahan",
  buah: "Buah",
}

export default function MarketplaceHomePage() {
  const [items, setItems] = React.useState<SupplierListItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [search, setSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)

  const load = React.useCallback(async (q?: string, category?: string | null) => {
    try {
      setLoading(true)
      setLoadError(null)
      const res = await suppliersService.list({ q, category: category ?? undefined, page: 1, limit: 40 })
      setItems(res.items)
      setTotal(res.total)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  React.useEffect(() => {
    const t = setTimeout(() => load(search || undefined, activeCategory), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeCategory])

  const categories = React.useMemo(() => {
    const set = new Set<string>()
    items.forEach((s) => s.productCategories.forEach((c) => set.add(c)))
    return Array.from(set)
  }, [items])

  return (
    <div className="min-h-screen bg-[#F4F7FA] pb-16 animate-in fade-in duration-500">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 pt-10 pb-16">
          <div className="space-y-3 mb-10">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> BGN Verified Directory
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Direktori Supplier MBG
            </h1>
            <p className="text-teal-100/80 text-sm md:text-base font-medium mt-1 max-w-xl leading-relaxed">
              Temukan mitra pemasok tervalidasi untuk menjamin kualitas gizi dan ketepatan waktu.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-4xl">
            <div className="flex items-center bg-white rounded-2xl overflow-hidden shadow-xl p-1.5">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 size-5 text-slate-400" />
                <Input
                  className="pl-12 h-14 border-none shadow-none bg-transparent text-base font-bold placeholder:text-slate-400 focus-visible:ring-0"
                  placeholder="Cari beras, sayur, atau nama supplier..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-teal-100/60 text-xs font-semibold">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span><strong className="text-white">{total}</strong> supplier terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200/60 p-2 flex items-center gap-2 overflow-x-auto ring-1 ring-slate-100">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300",
                !activeCategory
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Package className="size-4" />
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300",
                  activeCategory === cat
                    ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Supplier Grid */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-8 pb-12">
        <QueryState
          status={loadError ? loadError.status : loading ? "loading" : items.length === 0 ? "empty" : "success"}
          errorMessage={loadError?.errorMessage}
          isNetworkError={loadError?.isNetworkError}
          onRetry={() => load(search || undefined, activeCategory)}
          emptyTitle="Belum ada supplier"
          emptyMessage="Belum ada supplier terverifikasi yang cocok dengan pencarian ini."
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">Supplier Terverifikasi</h2>
              <Badge className="bg-teal-50 text-teal-700 border-none font-bold text-[10px] px-2 py-0.5 uppercase tracking-widest shadow-sm">
                {items.length} supplier
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((supplier, index) => (
              <Link
                key={supplier.id}
                href={`/portal/marketplace/${supplier.id}`}
                className="group block"
              >
                <Card className={cn(
                  "overflow-hidden bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 hover:-translate-y-1 transition-all duration-300 rounded-[24px] h-full flex flex-col",
                  "animate-in fade-in slide-in-from-bottom-3",
                )} style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}>
                  <div className="aspect-[4/3] w-full overflow-hidden relative bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-white text-3xl font-black">
                      {supplier.businessName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <Badge className="bg-white/95 backdrop-blur-md text-slate-900 border-none font-bold text-[10px] px-2 py-1 shadow-sm gap-1 rounded-lg">
                        <MapPin className="size-3 text-teal-600" />
                        {supplier.addressCity}
                      </Badge>
                      <Badge className="bg-white/95 backdrop-blur-md text-slate-900 border-none font-bold text-[10px] px-2 py-1 shadow-sm gap-1 rounded-lg">
                        <Package className="size-3 text-slate-500" />
                        {supplier.productCount} produk
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md">
                        {supplier.businessName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors line-clamp-2">
                          {supplier.businessName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                          <Store className="size-3" /> {supplier.addressProvince}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 bg-slate-50 border border-slate-100 rounded-lg p-2">
                      <div className="flex items-center gap-1">
                        <Star className="size-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-extrabold text-slate-900">
                          {supplier.avgRating?.toFixed(1) ?? "-"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">({supplier.totalReviews} ulasan)</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {supplier.hasHalalCert && (
                        <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 border-none uppercase tracking-widest rounded-md bg-emerald-50 text-emerald-700">
                          <ShieldCheck className="size-3 mr-1" /> Halal
                        </Badge>
                      )}
                      {supplier.hasBpomCert && (
                        <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 border-none uppercase tracking-widest rounded-md bg-emerald-50 text-emerald-700">
                          <ShieldCheck className="size-3 mr-1" /> BPOM
                        </Badge>
                      )}
                      {supplier.hasOrganicCert && (
                        <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 border-none uppercase tracking-widest rounded-md bg-slate-100 text-slate-600">
                          Organic
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-1 rounded-md uppercase tracking-widest">
                        {supplier.onTimeRate != null ? `${Math.round(supplier.onTimeRate)}% tepat waktu` : "Belum ada data"}
                      </div>
                      <ArrowRight className="size-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </QueryState>
      </div>
    </div>
  )
}
