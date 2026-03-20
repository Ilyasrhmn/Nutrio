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
      badge: "AI Validated (Bahan Baku)",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      time: "05:00",
      label: "QC & Pemorsian",
      status: "Selesai",
      statusVariant: "success",
      badge: "AI Validated (Lengkap)",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      time: "07:30",
      label: "Dispatch / Pengiriman",
      status: "Terlambat (07:46)",
      statusVariant: "destructive",
      badge: "-5 Poin (Telat Sedang)",
      icon: Clock,
      color: "text-red-500",
      bg: "bg-red-50",
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
    <div className="p-8 space-y-8 bg-background">
      {/* Top Section: Headers & Warning Banner */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Pemantauan Skor & Kepatuhan AI
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              Kalkulasi real-time kepatuhan SOP harian dan akumulasi pinalti
              vendor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-2xl shadow-sm"
              title="Rajin selama 4 hari berturut-turut! Capai 5 hari untuk bonus Gold."
            >
              <Flame className="size-5 text-orange-500 animate-bounce" />
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-orange-400 uppercase leading-none">
                  Streak Aktif
                </p>
                <p className="text-sm font-black text-orange-600 leading-tight">
                  {streakDays} Hari
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-full bg-card h-12 border-border gap-2 font-bold text-xs uppercase tracking-wider"
            >
              <Calendar className="size-4" />
              Riwayat Skor
            </Button>
          </div>
        </div>

        {/* Warning Banner / Status Lock */}
        {isKritis ? (
          <Alert
            variant="destructive"
            className="border-red-200 shadow-md bg-red-50/50"
          >
            <Lock className="size-4" />
            <AlertTitle className="text-xs font-black uppercase tracking-widest">
              SISTEM TERKUNCI: SKOR RENDAH
            </AlertTitle>
            <AlertDescription className="font-bold text-red-800">
              Skor Anda berada di bawah 75. Tombol Pencairan Dana telah
              dibekukan otomatis. Hubungi Admin BGN untuk Manual Review.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-200 shadow-sm bg-amber-50/30">
            <Zap className="size-4 text-amber-600" />
            <AlertTitle className="text-xs font-black uppercase tracking-widest text-amber-900">
              INFORMASI SISTEM
            </AlertTitle>
            <AlertDescription className="font-medium text-amber-800">
              Skor Operasional Harian akan direset setiap pukul 00:00.
              Pertahankan skor di atas 75 untuk menjaga akses Smart Contract
              tetap aktif.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={cn(
            "bg-card border-border shadow-sm transition-all relative overflow-hidden",
            isKritis ? "ring-2 ring-red-500 shadow-red-100" : "",
          )}
        >
          <CardContent className="p-6 space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Skor Operasional Harian
                </p>
                <HelpCircle
                  className="size-3 text-muted-foreground cursor-help"
                />
              </div>
              <Target
                className={cn(
                  "size-5",
                  isKritis ? "text-red-500" : "text-primary",
                )}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <h3
                  className={cn(
                    "text-4xl font-black tracking-tighter",
                    isKritis ? "text-red-600" : "text-foreground",
                  )}
                >
                  {dailyScore}
                </h3>
                <span className="text-sm font-bold text-muted-foreground">
                  / 100
                </span>
              </div>
              <div className="space-y-1.5">
                <Progress
                  value={dailyScore}
                  className="h-3"
                  style={{ backgroundColor: isKritis ? "#fee2e2" : undefined }}
                />
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-muted-foreground font-bold italic uppercase tracking-tighter">
                    Batas Kritis: 75
                  </p>
                  {isKritis && (
                    <Badge className="bg-red-600 text-[9px] h-4">
                      STATUS: LOCK
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          {isKritis && (
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
          )}
        </Card>

        <Card className="bg-card shadow-sm border-l-4 border-destructive/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Status Smart Contract
              </p>
              <ShieldCheck
                className={cn(
                  "size-5",
                  isKritis ? "text-red-500" : "text-emerald-500",
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "text-2xl font-black",
                    isKritis ? "text-red-600" : "text-foreground",
                  )}
                >
                  {isKritis ? "MANUAL REVIEW" : "OTOMATIS (CAIR)"}
                </h3>
                <Badge
                  className={cn(
                    "font-bold uppercase text-[9px]",
                    isKritis
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-50 text-emerald-600",
                  )}
                >
                  {isKritis ? "LOCKED" : "ACTIVE"}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic">
                {isKritis
                  ? "Dana dibekukan hingga review admin selesai."
                  : "Pencairan dana otomatis diaktifkan."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Progress Menuju Bonus Gold
              </p>
              <Zap className="size-5 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "size-6 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-black",
                        i <= streakDays
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {i <= streakDays ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        i
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-foreground">
                  1 Hari Lagi!
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                Pertahankan skor {">"}95 selama 5 hari berturut-turut untuk
                mendapatkan status <b>Vendor Gold</b> (+1% Margin Bonus).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Checkpoint Tracker */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-8 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold tracking-tight">
                Status Checkpoint Hari Ini (Shift Pagi)
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium italic">
                Sistem validasi otomatis berbasis AI Visual & GPS.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/10 font-black h-7 px-3 text-[10px] uppercase"
            >
              Live Monitoring
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-10 pb-12">
          <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4 px-4">
            {/* Connection Line */}
            <div className="absolute top-[22px] left-8 right-8 h-0.5 bg-slate-100 hidden md:block" />

            {checkpoints.map((cp, idx) => (
              <div
                key={idx}
                className="relative z-10 flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-4 flex-1 text-center md:text-center"
              >
                <div
                  className={cn(
                    "size-11 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl ring-1 ring-slate-100 transition-all",
                    cp.bg,
                  )}
                >
                  <cp.icon className={cn("size-5", cp.color)} />
                </div>
                <div className="flex flex-col md:items-center text-left md:text-center gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {cp.time}
                  </span>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {cp.label}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] font-black uppercase mt-1",
                      cp.color,
                    )}
                  >
                    {cp.status}
                  </p>
                  <Badge
                    variant={cp.statusVariant as "default" | "secondary" | "destructive" | "outline" | "success" | "warning"}
                    className={cn(
                      "mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full border-none",
                      cp.statusVariant === "success"
                        ? "bg-emerald-500 text-white"
                        : cp.statusVariant === "destructive"
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-slate-100 text-slate-500",
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
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold tracking-tight">
                Kalkulasi & Riwayat Pinalti (Kumulatif)
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium italic">
                Rekam jejak pelanggaran yang menambah total akumulasi pinalti
                Anda.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  className="pl-9 h-9 bg-card border-border rounded-lg text-xs"
                  placeholder="Cari bukti atau deskripsi..."
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/50">
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pl-8">
                  Tanggal
                </TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest text-center">
                  Waktu
                </TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">
                  Deskripsi (Checkpoint)
                </TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest text-center">
                  Potongan Poin
                </TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pr-8 text-right">
                  Bukti AI
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((row, idx) => (
                <TableRow
                  key={idx}
                  className="group border-border/50 hover:bg-muted/5 transition-colors"
                >
                  <TableCell className="font-bold text-foreground pl-8 py-5 text-sm">
                    {row.date}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {row.time}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 text-sm">
                    {row.desc}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-black text-red-600 text-sm">
                      {row.penalty}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-primary font-bold text-[10px] uppercase tracking-wider gap-1.5 hover:bg-primary/5 rounded-full px-3"
                    >
                      {row.evidence}
                      <ExternalLink className="size-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
