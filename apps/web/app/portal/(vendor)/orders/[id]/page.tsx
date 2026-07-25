"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle, Clock } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { ordersService, OrderDetail } from "@/lib/services/orders.service"
import { toQueryError } from "@/lib/services/error-handler"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/common"
import { cn } from "@workspace/ui/lib/utils"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  submitted: { label: "Menunggu Supplier", className: "bg-amber-100 text-amber-700" },
  accepted: { label: "Diterima Supplier", className: "bg-blue-100 text-blue-700" },
  rejected: { label: "Ditolak", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Dibatalkan", className: "bg-slate-100 text-slate-500" },
  dispatched: { label: "Dikirim", className: "bg-indigo-100 text-indigo-700" },
  received: { label: "Diterima", className: "bg-emerald-100 text-emerald-700" },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const orderId = params?.id as string

  const [order, setOrder] = React.useState<OrderDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [actionLoading, setActionLoading] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState("")
  const [showRejectForm, setShowRejectForm] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!orderId) return
    try {
      setLoading(true)
      setLoadError(null)
      const data = await ordersService.detail(orderId)
      setOrder(data)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [orderId])

  React.useEffect(() => {
    load()
  }, [load])

  async function runAction(fn: () => Promise<unknown>, successMsg: string) {
    setActionLoading(true)
    try {
      await fn()
      toast({ title: "Berhasil", description: successMsg })
      await load()
      setShowRejectForm(false)
      setRejectReason("")
    } catch (error) {
      const { errorMessage } = toQueryError(error)
      toast({ title: "Aksi Gagal", description: errorMessage, variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  const isSupplierView = user?.role === UserRole.SUPPLIER
  const isVendorView = user?.role === UserRole.VENDOR

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto min-h-screen space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary font-semibold">
        <ArrowLeft className="size-4" /> Kembali
      </button>

      <QueryState
        status={loadError ? loadError.status : loading ? "loading" : !order ? "empty" : "success"}
        errorMessage={loadError?.errorMessage}
        isNetworkError={loadError?.isNetworkError}
        onRetry={load}
        emptyTitle="PO tidak ditemukan"
        emptyMessage="Purchase order ini mungkin sudah dihapus atau Anda tidak punya akses."
      >
        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{order.poNumber}</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Pengiriman diminta: {order.requestedDeliveryDate ? new Date(order.requestedDeliveryDate).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
                <Badge className={cn("border-none font-bold", STATUS_LABEL[order.status]?.className)}>
                  {STATUS_LABEL[order.status]?.label ?? order.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div key={item.productId} className="py-2 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-slate-800">{item.productName}</p>
                        <p className="text-xs text-slate-500">{item.qty} {item.unit} &times; Rp {item.unitPrice.toLocaleString('id-ID')}</p>
                      </div>
                      <p className="font-bold text-slate-900">Rp {item.lineTotal.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t font-bold text-slate-900">
                  <span>Total</span>
                  <span>Rp {order.totalAmount.toLocaleString('id-ID')}</span>
                </div>
                {order.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                    Alasan: {order.rejectionReason}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Aksi</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {isVendorView && ['submitted', 'accepted'].includes(order.status) && (
                  <Button
                    variant="outline"
                    disabled={actionLoading}
                    className="w-full"
                    onClick={() => runAction(() => ordersService.cancel(order.id, "Dibatalkan oleh vendor"), "PO dibatalkan.")}
                  >
                    <XCircle className="size-4 mr-2" /> Batalkan PO
                  </Button>
                )}
                {isVendorView && order.status === 'dispatched' && (
                  <Button
                    disabled={actionLoading}
                    className="w-full"
                    onClick={() => runAction(() => ordersService.receive(order.id), "Barang diterima, stok bertambah.")}
                  >
                    <CheckCircle2 className="size-4 mr-2" /> Konfirmasi Barang Diterima
                  </Button>
                )}

                {isSupplierView && order.status === 'submitted' && (
                  <div className="flex flex-col gap-3">
                    <Button
                      disabled={actionLoading}
                      onClick={() => runAction(() => ordersService.accept(order.id), "PO diterima.")}
                    >
                      <CheckCircle2 className="size-4 mr-2" /> Terima PO
                    </Button>
                    {!showRejectForm ? (
                      <Button variant="outline" disabled={actionLoading} onClick={() => setShowRejectForm(true)}>
                        <XCircle className="size-4 mr-2" /> Tolak PO
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Label>Alasan Penolakan</Label>
                        <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Minimal 3 karakter" />
                        <Button
                          variant="destructive"
                          disabled={actionLoading || rejectReason.trim().length < 3}
                          onClick={() => runAction(() => ordersService.reject(order.id, rejectReason.trim()), "PO ditolak.")}
                          className="w-full"
                        >
                          Kirim Penolakan
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {isSupplierView && order.status === 'accepted' && (
                  <Button
                    disabled={actionLoading}
                    className="w-full"
                    onClick={() => runAction(() => ordersService.dispatch(order.id), "PO ditandai dikirim.")}
                  >
                    <Truck className="size-4 mr-2" /> Tandai Dikirim
                  </Button>
                )}
                {!(['submitted', 'accepted', 'dispatched'].includes(order.status)) && (
                  <p className="text-sm text-slate-400 text-center py-2">Tidak ada aksi tersedia untuk status ini.</p>
                )}
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="size-4" /> Riwayat Status</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="size-3" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}
                        </p>
                        <p className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleString('id-ID')}</p>
                        {h.notes && <p className="text-xs text-slate-500 mt-0.5">{h.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryState>
    </div>
  )
}
