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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"

export function AdminDashboard() {
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
                <span className="text-slate-900">14% (Rp 10.2 T)</span>
              </div>
              <Progress value={14} className="h-1.5 bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="size-12 bg-red-50 flex items-center justify-center rounded-2xl text-red-600">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dana Tertahan (Escrow/Fraud Flag)</p>
            <h3 className="text-3xl font-black text-slate-900">Rp 142.8 Miliar</h3>
            <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
              <AlertCircle className="size-3" /> 12 Vendor sedang di-investigasi
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="size-12 bg-blue-50 flex items-center justify-center rounded-2xl text-blue-600">
            <Activity className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Indeks Kepatuhan Nasional</p>
            <h3 className="text-3xl font-black text-slate-900">92.4 / 100</h3>
            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold mt-2">
              <TrendingUp className="size-3" /> +1.2% dari bulan lalu
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fraud Queue */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Antrian Mitigasi Fraud (AI Flagged)</h3>
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-indigo-600">Lihat Semua</Button>
          </div>
          <div className="flex-1">
            <Table>
              <TableBody>
                {[
                  { region: "Bogor, Jabar", vendor: "Catering Berkah", anomaly: "Ghost Portion (F3.1)", risk: "CRITICAL" },
                  { region: "Medan, Sumut", vendor: "UD Maju Jaya", anomaly: "Recycled Photo (F3.4)", risk: "HIGH" },
                  { region: "Surabaya, Jatim", vendor: "Dapur Rakyat", anomaly: "Price Mark-up (F2.1)", risk: "MEDIUM" },
                ].map((item, i) => (
                  <TableRow key={i} className="group cursor-pointer hover:bg-slate-50">
                    <TableCell className="p-6">
                      <p className="font-bold text-slate-900 text-sm">{item.vendor}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="size-3" /> {item.region}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-medium text-slate-600">{item.anomaly}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={item.risk === 'CRITICAL' ? 'bg-red-500' : item.risk === 'HIGH' ? 'bg-orange-500' : 'bg-amber-500'}>
                        {item.risk}
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
          <div className="space-y-6 flex-1">
            {[
              { act: "Pencairan Dana Wilayah Barat", user: "Admin_Keuangan", time: "2m ago" },
              { act: "Pembekuan Akun Vendor #082", user: "AI_Compliance", time: "15m ago" },
              { act: "Update Juknis Gizi v3.1", user: "Admin_BGN", time: "1h ago" },
            ].map((log, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="size-2 rounded-full bg-indigo-500 mt-1.5 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                <div className="space-y-1">
                  <p className="text-sm font-bold leading-none">{log.act}</p>
                  <p className="text-[10px] text-slate-400 italic">Oleh {log.user} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-8 w-full bg-white/10 hover:bg-white/20 border-white/10 text-white font-bold rounded-2xl h-12">
            Download Audit Full Log (.CSV)
          </Button>
        </div>
      </div>
    </div>
  )
}
