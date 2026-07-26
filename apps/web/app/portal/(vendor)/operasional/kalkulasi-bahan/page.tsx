"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShoppingCart,
  Save,
  Scale,
  Info,
  Users,
  PackageCheck,
  Plus,
  Trash2,
  Search,
  Store,
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
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { menuPlansService, MenuPlan, MenuPlanItemInput } from "@/lib/services/menu-plans.service"
import { suppliersService, SupplierListItem, SupplierProduct } from "@/lib/services/suppliers.service"
import { toQueryError, mapApiError } from "@/lib/services/error-handler"

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

interface DraftItem extends MenuPlanItemInput {
  name: string;
}

function ProductPicker({ onPick }: { onPick: (product: SupplierProduct) => void }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [suppliers, setSuppliers] = React.useState<SupplierListItem[]>([])
  const [selectedSupplier, setSelectedSupplier] = React.useState<{ id: string; name: string; products: SupplierProduct[] } | null>(null)
  const [searching, setSearching] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await suppliersService.list({ q: query || undefined, page: 1, limit: 10 })
        setSuppliers(res.items)
      } catch {
        setSuppliers([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query, open])

  async function openSupplier(supplier: SupplierListItem) {
    try {
      const detail = await suppliersService.getDetail(supplier.id)
      setSelectedSupplier({ id: supplier.id, name: supplier.businessName, products: detail.products })
    } catch {
      setSelectedSupplier(null)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-xl font-bold text-xs gap-2 border-teal-200 text-teal-700">
          <Plus className="size-3.5" /> Tambah Bahan dari Marketplace
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        {!selectedSupplier ? (
          <div className="p-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <Input placeholder="Cari supplier..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1">
              {searching && <p className="text-xs text-slate-400 p-2">Mencari...</p>}
              {!searching && suppliers.length === 0 && <p className="text-xs text-slate-400 p-2">Tidak ada supplier ditemukan.</p>}
              {suppliers.map((s) => (
                <button key={s.id} onClick={() => openSupplier(s)} className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                  <Store className="size-3.5 text-teal-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 truncate">{s.businessName}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <button onClick={() => setSelectedSupplier(null)} className="text-xs font-bold text-teal-600 mb-1">&larr; Kembali</button>
            <p className="text-xs font-bold text-slate-500 uppercase">{selectedSupplier.name}</p>
            <div className="max-h-72 overflow-y-auto space-y-1">
              {selectedSupplier.products.length === 0 && <p className="text-xs text-slate-400 p-2">Belum ada produk.</p>}
              {selectedSupplier.products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onPick(p); setOpen(false); setSelectedSupplier(null); setQuery("") }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between gap-2"
                >
                  <span className="text-sm font-semibold text-slate-700 truncate">{p.name}</span>
                  <span className="text-[10px] text-slate-400">{p.unit}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default function KalkulasiBahanPage() {
  const { toast } = useToast()
  const date = todayString()

  const [plan, setPlan] = React.useState<MenuPlan | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [notFound, setNotFound] = React.useState(false)

  const [targetPax, setTargetPax] = React.useState(0)
  const [draftItems, setDraftItems] = React.useState<DraftItem[]>([])
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      setNotFound(false)
      const data = await menuPlansService.get(date)
      setPlan(data)
      setTargetPax(data.targetPax)
      setDraftItems(data.items.map((i) => ({ productId: i.productId, unit: i.unit, quantityPerPax: 0, name: i.name })))
    } catch (error) {
      if (mapApiError(error).statusCode === 404) {
        setNotFound(true)
        setPlan(null)
      } else {
        setLoadError(toQueryError(error))
      }
    } finally {
      setLoading(false)
    }
  }, [date])

  React.useEffect(() => {
    load()
  }, [load])

  function addDraftItem(product: SupplierProduct) {
    if (draftItems.some((d) => d.productId === product.id)) return
    setDraftItems((prev) => [...prev, { productId: product.id, unit: product.unit, quantityPerPax: 0, name: product.name }])
  }

  function removeDraftItem(productId: string) {
    setDraftItems((prev) => prev.filter((d) => d.productId !== productId))
  }

  function updateQtyPerPax(productId: string, value: string) {
    const qty = Math.max(0, parseFloat(value) || 0)
    setDraftItems((prev) => prev.map((d) => d.productId === productId ? { ...d, quantityPerPax: qty } : d))
  }

  async function handleSave() {
    if (targetPax < 1) {
      toast({ title: "Target porsi minimal 1", variant: "destructive" })
      return
    }
    if (draftItems.length === 0) {
      toast({ title: "Tambahkan minimal 1 bahan", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      await menuPlansService.upsert({
        operationDate: date,
        targetPax,
        items: draftItems.map(({ productId, unit, quantityPerPax }) => ({ productId, unit, quantityPerPax })),
      })
      toast({ title: "Rencana Menu Tersimpan", description: "Kebutuhan bahan dihitung ulang dari stok terkini." })
      await load()
    } catch (error) {
      const { errorMessage } = toQueryError(error)
      toast({ title: "Gagal Menyimpan", description: errorMessage, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const grandShortageValue = plan?.items.reduce((sum, i) => sum + i.shortageQuantity, 0) ?? 0

  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">

      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Scale className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative p-8">
          <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Rencana Menu Hari Ini
          </Badge>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-3">Kalkulasi Logistik & Bahan</h1>
          <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed mt-1">
            Kebutuhan bahan dihitung otomatis dari target porsi dikurangi stok yang sudah tersedia (data real-time).
          </p>
        </div>
      </div>

      <QueryState
        status={loadError ? loadError.status : loading ? "loading" : "success"}
        errorMessage={loadError?.errorMessage}
        isNetworkError={loadError?.isNetworkError}
        onRetry={load}
      >
        <div className="space-y-6">
          {notFound && (
            <Card className="bg-amber-50 border-amber-200 rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3">
                <Info className="size-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  Belum ada rencana menu untuk hari ini. Susun target porsi dan bahan di bawah, lalu simpan.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/95 rounded-[24px] shadow-sm border border-white/40 max-w-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                <Users className="size-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Target Porsi</p>
                <Input
                  type="number"
                  min="1"
                  value={targetPax || ''}
                  onChange={(e) => setTargetPax(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-9 mt-1 w-28 rounded-lg font-black text-lg"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Daftar Bahan Menu</CardTitle>
                  <CardDescription>Tambahkan produk dari supplier di marketplace.</CardDescription>
                </div>
                <ProductPicker onPick={addDraftItem} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {draftItems.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-400">Belum ada bahan ditambahkan.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Bahan</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead className="text-center">Takaran / Porsi</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="pl-6 font-semibold text-slate-800">{item.name}</TableCell>
                        <TableCell className="text-slate-500 text-sm">{item.unit}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            value={item.quantityPerPax || ''}
                            onChange={(e) => updateQtyPerPax(item.productId, e.target.value)}
                            className="h-9 w-24 mx-auto text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeDraftItem(item.productId)} className="size-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="h-12 px-8 rounded-xl font-bold gap-2 bg-teal-600 hover:bg-teal-700 text-white">
              <Save className="size-4" /> {saving ? "Menyimpan..." : "Simpan & Hitung Kebutuhan"}
            </Button>
          </div>

          {plan && plan.items.length > 0 && (
            <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
              <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <PackageCheck className="size-5 text-teal-600" />
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Kebutuhan Belanja (Real-time)</CardTitle>
                    <CardDescription>Dihitung server dari target porsi dan stok terkini.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Bahan</TableHead>
                      <TableHead className="text-center">Total Kebutuhan</TableHead>
                      <TableHead className="text-center">Stok Tersedia</TableHead>
                      <TableHead className="text-center pr-6">Harus Dibeli</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plan.items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="pl-6 font-semibold text-slate-800">{item.name}</TableCell>
                        <TableCell className="text-center">{item.requiredQuantity.toLocaleString('id-ID')} {item.unit}</TableCell>
                        <TableCell className="text-center">{item.availableQuantity.toLocaleString('id-ID')} {item.unit}</TableCell>
                        <TableCell className="text-center pr-6">
                          <Badge className={cn(
                            "border-none font-bold text-[10px] uppercase",
                            item.shortageQuantity > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          )}>
                            {item.shortageQuantity > 0 ? `${item.shortageQuantity.toLocaleString('id-ID')} ${item.unit}` : "Cukup"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {grandShortageValue > 0 && (
                  <div className="p-4 border-t border-slate-100 flex justify-end">
                    <Link href="/portal/marketplace">
                      <Button className="rounded-xl font-bold gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                        <ShoppingCart className="size-4" /> Belanja Kekurangan di Marketplace
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </QueryState>
    </div>
  )
}
