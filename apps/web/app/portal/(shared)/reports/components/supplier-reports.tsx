"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import {
  Truck,
  Package,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileText,
} from "lucide-react"

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
import { cn } from "@workspace/ui/lib/utils"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { ordersService, OrderSummary } from "@/lib/services/orders.service"
import { toQueryError } from "@/lib/services/error-handler"

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Menunggu",
  accepted: "Diterima",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
  dispatched: "Dikirim",
  received: "Selesai",
}

function weekKey(dateStr: string | null): string {
  if (!dateStr) return "Tanpa Tanggal"
  const d = new Date(dateStr)
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - firstDayOfYear.getTime()) / 86400000 + firstDayOfYear.getDay() + 1) / 7)
  return `Minggu ${weekNum}`
}

export default function SupplierReportsPage() {
  const [orders, setOrders] = React.useState<OrderSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null)

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

  const totalOrders = orders.length
  const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const pending = orders.filter((o) => o.status === 'submitted').length
  const completed = orders.filter((o) => o.status === 'received').length
  const dispatchedOrDone = orders.filter((o) => ['dispatched', 'received'].includes(o.status)).length
  const accepted = orders.filter((o) => o.status !== 'submitted' && o.status !== 'rejected' && o.status !== 'cancelled').length
  const onTimeRate = accepted > 0 ? Math.round((dispatchedOrDone / accepted) * 100) : 0

  const byWeek = new Map<string, number>()
  orders.forEach((o) => {
    const key = weekKey(o.requestedDeliveryDate)
    byWeek.set(key, (byWeek.get(key) ?? 0) + o.totalAmount)
  })
  const weekEntries = Array.from(byWeek.entries()).slice(-6)

  const volumeChartOptions: any = {
    chart: { type: 'bar', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#ea580c'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: {
      categories: weekEntries.map(([k]) => k),
      labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 600 } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '10px', fontWeight: 600 }, formatter: (val: number) => `Rp ${(val / 1000).toFixed(0)}rb` }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    tooltip: { theme: 'light' },
  }
  const volumeSeries = [{ name: 'Nilai PO', data: weekEntries.map(([, v]) => v) }]

  const recent = orders.slice(0, 8)

  return (
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-500 pb-12">

      <div className="relative bg-gradient-to-br from-orange-900 via-amber-900 to-slate-900 pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Truck className="size-64" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto space-y-3">
          <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full w-fit">
            Ringkasan Pesanan
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Laporan Purchase Order
          </h1>
          <p className="text-orange-100/80 font-medium text-sm max-w-2xl leading-relaxed">
            Ringkasan PO yang masuk dari vendor, dihitung dari data pesanan real-time.
          </p>
        </div>
      </div>

      <div className="relative z-20 max-w-[1400px] mx-auto px-6 lg:px-12 -mt-20 space-y-6">
        <QueryState
          status={loadError ? loadError.status : loading ? "loading" : orders.length === 0 ? "empty" : "success"}
          errorMessage={loadError?.errorMessage}
          isNetworkError={loadError?.isNetworkError}
          onRetry={load}
          emptyTitle="Belum ada PO"
          emptyMessage="Belum ada pesanan yang masuk dari vendor."
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total PO</p>
                  <h3 className="text-2xl font-black text-slate-900">{totalOrders}</h3>
                </div>
                <div className="size-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
                  <Package className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Nilai PO</p>
                  <h3 className="text-xl font-black text-slate-900">Rp {(totalValue / 1_000_000).toFixed(1)}jt</h3>
                </div>
                <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <TrendingUp className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Menunggu Keputusan</p>
                  <h3 className="text-2xl font-black text-slate-900">{pending}</h3>
                </div>
                <div className="size-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                  <Clock className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tingkat Pengiriman</p>
                  <h3 className="text-2xl font-black text-slate-900">{onTimeRate}%</h3>
                </div>
                <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                  <ShieldCheck className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[24px] border border-slate-200 bg-white overflow-hidden mt-6">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="text-base font-bold text-slate-900">Nilai PO per Minggu Pengiriman</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Dikelompokkan dari tanggal pengiriman diminta pada PO.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {weekEntries.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Belum cukup data.</p>
              ) : (
                <div className="h-[250px] w-full">
                  <ReactApexChart options={volumeChartOptions} series={volumeSeries} type="bar" height="100%" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border border-slate-200 bg-white overflow-hidden mt-6">
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-50">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">PO Terbaru</CardTitle>
                <CardDescription className="text-xs font-medium mt-1">8 pesanan terakhir.</CardDescription>
              </div>
              <FileText className="size-4 text-slate-300" />
            </CardHeader>
            <div className="p-2">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-10">No. PO</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10">Tgl Kirim</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10 text-right">Nilai</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-10 pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((row, i) => (
                    <TableRow
                      key={row.id}
                      className={cn("group border-none transition-colors", hoveredRow === i ? "bg-slate-50" : "bg-transparent")}
                      onMouseEnter={() => setHoveredRow(i)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell className="pl-6 py-3">
                        <p className="font-bold text-slate-900 text-xs">{row.poNumber}</p>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-semibold text-slate-600 text-xs">
                          {row.requestedDeliveryDate ? new Date(row.requestedDeliveryDate).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="font-bold text-slate-900 text-xs">Rp {row.totalAmount.toLocaleString('id-ID')}</span>
                      </TableCell>
                      <TableCell className="py-3 pr-6">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                          {STATUS_LABEL[row.status] ?? row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </QueryState>
      </div>
    </div>
  )
}
