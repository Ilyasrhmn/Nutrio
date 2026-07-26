"use client"

import * as React from "react"
import {
  ClipboardCheck,
  Package,
  Warehouse,
  Trash2,
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
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { inventoryService, InventoryItem } from "@/lib/services/inventory.service"
import { toQueryError } from "@/lib/services/error-handler"

interface RowDraft {
  countedQuantity: string;
  reason: string;
  wasteQuantity: string;
  wasteReason: string;
  saving: boolean;
}

export default function StockOpnamePage() {
  const { toast } = useToast()

  const [items, setItems] = React.useState<InventoryItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [drafts, setDrafts] = React.useState<Record<string, RowDraft>>({})

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const data = await inventoryService.current()
      setItems(data)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  function draftFor(key: string): RowDraft {
    return drafts[key] ?? { countedQuantity: "", reason: "", wasteQuantity: "", wasteReason: "", saving: false }
  }

  function updateDraft(key: string, patch: Partial<RowDraft>) {
    setDrafts((prev) => ({ ...prev, [key]: { ...draftFor(key), ...patch } }))
  }

  async function submitOpname(item: InventoryItem) {
    const key = `${item.productId}:${item.unit}`
    const draft = draftFor(key)
    const counted = parseFloat(draft.countedQuantity)
    if (isNaN(counted) || counted < 0 || draft.reason.trim().length < 3) {
      toast({ title: "Lengkapi data", description: "Isi jumlah fisik dan alasan (min. 3 karakter).", variant: "destructive" })
      return
    }
    updateDraft(key, { saving: true })
    try {
      await inventoryService.opname({ productId: item.productId, unit: item.unit, countedQuantity: counted, reason: draft.reason.trim() })
      toast({ title: "Opname Tersimpan", description: `Stok ${item.name} disesuaikan menjadi ${counted} ${item.unit}.` })
      updateDraft(key, { countedQuantity: "", reason: "", saving: false })
      await load()
    } catch (error) {
      const { errorMessage } = toQueryError(error)
      toast({ title: "Gagal Menyimpan", description: errorMessage, variant: "destructive" })
      updateDraft(key, { saving: false })
    }
  }

  async function submitWaste(item: InventoryItem) {
    const key = `${item.productId}:${item.unit}`
    const draft = draftFor(key)
    const qty = parseFloat(draft.wasteQuantity)
    if (isNaN(qty) || qty <= 0 || draft.wasteReason.trim().length < 3) {
      toast({ title: "Lengkapi data", description: "Isi jumlah waste dan alasan (min. 3 karakter).", variant: "destructive" })
      return
    }
    updateDraft(key, { saving: true })
    try {
      await inventoryService.waste({ productId: item.productId, unit: item.unit, quantity: qty, reason: draft.wasteReason.trim() })
      toast({ title: "Waste Tercatat", description: `${qty} ${item.unit} ${item.name} dicatat sebagai waste.` })
      updateDraft(key, { wasteQuantity: "", wasteReason: "", saving: false })
      await load()
    } catch (error) {
      const { errorMessage } = toQueryError(error)
      toast({ title: "Gagal Mencatat", description: errorMessage, variant: "destructive" })
      updateDraft(key, { saving: false })
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">

      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Warehouse className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative p-8">
          <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Inventory Control
          </Badge>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-3">Stock Opname</h1>
          <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed mt-1">
            Sesuaikan stok tercatat dengan hasil hitung fisik. Stok berasal dari penerimaan PO yang sudah dikonfirmasi.
          </p>
        </div>
      </div>

      <Alert className="bg-teal-50 border-teal-100 rounded-2xl">
        <ClipboardCheck className="size-4 text-teal-600" />
        <AlertTitle className="text-teal-900 font-bold text-xs uppercase tracking-widest">Sumber Data</AlertTitle>
        <AlertDescription className="text-teal-800 text-sm">
          Daftar bahan berasal dari <code className="bg-white px-1.5 py-0.5 rounded text-xs">GET /inventory/current</code> —
          hanya produk yang pernah masuk lewat Purchase Order yang diterima. Belum ada stok? Buat PO dulu di Marketplace.
        </AlertDescription>
      </Alert>

      <QueryState
        status={loadError ? loadError.status : loading ? "loading" : items.length === 0 ? "empty" : "success"}
        errorMessage={loadError?.errorMessage}
        isNetworkError={loadError?.isNetworkError}
        onRetry={load}
        emptyTitle="Belum ada stok tercatat"
        emptyMessage="Stok akan muncul setelah Anda menerima Purchase Order pertama."
      >
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                <Package className="size-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Daftar Inventaris</CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time dari inventory_ledger</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white hover:bg-white border-b border-slate-100">
                  <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14 pl-6">Bahan</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center h-14">Stok Tercatat</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14">Hasil Hitung Fisik</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14">Catat Waste</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const key = `${item.productId}:${item.unit}`
                  const draft = draftFor(key)
                  return (
                    <TableRow key={key} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <TableCell className="pl-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.unit}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-lg font-black text-slate-900">{item.quantity.toLocaleString('id-ID')}</span>
                        <span className="text-[10px] text-slate-500 ml-1">{item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 min-w-[220px] py-2">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Jumlah fisik"
                              value={draft.countedQuantity}
                              onChange={(e) => updateDraft(key, { countedQuantity: e.target.value })}
                              className="h-9 w-28"
                            />
                            <Input
                              placeholder="Alasan"
                              value={draft.reason}
                              onChange={(e) => updateDraft(key, { reason: e.target.value })}
                              className="h-9 flex-1"
                            />
                          </div>
                          <Button size="sm" disabled={draft.saving} onClick={() => submitOpname(item)} className="h-8 text-xs w-fit">
                            <ClipboardCheck className="size-3.5 mr-1.5" /> Simpan Opname
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 min-w-[220px] py-2">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Jumlah"
                              value={draft.wasteQuantity}
                              onChange={(e) => updateDraft(key, { wasteQuantity: e.target.value })}
                              className="h-9 w-24"
                            />
                            <Input
                              placeholder="Alasan"
                              value={draft.wasteReason}
                              onChange={(e) => updateDraft(key, { wasteReason: e.target.value })}
                              className="h-9 flex-1"
                            />
                          </div>
                          <Button size="sm" variant="outline" disabled={draft.saving} onClick={() => submitWaste(item)} className="h-8 text-xs w-fit border-red-200 text-red-600 hover:bg-red-50">
                            <Trash2 className="size-3.5 mr-1.5" /> Catat Waste
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </QueryState>
    </div>
  )
}
