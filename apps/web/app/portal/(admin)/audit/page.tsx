"use client"

import * as React from "react"
import {
  History,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Download,
  ShieldCheck,
  AlertTriangle,
  Lock
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
import { cn } from "@workspace/ui/lib/utils"

export default function AuditPage() {
  const auditLogs = [
    {
      id: "AUD-9921",
      date: "Hari Ini",
      time: "05:12",
      checkpoint: "CP2: QC Organoleptik",
      status: "Lolos AI",
      aiSummary: "Porsi Lengkap (Nasi, Ayam, Sayur, Buah)",
      scoreEffect: "+0 Poin",
      vendor: "PT Tani Makmur",
    },
    {
      id: "AUD-9918",
      date: "Hari Ini",
      time: "02:05",
      checkpoint: "CP1: Validasi Bahan",
      status: "Lolos AI",
      aiSummary: "Beras (50kg), Sayur (12kg) - Verified",
      scoreEffect: "+0 Poin",
      vendor: "Koperasi Menteng",
    },
    {
      id: "AUD-9845",
      date: "16 Mar 2026",
      time: "07:46",
      checkpoint: "CP3: Dispatch",
      status: "Terlambat",
      aiSummary: "GPS: Delay 16m - Traffic Jam",
      scoreEffect: "-5 Poin",
      vendor: "CV Fresh Jaya",
    },
    {
      id: "AUD-9812",
      date: "15 Mar 2026",
      time: "05:10",
      checkpoint: "CP2: QC Organoleptik",
      status: "Gagal AI",
      aiSummary: "Lauk Kurang: Hanya terdeteksi 80/100 porsi",
      scoreEffect: "Manual Review",
      vendor: "PT Tani Makmur",
    }
  ]

  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* 1. Deep Teal Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="size-48" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Immutable Ledger
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Arsip Validasi & Audit AI</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Rekam jejak transparansi validasi visual dan data logistik harian. Semua log disimpan secara permanen dan tidak dapat diubah (Immutable) untuk diaudit oleh BGN.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 w-full sm:w-auto flex items-center gap-4">
              <div className="size-10 bg-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Lock className="size-5 text-teal-300" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mb-0.5">Keamanan Sistem</p>
                <p className="text-sm font-bold text-white">Enkripsi 256-bit AES</p>
              </div>
            </div>
            <Button
              className="w-full sm:w-auto rounded-xl h-14 px-6 font-bold shadow-md bg-white text-teal-900 hover:bg-teal-50 gap-2 transition-all"
            >
              <Download className="size-5" />
              Ekspor Laporan PDF
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Stats Bento Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lolos AI (Hari Ini)</p>
          </div>
          <p className="text-3xl font-black text-slate-900">1,248</p>
        </Card>

        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="size-4" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gagal AI (Hari Ini)</p>
          </div>
          <p className="text-3xl font-black text-slate-900">24</p>
        </Card>

        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manual Review</p>
          </div>
          <p className="text-3xl font-black text-slate-900">8</p>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-6 flex flex-col justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-teal-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Health Score BGN</p>
            <ShieldCheck className="size-5 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-teal-900">98.5<span className="text-lg font-bold text-teal-700 ml-1">%</span></p>
        </Card>
      </div>

      {/* 3. Filter & Search Bar */}
      <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="Cari ID Audit, Nama Vendor, atau hasil AI..." />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="h-12 gap-2 font-bold text-xs rounded-xl px-5 flex-1 md:flex-none border-slate-200 text-slate-600 hover:bg-slate-50">
              <Calendar className="size-4" />
              Semua Tanggal
            </Button>
            <Button variant="outline" className="h-12 gap-2 font-bold text-xs rounded-xl px-5 flex-1 md:flex-none border-slate-200 text-slate-600 hover:bg-slate-50">
              <Filter className="size-4" />
              Filter Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4. Main Audit Table */}
      <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-bold text-slate-900">Log Kepatuhan Digital</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500">
                Seluruh data foto dan koordinat disimpan secara permanen untuk kebutuhan audit Dinkes.
              </CardDescription>
            </div>
            <div className="size-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
              <Layers className="size-6 text-slate-300" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-8 py-5">ID Audit</TableHead>
                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Waktu & Vendor</TableHead>
                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Titik Checkpoint</TableHead>
                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Hasil Deteksi AI</TableHead>
                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center">Efek Skor</TableHead>
                <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-8 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log, i) => (
                <TableRow key={i} className="group border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-8 py-5">
                    <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{log.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{log.vendor}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.date} • {log.time} WIB</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-teal-50 text-teal-700 border-none font-bold px-3 py-1 shadow-sm text-[10px] uppercase tracking-widest">
                      {log.checkpoint}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        {log.status.includes('Lolos') ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : (
                          <XCircle className="size-4 text-red-500" />
                        )}
                        <span className={cn(
                          "text-xs font-black uppercase tracking-widest",
                          log.status.includes('Lolos') ? "text-emerald-700" : "text-red-700"
                        )}>{log.status}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium max-w-xs">{log.aiSummary}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-xs font-black px-2 py-1 rounded-md",
                      log.scoreEffect.includes('-') ? "bg-red-50 text-red-700" :
                        log.scoreEffect.includes('+') ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    )}>{log.scoreEffect}</span>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-2 border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all">
                      <Eye className="size-3.5" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footnote */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <ShieldCheck className="size-4 text-slate-400" />
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Data Validated & Secured by Nutrio Compliance Engine
        </p>
      </div>
    </div>
  )
}
