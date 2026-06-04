"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  MapPin,
  Star,
  Store,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sparkles,
  Loader2,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"

interface Supplier {
  id: string
  business_name: string
  supplier_type: string
  address_city: string
  address_province: string
  description: string | null
  has_halal_cert: boolean
  has_bpom_cert: boolean
  avg_rating: string | null
  total_reviews: number
  product_count: string
  product_categories: string[] | null
}

const SUPPLIER_TYPE_LABEL: Record<string, string> = {
  petani: 'Petani / Kelompok Tani',
  distributor: 'Distributor',
  koperasi: 'Koperasi',
  fmcg: 'Perusahaan FMCG',
}

export default function MarketplaceHomePage() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState('')
  const [province, setProvince] = React.useState('all')

  const fetchSuppliers = React.useCallback(() => {
    setLoading(true)
    import("@/lib/api-client").then(({ api }) => {
      const params = new URLSearchParams({ limit: '20' })
      if (q) params.set('q', q)
      if (province !== 'all') params.set('province', province)

      api.get<{ data: Supplier[] }>(`/suppliers?${params}`)
        .then((r) => setSuppliers((r as any).data ?? []))
        .catch(() => setSuppliers([]))
        .finally(() => setLoading(false))
    })
  }, [q, province])

  React.useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSuppliers()
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-background">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Direktori Supplier MBG</h1>
        <p className="text-muted-foreground font-medium mt-1">Temukan mitra pemasok tervalidasi di sekitar dapur Anda.</p>
      </div>

      {/* Filter Bar */}
      <Card className="border-border bg-card shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col lg:flex-row items-center gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-10 h-11 bg-slate-50/50 rounded-xl"
                placeholder="Cari nama PT, Toko, atau komoditas..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-11 rounded-xl shrink-0">Cari</Button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="w-[180px] h-11 rounded-xl bg-slate-50/50 border-slate-200">
                <SelectValue placeholder="Semua Provinsi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Provinsi</SelectItem>
                <SelectItem value="DI Yogyakarta">DI Yogyakarta</SelectItem>
                <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Notice Banner */}
      <Alert className="bg-indigo-50 border-indigo-100 shadow-sm rounded-2xl">
        <Sparkles className="size-4 text-primary" />
        <AlertDescription className="text-primary font-bold text-sm">
          Menampilkan supplier terverifikasi BGN yang tersedia di program MBG.
        </AlertDescription>
      </Alert>

      {/* Supplier Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Store className="size-8 text-slate-300" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-500">Belum ada supplier terdaftar</p>
            <p className="text-sm text-slate-400">Supplier yang bergabung dalam program MBG akan tampil di sini.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="group overflow-hidden border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase text-slate-500 border-slate-200">
                    {SUPPLIER_TYPE_LABEL[supplier.supplier_type] ?? supplier.supplier_type}
                  </Badge>
                  {supplier.has_halal_cert && (
                    <Badge className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200 border">
                      Halal
                    </Badge>
                  )}
                  {supplier.has_bpom_cert && (
                    <Badge className="text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200 border">
                      BPOM
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-black text-slate-900 mt-2 group-hover:text-primary transition-colors">
                  {supplier.business_name}
                </CardTitle>
                {supplier.description && (
                  <CardDescription className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed mt-1">
                    {supplier.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                  <MapPin className="size-3 text-primary" />
                  {supplier.address_city}, {supplier.address_province}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="size-3 text-amber-400 fill-amber-400" />
                    {supplier.avg_rating ? parseFloat(supplier.avg_rating).toFixed(1) : '—'}
                    <span className="text-slate-300">·</span>
                    {supplier.total_reviews} ulasan
                  </span>
                  <span className="font-bold">{supplier.product_count} produk aktif</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/portal/marketplace/${supplier.id}`} className="w-full">
                  <Button className="w-full rounded-2xl font-black text-xs uppercase tracking-widest h-11 gap-2 shadow-lg shadow-primary/10">
                    Lihat Profil & Katalog
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
