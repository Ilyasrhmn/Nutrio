"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  ExternalLink,
  Target,
  ShieldCheck,
  Flame,
  Lock,
  Zap,
  HelpCircle,
  Activity
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { cn } from "@workspace/ui/lib/utils";

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
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* 1. Deep Teal Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 shadow-lg border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Real-time Compliance
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Kepatuhan Checkpoint SOP</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Kalkulasi real-time kepatuhan SOP harian dan akumulasi pinalti operasional dapur Anda.
            </p>
          </div>
          
          <div className="flex bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 gap-6 shrink-0">
            <div>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Streak Aktif</p>
              <p className="text-orange-400 font-bold flex items-center gap-2 mt-1 text-sm">
                <Flame className="size-4 animate-bounce" /> {streakDays} Hari
              </p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <Button variant="outline" className="h-10 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold px-4">
                <Calendar className="size-4 mr-2" /> Riwayat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {isKritis ? (
        <Alert variant="destructive" className="border-red-200 shadow-sm bg-red-50 rounded-2xl p-5">
          <Lock className="size-5" />
          <AlertTitle className="text-sm font-bold uppercase tracking-widest">Sistem Terkunci: Skor Rendah</AlertTitle>
          <AlertDescription className="font-semibold text-red-800 text-xs mt-1">
            Skor Anda berada di bawah 75. Pencairan Dana telah dibekukan otomatis. Hubungi Admin BGN untuk Manual Review.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-amber-200 shadow-sm bg-amber-50 rounded-2xl text-amber-900 p-5">
          <Zap className="size-5 text-amber-600" />
          <AlertTitle className="text-sm font-bold uppercase tracking-widest text-amber-900">Informasi Sistem</AlertTitle>
          <AlertDescription className="font-semibold text-amber-800 text-xs mt-1">
            Skor Operasional Harian direset setiap pukul 00:00. Pertahankan skor {">"}75 untuk akses Smart Contract.
          </AlertDescription>
        </Alert>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={cn("border-none shadow-sm rounded-2xl relative overflow-hidden bg-white", isKritis ? "ring-2 ring-red-500" : "ring-1 ring-slate-200/60")}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                Skor Operasional <HelpCircle className="size-3 cursor-help" />
              </p>
              <Target className={cn("size-5", isKritis ? "text-red-500" : "text-teal-600")} />
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <h3 className={cn("text-4xl font-extrabold tracking-tighter", isKritis ? "text-red-600" : "text-slate-900")}>
                  {dailyScore}
                </h3>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
              <div className="space-y-2">
                <Progress value={dailyScore} className={cn("h-2", isKritis ? "bg-red-100 [&>div]:bg-red-500" : "bg-slate-100 [&>div]:bg-teal-500")} />
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Batas Kritis: 75</p>
                  {isKritis && <Badge className="bg-red-600 text-[9px] h-4 border-none hover:bg-red-700">LOCKED</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
          {isKritis && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}
        </Card>

        <Card className={cn("border-none shadow-sm rounded-2xl bg-white", isKritis ? "ring-2 ring-red-500 bg-red-50/50" : "ring-1 ring-slate-200/60 bg-teal-50/30")}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Smart Contract</p>
              <ShieldCheck className={cn("size-5", isKritis ? "text-red-500" : "text-emerald-500")} />
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <h3 className={cn("text-2xl font-bold tracking-tight", isKritis ? "text-red-600" : "text-slate-900")}>
                  {isKritis ? "MANUAL REVIEW" : "OTOMATIS (CAIR)"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {isKritis ? "Dana dibekukan hingga review admin selesai." : "Pencairan dana otomatis diaktifkan untuk besok pagi."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white ring-1 ring-slate-200/60">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress Bonus Gold</p>
              <Zap className="size-5 text-orange-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "size-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm",
                        i <= streakDays ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {i <= streakDays ? <CheckCircle2 className="size-4" /> : i}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-900 bg-orange-50 text-orange-700 px-2 py-1 rounded-md">1 Hari Lagi!</p>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Pertahankan skor {">"}95 selama 5 hari berturut-turut untuk mendapatkan status <b>Vendor Gold</b> (+1% Margin).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Checkpoint Tracker */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200/60">
        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Status Checkpoint Hari Ini</CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500 mt-1">Sistem validasi otomatis berbasis AI Visual & GPS.</CardDescription>
          </div>
          <Badge className="bg-teal-50 text-teal-700 border-none hover:bg-teal-100 font-bold px-3 py-1 text-[10px] uppercase shadow-sm">
            Live Monitoring
          </Badge>
        </CardHeader>
        <CardContent className="p-10">
          <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4 max-w-5xl mx-auto">
            {/* Connection Line */}
            <div className="absolute top-[26px] left-[10%] right-[10%] h-1 bg-slate-100 rounded-full hidden md:block">
              <div className="absolute top-0 left-0 h-full bg-teal-500 rounded-full w-[40%]" />
            </div>

            {checkpoints.map((cp, idx) => (
              <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center gap-5 flex-1 text-left md:text-center w-full md:w-32">
                <div className={cn(
                  "size-14 rounded-full flex items-center justify-center border-4 bg-white shadow-sm transition-all shrink-0", 
                  cp.status === 'Selesai' ? "border-teal-500 text-teal-600" :
                  cp.status.includes('Terlambat') ? "border-red-500 text-red-600" : "border-slate-200 text-slate-400"
                )}>
                  <cp.icon className="size-6" />
                </div>
                <div className="flex flex-col md:items-center gap-1.5 w-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cp.time}</span>
                  <p className="text-sm font-extrabold text-slate-900 leading-tight">{cp.label}</p>
                  <p className={cn("text-[10px] font-bold uppercase mt-0.5", 
                    cp.status === 'Selesai' ? "text-teal-600" :
                    cp.status.includes('Terlambat') ? "text-red-600" : "text-slate-400"
                  )}>{cp.status}</p>
                  <Badge
                    className={cn(
                      "mt-2 text-[9px] font-bold px-2 py-0.5 rounded-md border-none uppercase tracking-widest",
                      cp.statusVariant === "success" ? "bg-emerald-50 text-emerald-700" : 
                      cp.statusVariant === "destructive" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500",
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
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200/60">
        <CardHeader className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Riwayat Pinalti (Kumulatif)</CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-500 mt-1">Rekam jejak pelanggaran yang memotong skor.</CardDescription>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input className="pl-9 h-10 border-slate-200 rounded-xl text-xs font-medium focus:ring-teal-500 focus:border-teal-500 bg-slate-50" placeholder="Cari bukti atau deskripsi..." />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 hover:bg-slate-50/50">
                <TableHead className="font-bold text-[10px] uppercase tracking-widest h-12 pl-6">Tanggal</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest h-12 text-center">Waktu</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest h-12">Deskripsi Pelanggaran</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest h-12 text-center">Potongan</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest h-12 pr-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((row, idx) => (
                <TableRow key={idx} className="group hover:bg-slate-50/80 border-slate-100">
                  <TableCell className="font-bold text-slate-900 pl-6 py-4 text-xs">{row.date}</TableCell>
                  <TableCell className="text-center font-bold text-xs text-slate-500">{row.time}</TableCell>
                  <TableCell className="font-bold text-slate-700 text-xs">{row.desc}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-extrabold text-red-600 text-xs bg-red-50 px-2 py-1 rounded-md">{row.penalty}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button variant="ghost" size="sm" className="h-8 text-teal-700 font-bold text-[10px] uppercase gap-1.5 hover:bg-teal-50 rounded-lg px-3">
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
  );
}
