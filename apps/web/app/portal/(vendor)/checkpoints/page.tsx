"use client"

import * as React from "react"
import Link from "next/link"
import {
  Package, ChefHat, BoxSelect, Truck,
  CheckCircle2, Lock, Upload, RefreshCw,
  Loader2, Brain, ExternalLink, Clock,
  Flame, Calendar, Zap, HelpCircle, Target, ShieldCheck, Search,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert"
import { Input } from "@workspace/ui/components/input"
import { Progress } from "@workspace/ui/components/progress"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { api } from "../../../../lib/api-client"

interface CpEvent {
  id: string
  cpType: "CP1" | "CP2" | "CP3" | "CP4"
  cpStatus: "pending" | "in_progress" | "done" | "failed" | "force_closed"
  photos: Array<{ fileKey: string; fileUrl: string }>
  aiValidation: { pass: boolean; reason: string; confidence: number } | null
  completedAt: string | null
}

type CpKey = "CP1" | "CP2" | "CP3" | "CP4"

const CP_META: Record<CpKey, { label: string; Icon: React.ElementType; hint: string; deadline: string; iconBg: string; text: string; bg: string; ring: string; badgeCn: string; dashedCn: string; cardBorderActive: string }> = {
  CP1: {
    label: "Penerimaan Bahan Baku", Icon: Package, deadline: "sebelum 10:00",
    hint: "Foto tumpukan bahan baku yang baru diterima dari pemasok",
    iconBg: "bg-blue-100 text-blue-600", text: "text-blue-700", bg: "bg-blue-50",
    ring: "ring-2 ring-blue-200", badgeCn: "bg-blue-50 text-blue-700 border-blue-100",
    dashedCn: "border-blue-200 hover:border-blue-400 hover:bg-blue-50",
    cardBorderActive: "border-blue-200 shadow-md shadow-blue-100/50",
  },
  CP2: {
    label: "Produksi Makanan", Icon: ChefHat, deadline: "sebelum 12:00",
    hint: "Foto makanan yang sedang atau telah selesai dimasak",
    iconBg: "bg-orange-100 text-orange-600", text: "text-orange-700", bg: "bg-orange-50",
    ring: "ring-2 ring-orange-200", badgeCn: "bg-orange-50 text-orange-700 border-orange-100",
    dashedCn: "border-orange-200 hover:border-orange-400 hover:bg-orange-50",
    cardBorderActive: "border-orange-200 shadow-md shadow-orange-100/50",
  },
  CP3: {
    label: "Pengemasan & Pelabelan", Icon: BoxSelect, deadline: "sebelum 13:00",
    hint: "Foto box makanan yang sudah dikemas dan berlabel QR",
    iconBg: "bg-purple-100 text-purple-600", text: "text-purple-700", bg: "bg-purple-50",
    ring: "ring-2 ring-purple-200", badgeCn: "bg-purple-50 text-purple-700 border-purple-100",
    dashedCn: "border-purple-200 hover:border-purple-400 hover:bg-purple-50",
    cardBorderActive: "border-purple-200 shadow-md shadow-purple-100/50",
  },
  CP4: {
    label: "Distribusi & Konfirmasi", Icon: Truck, deadline: "sebelum 14:00",
    hint: "Foto kendaraan atau proses pengiriman ke sekolah",
    iconBg: "bg-emerald-100 text-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50",
    ring: "ring-2 ring-emerald-200", badgeCn: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dashedCn: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
    cardBorderActive: "border-emerald-200 shadow-md shadow-emerald-100/50",
  },
}

const CP_ORDER: CpKey[] = ["CP1", "CP2", "CP3", "CP4"]

export default function CheckpointsPage() {
  const [dailyScore] = React.useState(95);
  const [streakDays] = React.useState(4);

  const isKritis = dailyScore < 75;

  const checkpoints = [
    {
      time: "02:00",
      label: "Mulai Produksi",
      status: "Selesai",
      statusVariant: "success",
      badge: "AI Validated",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      borderColor: "border-emerald-500",
    },
    {
      time: "05:00",
      label: "QC & Pemorsian",
      status: "Selesai",
      statusVariant: "success",
      badge: "AI Validated",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      borderColor: "border-emerald-500",
    },
    {
      time: "07:30",
      label: "Dispatch",
      status: "Terlambat (07:46)",
      statusVariant: "destructive",
      badge: "-5 Poin (Telat)",
      icon: Clock,
      color: "text-red-500",
      bg: "bg-red-50",
      borderColor: "border-red-500",
    },
    {
      time: "08:00",
      label: "Handover Sekolah",
      status: "Menunggu",
      statusVariant: "outline",
      badge: "Pending",
      icon: Clock,
      color: "text-slate-400",
      bg: "bg-slate-50",
      borderColor: "border-slate-200",
    },
  ];

  const history = [
    {
      date: "Hari Ini",
      time: "07:46",
      desc: "Telat Dispatch (Lewat 16 menit)",
      penalty: "-5 Poin",
      evidence: "Lihat Log GPS",
    },
    {
      date: "10 Mar 2026",
      time: "05:15",
      desc: "QC Gagal: Daging ayam kurang",
      penalty: "-5 Poin",
      evidence: "Lihat Foto AI",
    },
    {
      date: "02 Mar 2026",
      time: "02:10",
      desc: "Telat Mulai Produksi (Ringan)",
      penalty: "-2 Poin",
      evidence: "Lihat Timestamp",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pemantauan Skor & Kepatuhan AI</h1>
          <p className="text-slate-500 text-sm mt-1">Kalkulasi real-time kepatuhan SOP harian dan akumulasi pinalti vendor.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/60 rounded-xl shadow-sm">
            <Flame className="size-5 text-orange-500 animate-bounce" />
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Streak Aktif</p>
              <p className="text-sm font-bold text-orange-600 leading-tight mt-0.5">{streakDays} Hari</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl h-10 border-slate-200 text-slate-600 gap-2 font-semibold">
            <Calendar className="size-4" />
            Riwayat
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      {isKritis ? (
        <Alert variant="destructive" className="border-red-200 shadow-sm bg-red-50/50 rounded-xl">
          <Lock className="size-4" />
          <AlertTitle className="text-xs font-bold uppercase tracking-widest">Sistem Terkunci: Skor Rendah</AlertTitle>
          <AlertDescription className="font-semibold text-red-800 text-xs">
            Skor Anda berada di bawah 75. Tombol Pencairan Dana telah dibekukan otomatis. Hubungi Admin BGN untuk Manual Review.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-amber-200 shadow-sm bg-amber-50/50 rounded-xl text-amber-900">
          <Zap className="size-4 text-amber-600" />
          <AlertTitle className="text-xs font-bold uppercase tracking-widest text-amber-900">Informasi Sistem</AlertTitle>
          <AlertDescription className="font-medium text-amber-800 text-xs">
            Skor Operasional Harian akan direset setiap pukul 00:00. Pertahankan skor di atas 75 untuk menjaga akses Smart Contract tetap aktif.
          </AlertDescription>
        </Alert>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={cn("border-slate-200/60 shadow-sm rounded-xl relative overflow-hidden", isKritis && "border-red-200 ring-1 ring-red-500")}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                Skor Operasional <HelpCircle className="size-3 cursor-help" />
              </p>
              <Target className={cn("size-5", isKritis ? "text-red-500" : "text-primary")} />
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <h3 className={cn("text-4xl font-bold tracking-tight", isKritis ? "text-red-600" : "text-slate-900")}>
                  {dailyScore}
                </h3>
                <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
              <div className="space-y-2">
                <Progress value={dailyScore} className={cn("h-2", isKritis ? "bg-red-100" : "bg-slate-100")} />
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Batas Kritis: 75</p>
                  {isKritis && <Badge className="bg-red-600 text-[9px] h-4 border-none hover:bg-red-700">LOCKED</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
          {isKritis && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}
        </Card>

        <Card className={cn("border-slate-200/60 shadow-sm rounded-xl border-l-4", isKritis ? "border-l-red-500" : "border-l-emerald-500")}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Smart Contract</p>
              <ShieldCheck className={cn("size-5", isKritis ? "text-red-500" : "text-emerald-500")} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className={cn("text-2xl font-bold", isKritis ? "text-red-600" : "text-slate-900")}>
                  {isKritis ? "MANUAL REVIEW" : "OTOMATIS (CAIR)"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isKritis ? "Dana dibekukan hingga review admin selesai." : "Pencairan dana otomatis diaktifkan untuk besok."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress Bonus Gold</p>
              <Zap className="size-5 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "size-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm",
                        i <= streakDays ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {i <= streakDays ? <CheckCircle2 className="size-3.5" /> : i}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-900">1 Hari Lagi!</p>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Pertahankan skor {">"}95 selama 5 hari berturut-turut untuk mendapatkan status <b>Vendor Gold</b> (+1% Margin).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Checkpoint Tracker */}
      <Card className="border-slate-200/60 shadow-sm rounded-xl">
        <CardHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Status Checkpoint Hari Ini (Shift Pagi)</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">Sistem validasi otomatis berbasis AI Visual & GPS.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1 text-[10px] uppercase">
            Live Monitoring
          </Badge>
        </CardHeader>
        <CardContent className="p-8">
          <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4 max-w-4xl mx-auto">
            {/* Connection Line */}
            <div className="absolute top-[26px] left-[10%] right-[10%] h-0.5 bg-slate-100 hidden md:block" />

            {checkpoints.map((cp, idx) => (
              <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center gap-4 flex-1 text-left md:text-center">
                <div className={cn("size-12 rounded-xl flex items-center justify-center border-2 bg-white shadow-sm transition-all", cp.borderColor)}>
                  <cp.icon className={cn("size-5", cp.color)} />
                </div>
                <div className="flex flex-col md:items-center gap-1 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cp.time}</span>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{cp.label}</p>
                  <p className={cn("text-[10px] font-bold uppercase", cp.color)}>{cp.status}</p>
                  <Badge
                    variant={cp.statusVariant as any}
                    className={cn(
                      "mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full border-none",
                      cp.statusVariant === "success" ? "bg-emerald-100 text-emerald-700" : 
                      cp.statusVariant === "destructive" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {cp.badge}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Penalty Ledger Table */}
      <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Riwayat Pinalti (Kumulatif)</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">Rekam jejak pelanggaran yang menambah total akumulasi pinalti.</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input className="pl-9 h-9 border-slate-200 rounded-lg text-xs" placeholder="Cari bukti atau deskripsi..." />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-xs h-10 pl-6">Tanggal</TableHead>
                <TableHead className="font-semibold text-xs h-10 text-center">Waktu</TableHead>
                <TableHead className="font-semibold text-xs h-10">Deskripsi (Checkpoint)</TableHead>
                <TableHead className="font-semibold text-xs h-10 text-center">Potongan</TableHead>
                <TableHead className="font-semibold text-xs h-10 pr-6 text-right">Bukti AI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((row, idx) => (
                <TableRow key={idx} className="group hover:bg-slate-50/80">
                  <TableCell className="font-bold text-slate-900 pl-6 py-4 text-xs">{row.date}</TableCell>
                  <TableCell className="text-center font-medium text-xs text-slate-500">{row.time}</TableCell>
                  <TableCell className="font-medium text-slate-700 text-xs">{row.desc}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-red-600 text-xs">{row.penalty}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button variant="ghost" size="sm" className="h-8 text-primary font-semibold text-[10px] uppercase gap-1.5 hover:bg-primary/5 rounded-lg px-3">
                      {row.evidence}
                      <ExternalLink className="size-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
