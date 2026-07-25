"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Box,
  Package,
  Database
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@workspace/ui/components/dropdown-menu"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { ConfirmModal } from "@workspace/ui/components/confirm-modal"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { cn } from "@workspace/ui/lib/utils"
import { suppliersService, MySupplierProduct } from "@/lib/services/suppliers.service"
import { toQueryError } from "@/lib/services/error-handler"

export default function SupplierProductsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [products, setProducts] = React.useState<MySupplierProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [productToDelete, setProductToDelete] = React.useState<MySupplierProduct | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)

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

  async function confirmDelete() {
    if (!productToDelete) return
    setDeleting(true)
    try {
      await suppliersService.deleteMyProduct(productToDelete.id)
      await load()
      toast({ title: "Produk Dihapus", description: `Produk ${productToDelete.name} telah dihapus dari katalog.`, variant: "destructive" })
    } catch (error) {
      const { errorMessage } = toQueryError(error)
      toast({ title: "Gagal Menghapus", description: errorMessage, variant: "destructive" })
    } finally {
      setDeleting(false)
      setProductToDelete(null)
    }
  }

  async function toggleStatus(product: MySupplierProduct) {
    setTogglingId(product.id)
    try {
      const nextStatus = product.status === 'active' ? 'inactive' : 'active'
      await suppliersService.updateMyProduct(product.id, { status: nextStatus })
      await load()
    } catch (error) {
      const { errorMessage } = toQueryError(error)
      toast({ title: "Gagal Mengubah Status", description: errorMessage, variant: "destructive" })
    } finally {
      setTogglingId(null)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-screen">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 shadow-sm border border-orange-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Package className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-orange-400 animate-pulse mr-2 inline-block" /> Katalog Produk
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Manajemen Produk & Harga</h1>
            <p className="text-orange-100/80 text-sm max-w-xl leading-relaxed">
              Kelola daftar produk dan harga untuk menarik pesanan dari Vendor BGN.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link href="/portal/supplier/inventory">
              <Button className="rounded-xl h-10 px-5 font-bold bg-orange-800/50 text-white hover:bg-orange-800 border border-orange-700/50 shadow-sm transition-colors backdrop-blur-sm">
                <Database className="size-4 mr-2 text-orange-200" /> Back-Office Gudang
              </Button>
            </Link>
            <Link href="/portal/supplier/products/add">
              <Button className="rounded-xl h-10 px-6 font-bold bg-white text-orange-900 hover:bg-orange-50 shadow-sm transition-colors border border-white">
                <Plus className="size-4 mr-2" /> Tambah Produk
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <CardContent className="p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Cari produk atau kategori..."
              className="pl-9 h-9 bg-slate-50 border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-0 focus:border-orange-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <QueryState
        status={loadError ? loadError.status : loading ? "loading" : filteredProducts.length === 0 ? "empty" : "success"}
        errorMessage={loadError?.errorMessage}
        isNetworkError={loadError?.isNetworkError}
        onRetry={load}
        emptyTitle="Belum ada produk"
        emptyMessage="Tambahkan produk pertama Anda ke katalog."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-2xl overflow-hidden flex flex-col relative">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 flex items-center justify-center">
                {product.photoUrl ? (
                  <img src={product.photoUrl} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                  <Package className="size-10 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <Badge className={cn(
                    "border-none font-bold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded backdrop-blur-md",
                    product.status === 'active' ? "bg-emerald-500/90 text-white" : "bg-slate-700/90 text-white"
                  )}>
                    {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="size-8 rounded-lg bg-white/90 hover:bg-white text-slate-900 shadow-sm backdrop-blur-sm border border-slate-200/50" disabled={togglingId === product.id}>
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl w-40 p-1 shadow-md border-slate-200">
                      <DropdownMenuItem
                        className="font-bold text-xs py-2 rounded-lg cursor-pointer focus:bg-slate-50"
                        onClick={() => toggleStatus(product)}
                      >
                        {product.status === 'active' ? <EyeOff className="size-3.5 mr-2" /> : <Eye className="size-3.5 mr-2" />}
                        {product.status === 'active' ? 'Sembunyikan' : 'Tampilkan'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-100" />
                      <DropdownMenuItem
                        className="font-bold text-xs py-2 rounded-lg text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                        onClick={() => setProductToDelete(product)}
                      >
                        <Trash2 className="size-3.5 mr-2" /> Hapus Produk
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-5 flex-1 space-y-4">
                <div>
                  <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Box className="size-3" /> {product.category}
                  </p>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Harga</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {product.pricePerUnit != null ? `Rp ${product.pricePerUnit.toLocaleString('id-ID')} / ${product.unit}` : 'Belum diatur'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stok</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {product.stockAvailable != null ? `${product.stockAvailable} ${product.unit}` : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Link href="/portal/supplier/products/add" className="contents">
            <Card className="border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center p-6 gap-4 min-h-[280px] hover:border-orange-500 hover:bg-orange-50/30 transition-colors cursor-pointer group">
              <div className="size-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 group-hover:bg-orange-500 group-hover:border-orange-500 transition-colors">
                <Plus className="size-6 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Tambah Produk</h4>
                <p className="text-[11px] text-slate-500 font-medium">Daftarkan komoditas baru.</p>
              </div>
            </Card>
          </Link>
        </div>
      </QueryState>

      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        description={`Yakin ingin menghapus produk "${productToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Produk"
        variant="destructive"
        loading={deleting}
      />
    </div>
  )
}
