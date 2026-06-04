"use client"

import React from "react"
import {
  Scale,
  TrendingUp,
  ShieldAlert,
  MapPin,
  ArrowUpRight,
  DollarSign,
  FileText,
  Activity,
  AlertCircle
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"

interface CcOverview {
  totalActive: number
  notStarted: number
  critical: number
  alertPending: number
}

interface Alert {
  id: string
  vendorName: string
  alertType: string
  severity: string
  title: string
  body: string
  createdAt: string
}

export function AdminDashboard() {
  const [overview, setOverview] = React.useState<CcOverview | null>(null)
  const [alerts, setAlerts] = React.useState<Alert[]>([])

  React.useEffect(() => {
    import("@/lib/api-client").then(({ api }) => {
      api.get<CcOverview>('/command-center/overview')
        .then((r) => setOverview(r))
        .catch(() => {})
      api.get<{ data: Alert[] }>('/command-center/alerts?limit=3')
        .then((r) => setAlerts((r as any).data ?? []))
        .catch(() => {})
    })
  }, [])

  return (
    <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none mb-2 font-bold uppercase tracking-tighter">Oversight Mode</Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">KAS & PENGAWASAN NASIONAL</h1>
          <p className="text-slate-500 text-sm">Pemantauan real-time alokasi dana APBN untuk Program MBG.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200">
          Export Laporan Keuangan
        </Button>
      </div>

      {/* Kas & Budget Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="size-12 bg-emerald-50 flex items-center justify-center rounded-2xl text-emerald-600">
              <DollarSign className="size-6" />
            </div>
            <Badge className="bg-emerald-500">Normal</Badge>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Anggaran MBG 2026</p>
            <h3 className="text-3xl font-black text-slate-900">Rp 71.40 Triliun</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400">PENYERAPAN</span>
                <span className="text-slate-900">—</span>
              </div>
              <Progress value={0} className="h-1.5 bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="size-12 bg-red-50 flex items-center justify-center rounded-2xl text-red-600">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor Kritis / Berisiko</p>
            <h3 className="text-3xl font-black text-slate-900">{overview?.critical ?? '—'}</h3>
            {overview && overview.critical > 0 && (
              <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
                <AlertCircle className="size-3" /> {overview.critical} vendor di bawah ambang skor
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="size-12 bg-blue-50 flex items-center justify-center rounded-2xl text-blue-600">
            <Activity className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor Aktif Hari Ini</p>
            <h3 className="text-3xl font-black text-slate-900">{overview?.totalActive ?? '—'}</h3>
            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold mt-2">
              <TrendingUp className="size-3" /> {overview?.notStarted ?? 0} belum mulai hari ini
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts Queue */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Alert Aktif ({overview?.alertPending ?? '—'})</h3>
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-indigo-600">Lihat Semua</Button>
          </div>
          <div className="flex-1">
            <Table>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <ShieldAlert className="size-8 opacity-20" />
                        <p className="text-sm font-medium">Tidak ada alert aktif</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : alerts.map((item) => (
                  <TableRow key={item.id} className="group cursor-pointer hover:bg-slate-50">
                    <TableCell className="p-6">
                      <p className="font-bold text-slate-900 text-sm">{item.vendorName}</p>
                      <p className="text-[10px] text-slate-400">{item.alertType}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-medium text-slate-600">{item.title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        item.severity === 'critical' ? 'bg-red-500' :
                        item.severity === 'warning' ? 'bg-orange-500' : 'bg-amber-500'
                      }>
                        {item.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-white group-hover:shadow-sm">
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
              <FileText className="size-5" />
            </div>
            <h3 className="font-bold text-lg tracking-tight uppercase">System Audit Trail</h3>
          </div>
          <div className="flex-1 py-4 text-center">
            <p className="text-xs text-slate-400">Audit trail akan ditampilkan setelah aktivitas terjadi.</p>
          </div>
          <Button className="mt-8 w-full bg-white/10 hover:bg-white/20 border-white/10 text-white font-bold rounded-2xl h-12">
            Download Audit Full Log (.CSV)
          </Button>
        </div>
      </div>
    </div>
  )
}
