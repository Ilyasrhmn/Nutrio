"use client"

import * as React from "react"
import Link from "next/link"
import { FileText, ChevronRight, Package } from "lucide-react"

import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { ordersService, OrderSummary } from "@/lib/services/orders.service"
import { toQueryError } from "@/lib/services/error-handler"
import { cn } from "@workspace/ui/lib/utils"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  submitted: { label: "Perlu Ditinjau", className: "bg-amber-100 text-amber-700" },
  accepted: { label: "Diterima", className: "bg-blue-100 text-blue-700" },
  rejected: { label: "Ditolak", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Dibatalkan Vendor", className: "bg-slate-100 text-slate-500" },
  dispatched: { label: "Dikirim", className: "bg-indigo-100 text-indigo-700" },
  received: { label: "Selesai", className: "bg-emerald-100 text-emerald-700" },
}

export default function SupplierOrdersQueuePage() {
  const [orders, setOrders] = React.useState<OrderSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const data = await ordersService.listSupplier()
      setOrders(data)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const pendingCount = orders.filter((o) => o.status === 'submitted').length

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="size-6 text-primary" /> Antrian Purchase Order
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {pendingCount > 0 ? `${pendingCount} PO menunggu keputusan Anda.` : 'Pesanan dari vendor SPPG.'}
        </p>
      </div>

      <QueryState
        status={loadError ? loadError.status : loading ? "loading" : orders.length === 0 ? "empty" : "success"}
        errorMessage={loadError?.errorMessage}
        isNetworkError={loadError?.isNetworkError}
        onRetry={load}
        emptyTitle="Belum ada PO masuk"
        emptyMessage="Pesanan dari vendor akan muncul di sini."
      >
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_LABEL[order.status] ?? { label: order.status, className: "bg-slate-100 text-slate-600" }
            return (
              <Link key={order.id} href={`/portal/orders/${order.id}`}>
                <Card className={cn("hover:shadow-md transition-shadow", order.status === 'submitted' && "border-amber-300 ring-1 ring-amber-100")}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Package className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm">{order.poNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.requestedDeliveryDate ? new Date(order.requestedDeliveryDate).toLocaleDateString('id-ID') : '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                      <Badge className={cn("border-none text-[10px] font-bold mt-1", status.className)}>{status.label}</Badge>
                    </div>
                    <ChevronRight className="size-4 text-slate-300 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </QueryState>
    </div>
  )
}
