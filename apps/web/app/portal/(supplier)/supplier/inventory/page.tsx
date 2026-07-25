"use client"

import * as React from "react"
import {
  Search,
  PackageSearch,
  AlertTriangle,
  Box,
  Boxes,
  Database,
} from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
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
import { suppliersService, MySupplierProduct } from "@/lib/services/suppliers.service"
import { toQueryError } from "@/lib/services/error-handler"

const LOW_STOCK_THRESHOLD = 50
const CRITICAL_STOCK_THRESHOLD = 10

function stockStatus(qty: number | null) {
  if (qty === null) return { label: "Tidak diatur", className: "bg-slate-100 text-slate-500" }
  if (qty <= CRITICAL_STOCK_THRESHOLD) return { label: "Kritis", className: "bg-red-100 text-red-700" }
  if (qty <= LOW_STOCK_THRESHOLD) return { label: "Menipis", className: "bg-amber-100 text-amber-700" }
  return { label: "Aman", className: "bg-emerald-100 text-emerald-700" }
}

export default function SupplierInventoryPage() {
  const [products, setProducts] = React.useState<MySupplierProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [search, setSearch] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const data = await suppliersService.listMyProducts()
      setProducts(data)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const criticalCount = products.filter(p => p.stockAvailable !== null && p.stockAvailable <= CRITICAL_STOCK_THRESHOLD).length
  const totalUnits = products.reduce((acc, p) => acc + (p.stockAvailable ?? 0), 0)

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-screen">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 shadow-sm border border-orange-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative p-6 md:p-8">
          <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-orange-400 animate-pulse mr-2 inline-block" /> Stok Produk
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-3">Ketersediaan Stok</h1>
          <p className="text-orange-100/80 text-sm max-w-xl leading-relaxed mt-1">
            Stok yang Anda atur di katalog produk. Ubah stok lewat halaman Produk.
          </p>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-100/50 rounded-xl">
        <AlertTriangle className="size-3.5 text-blue-500" />
        <AlertDescription className="text-blue-700 text-[11px] font-medium">
          Pelacakan mutasi stok masuk/keluar dan alokasi per Purchase Order belum tersedia di sistem.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total SKU</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{products.length}</h3>
            </div>
            <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
              <Box className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Unit Stok</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{totalUnits.toLocaleString('id-ID')}</h3>
            </div>
            <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Boxes className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border border-red-100 rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                <AlertTriangle className="size-3" /> Stok Kritis
              </p>
              <h3 className="text-xl font-black text-red-900 tracking-tighter">{criticalCount} <span className="text-sm font-bold text-red-700">SKU</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">Daftar Stok</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Cari produk..."
              className="pl-9 h-9 bg-white border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <QueryState
          status={loadError ? loadError.status : loading ? "loading" : filtered.length === 0 ? "empty" : "success"}
          errorMessage={loadError?.errorMessage}
          isNetworkError={loadError?.isNetworkError}
          onRetry={load}
          emptyTitle="Belum ada produk"
          emptyMessage="Tambahkan produk di halaman Katalog Produk untuk melihat stoknya di sini."
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 pl-6 h-12">Barang</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 h-12 text-right">Stok Tersedia</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 h-12 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const status = stockStatus(item.stockAvailable)
                  return (
                    <TableRow key={item.id} className="border-b border-slate-100 last:border-0">
                      <TableCell className="pl-6 py-4">
                        <p className="font-bold text-slate-900 text-xs mb-1">{item.name}</p>
                        <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">{item.category}</span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <p className="text-sm font-black text-slate-900">
                          {item.stockAvailable != null ? item.stockAvailable.toLocaleString('id-ID') : '-'}
                          <span className="text-[10px] text-slate-500 font-bold ml-0.5">{item.unit}</span>
                        </p>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge className={cn("border-none text-[9px] uppercase font-bold tracking-widest px-2 py-1 shadow-sm rounded-md", status.className)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </QueryState>
      </Card>
    </div>
  )
}
