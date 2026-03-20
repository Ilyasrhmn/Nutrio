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
  Camera,
  Layers,
  ArrowUpDown,
  Download
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
      scoreEffect: "+0 Poin"
    },
    {
      id: "AUD-9918",
      date: "Hari Ini",
      time: "02:05",
      checkpoint: "CP1: Validasi Bahan",
      status: "Lolos AI",
      aiSummary: "Beras (50kg), Sayur (12kg) - Verified",
      scoreEffect: "+0 Poin"
    },
    {
      id: "AUD-9845",
      date: "16 Mar 2026",
      time: "07:46",
      checkpoint: "CP3: Dispatch",
      status: "Terlambat",
      aiSummary: "GPS: Delay 16m - Traffic Jam",
      scoreEffect: "-5 Poin"
    },
    {
      id: "AUD-9812",
      date: "15 Mar 2026",
      time: "05:10",
      checkpoint: "CP2: QC Organoleptik",
      status: "Gagal AI",
      aiSummary: "Lauk Kurang: Hanya terdeteksi 80/100 porsi",
      scoreEffect: "Manual Review"
    }
  ]

  return (
    <div className="p-8 space-y-8 bg-background max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            Arsip Validasi & Audit AI
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black h-5 px-2 text-[9px] uppercase">Immutable Logs</Badge>
          </h2>
          <p className="text-muted-foreground text-sm font-medium italic">Rekam jejak transparansi validasi visual dan data logistik harian.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 gap-2 font-bold text-xs uppercase tracking-widest rounded-xl">
            <Download className="size-4" />
            Ekspor Laporan
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-10 h-11 bg-slate-50/50 border-border rounded-xl text-sm" placeholder="Cari ID Audit atau hasil AI..." />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="h-11 gap-2 font-bold text-xs rounded-xl px-4 flex-1 md:flex-none bg-white">
              <Calendar className="size-4" />
              Semua Tanggal
            </Button>
            <Button variant="outline" className="h-11 gap-2 font-bold text-xs rounded-xl px-4 flex-1 md:flex-none bg-white">
              <Filter className="size-4" />
              Filter Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card className="bg-card border-border shadow-sm rounded-[24px] overflow-hidden">
        <CardHeader className="p-8 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Log Kepatuhan Digital</CardTitle>
              <CardDescription className="text-xs font-medium italic">Seluruh data foto dan koordinat disimpan secara permanen untuk kebutuhan audit Dinkes.</CardDescription>
            </div>
            <Layers className="size-5 text-muted-foreground opacity-30" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="font-black text-[10px] uppercase tracking-widest pl-8 py-4">ID Audit</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Waktu & Tanggal</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Titik Checkpoint</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Hasil Deteksi AI</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Efek Skor</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest pr-8 text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log, i) => (
                <TableRow key={i} className="group border-border/50 hover:bg-primary/[0.02] transition-colors">
                  <TableCell className="pl-8 py-5">
                    <span className="font-mono text-[11px] font-bold text-slate-400">{log.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-900">{log.date}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">{log.time} WIB</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] font-bold py-0 h-5">
                        {log.checkpoint}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {log.status.includes('Lolos') ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="size-3.5 text-red-500" />
                        )}
                        <span className={cn(
                          "text-xs font-black uppercase tracking-tight",
                          log.status.includes('Lolos') ? "text-emerald-600" : "text-red-600"
                        )}>{log.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{log.aiSummary}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-xs font-black",
                      log.scoreEffect.includes('-') ? "text-red-600" : 
                      log.scoreEffect.includes('+') ? "text-emerald-600" : "text-orange-600"
                    )}>{log.scoreEffect}</span>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footnote */}
      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        Data Validated & Secured by VendorTrack compliance engine
      </p>
    </div>
  )
}
