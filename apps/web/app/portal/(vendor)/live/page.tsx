"use client";

import * as React from "react";
import {
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  School,
  Info,
  Lock,
  Scan,
  Navigation,
  ShieldCheck,
  Timer,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Alert,
} from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

export default function LiveCheckpointPage() {
  const [activeStep, setActiveStep] = React.useState(1);
  const [isCP2Done, setIsCP2Done] = React.useState(false);
  const [safetyTimeLeft, setSafetyTimeLeft] = React.useState(14400);

  React.useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isCP2Done && safetyTimeLeft > 0) {
      timer = setInterval(() => {
        setSafetyTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCP2Done, safetyTimeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isUrgent = safetyTimeLeft < 1800;

  const steps = [
    { id: 1, label: "Bahan Baku", icon: Info, time: "02:00" },
    { id: 2, label: "Pemorsian", icon: Scan, time: "05:00" },
    { id: 3, label: "Dispatch", icon: Truck, time: "07:30" },
    { id: 4, label: "Handover", icon: School, time: "08:00" },
  ];

  const handleNextStep = () => {
    if (activeStep === 2) setIsCP2Done(true);
    if (activeStep < 4) setActiveStep((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* 1. Deep Teal Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Camera className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-red-400 animate-pulse mr-2 inline-block" /> Live Camera Validasi
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Panel Eksekusi Checkpoint</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Validasi aktivitas dapur secara real-time. Setiap bukti foto langsung dianalisa oleh BGN-AI.
            </p>
          </div>
          
          <div className="flex bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 gap-6 shrink-0">
            <div>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">GPS Dapur</p>
              <p className="text-teal-400 font-bold flex items-center gap-2 mt-1 text-sm">
                <Navigation className="size-4 animate-pulse" /> Terkunci (5m)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Countdown Banner */}
      {isCP2Done && (
        <Alert
          className={cn(
            "border shadow-sm rounded-2xl transition-all duration-500 animate-in fade-in slide-in-from-top-4 p-6",
            isUrgent
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-teal-50 border-teal-200 text-teal-900",
          )}
        >
          <Timer className={cn("size-6", isUrgent ? "text-red-600" : "text-teal-600")} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-6 mt-1 ml-2">
            <div>
              <div className={cn("text-sm font-bold uppercase tracking-widest mb-1", isUrgent ? "text-red-700" : "text-teal-700")}>
                Aturan Emas: Zona Aman 4 Jam
              </div>
              <div className="text-xs font-semibold opacity-80 mt-1">
                {isUrgent
                  ? "Peringatan Kritis! Segera selesaikan distribusi sebelum batas waktu!"
                  : "Proses pengiriman berjalan. Pastikan makanan tiba tepat waktu."}
              </div>
            </div>
            <div className={cn("px-6 py-3 rounded-xl border bg-white shadow-sm flex flex-col items-center justify-center min-w-[140px]", isUrgent ? "border-red-200" : "border-teal-200")}>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-slate-400">Sisa Waktu</p>
              <p className={cn("text-3xl font-black tabular-nums mt-1", isUrgent ? "text-red-600" : "text-teal-600")}>
                {formatTime(safetyTimeLeft)}
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Progress Tracker (Horizontal Stepper) */}
      <div className="relative px-2 sm:px-8 py-4">
        <div className="absolute top-[32px] left-[12%] right-[12%] h-1 bg-slate-200 rounded-full z-0" />
        <div className="grid grid-cols-4 relative z-10">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            const isDone = activeStep > step.id;
            return (
              <div key={step.id} className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "size-16 rounded-full flex items-center justify-center border-4 shadow-sm transition-all duration-500 bg-white",
                    isActive
                      ? "border-teal-600 text-teal-700 ring-4 ring-teal-50"
                      : isDone
                        ? "border-emerald-500 text-emerald-500"
                        : "border-slate-200 text-slate-300",
                  )}
                >
                  {isDone ? <CheckCircle2 className="size-6" /> : <step.icon className="size-6" />}
                </div>
                <div className="text-center mt-2">
                  <p className={cn("text-[10px] sm:text-xs font-bold uppercase tracking-widest", isActive ? "text-teal-600" : isDone ? "text-emerald-600" : "text-slate-400")}>
                    {step.time}
                  </p>
                  <p className={cn("text-[10px] sm:text-sm font-extrabold mt-0.5", isActive ? "text-slate-900" : isDone ? "text-slate-700" : "text-slate-400")}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Task Card */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200/60">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="size-2.5 bg-teal-500 rounded-full animate-pulse" />
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Tugas {activeStep}: {steps[activeStep - 1]?.label}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs font-semibold text-slate-500 mt-2">
                  Wajib berada di radius GPS Dapur sebelum mengambil foto.
                </CardDescription>
              </div>
              <div className="bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-3">
                <Clock className="size-5 text-red-600" />
                <div className="text-right">
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-none">Batas Waktu</p>
                  <p className="text-base font-extrabold text-red-700 mt-0.5">{steps[activeStep - 1]?.time} WIB</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="relative aspect-video sm:aspect-[21/10] border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center gap-5 hover:border-teal-500 hover:bg-teal-50/50 transition-all cursor-pointer group shadow-inner">
              <div className="size-20 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-slate-100">
                <Camera className="size-8 text-teal-600" />
              </div>
              <div className="text-center px-6">
                <p className="text-lg font-bold text-slate-900">Ketuk untuk Ambil Foto AI</p>
                <p className="text-xs font-medium text-slate-500 mt-2">
                  {activeStep === 1
                    ? "Pastikan seluruh bahan baku harian (beras, sayur, lauk) terlihat jelas dalam satu frame terang."
                    : "Foto satu set porsi makanan (Nasi, Lauk Utama, Sayur, Buah) secara mendetail dari atas."}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <Button onClick={handleNextStep} className="w-full h-14 rounded-xl font-bold text-sm shadow-md bg-teal-600 hover:bg-teal-700 text-white gap-2 transition-all active:scale-95">
                <CheckCircle2 className="size-5" />
                Kirim & Jalankan Validasi Otomatis
              </Button>
              <div className="flex justify-center gap-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="size-4 text-teal-500" /> Secured by BGN-AI
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-500" /> GPS Locked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tahap Berikutnya</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {steps.map((step) => {
                if (step.id <= activeStep) return null;
                return (
                  <div key={step.id} className="p-5 flex items-center gap-4 border-b border-slate-50 last:border-0 opacity-60 bg-white">
                    <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <Lock className="size-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CP {step.id}</p>
                      <p className="text-sm font-bold text-slate-600 mt-1">{step.label}</p>
                    </div>
                  </div>
                );
              })}
              {activeStep === 4 && (
                <div className="p-10 text-center space-y-3 bg-emerald-50/30">
                  <div className="size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <p className="text-base font-extrabold text-emerald-700">Seluruh Tahap Selesai!</p>
                  <p className="text-xs font-semibold text-emerald-600/80">Dashboard akan di-reset otomatis besok pagi.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Need Help Card */}
          <Card className="border-none shadow-sm rounded-2xl bg-amber-50 ring-1 ring-amber-200">
            <CardContent className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="size-5" />
                <p className="text-sm font-bold uppercase tracking-wide">Mengalami Kendala?</p>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                Jika terjadi insiden darurat, segera lapor melalui menu Pusat Kendali Insiden agar pinalti dapat disesuaikan.
              </p>
              <Button className="w-full h-10 text-[11px] font-bold uppercase border border-amber-300 text-amber-800 hover:bg-amber-100 bg-white rounded-xl shadow-sm">
                Buka Laporan Insiden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
