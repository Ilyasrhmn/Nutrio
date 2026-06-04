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
import { cn } from "@workspace/ui/lib/utils";

export default function LiveCheckpointPage() {
  const [activeStep, setActiveStep] = React.useState(1);
  const [isCP2Done, setIsCP2Done] = React.useState(false);
  const [safetyTimeLeft, setSafetyTimeLeft] = React.useState(14400); // 4 jam dalam detik

  // Simulasi countdown setelah CP2 selesai
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

  const isUrgent = safetyTimeLeft < 1800; // 30 menit terakhir

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
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Top Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel Eksekusi Checkpoint</h1>
          <p className="text-slate-500 text-sm mt-1">
            Validasi aktivitas dapur secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Alert className="w-full md:w-[220px] bg-white border-slate-200/60 shadow-sm py-2 px-3 rounded-xl">
            <Navigation className="size-4 text-blue-600" />
            <div className="flex flex-col ml-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none">GPS Dapur</span>
              <span className="text-[11px] font-bold text-blue-600 mt-0.5">Aktif (Akurasi 5m)</span>
            </div>
          </Alert>
        </div>
      </div>

      {/* Safety Countdown Banner */}
      {isCP2Done && (
        <Alert
          className={cn(
            "border shadow-sm rounded-xl transition-all duration-500 animate-in fade-in slide-in-from-top-4",
            isUrgent
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900",
          )}
        >
          <Timer className={cn("size-5", isUrgent ? "text-red-600" : "text-emerald-600")} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div>
              <div className={cn("text-xs font-bold uppercase tracking-widest mb-1", isUrgent ? "text-red-700" : "text-emerald-700")}>
                Aturan Emas: Zona Aman 4 Jam
              </div>
              <div className="text-xs font-medium opacity-80">
                {isUrgent
                  ? "Peringatan Kritis! Segera selesaikan sebelum batas waktu."
                  : "Proses pengiriman berjalan. Pastikan tepat waktu."}
              </div>
            </div>
            <div className={cn("px-4 py-2 rounded-xl border bg-white shadow-sm", isUrgent ? "border-red-200" : "border-emerald-200")}>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-slate-400">Sisa Waktu</p>
              <p className={cn("text-2xl font-bold tabular-nums mt-0.5", isUrgent ? "text-red-600" : "text-emerald-600")}>
                {formatTime(safetyTimeLeft)}
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Progress Tracker (Horizontal Stepper) */}
      <div className="relative flex justify-between px-2 sm:px-8 mt-8 mb-8">
        <div className="absolute top-[22px] left-[10%] right-[10%] h-0.5 bg-slate-200 z-0" />
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          const isDone = activeStep > step.id;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div
                className={cn(
                  "size-12 rounded-xl flex items-center justify-center border-2 shadow-sm transition-all duration-500 bg-white",
                  isActive
                    ? "border-primary text-primary ring-4 ring-primary/10"
                    : isDone
                      ? "border-emerald-500 text-emerald-500"
                      : "border-slate-200 text-slate-300",
                )}
              >
                {isDone ? <CheckCircle2 className="size-5" /> : <step.icon className="size-5" />}
              </div>
              <div className="text-center">
                <p className={cn("text-[9px] font-bold uppercase tracking-widest", isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-slate-400")}>
                  {step.time}
                </p>
                <p className={cn("text-[11px] font-bold mt-0.5", isActive ? "text-slate-900" : isDone ? "text-emerald-700" : "text-slate-500")}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Task Card */}
        <Card className="lg:col-span-2 border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-primary rounded-full animate-pulse" />
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Tugas {activeStep}: {steps[activeStep - 1]?.label}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-500 mt-1">
                  Wajib berada di radius GPS Dapur sebelum lanjut.
                </CardDescription>
              </div>
              <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-3">
                <Clock className="size-4 text-red-600" />
                <div className="text-right">
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-none">Batas Waktu</p>
                  <p className="text-sm font-bold text-red-700 mt-0.5">{steps[activeStep - 1]?.time} WIB</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="relative aspect-video sm:aspect-[21/10] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-slate-50 transition-all cursor-pointer group">
              <div className="size-16 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-slate-100">
                <Camera className="size-6 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-base font-bold text-slate-900">Ambil Foto Validasi AI</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {activeStep === 1
                    ? "Pastikan seluruh bahan baku masuk dalam satu frame foto."
                    : "Foto porsi makanan lengkap (Nasi, Lauk, Sayur, Buah)."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button onClick={handleNextStep} className="w-full h-12 rounded-lg font-bold shadow-sm gap-2">
                <CheckCircle2 className="size-4" />
                Kirim & Validasi Otomatis
              </Button>
              <div className="flex justify-center gap-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="size-3 text-emerald-500" /> Secured by BGN-AI
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="size-3 text-blue-500" /> GPS Verified
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <Card className="border-slate-200/60 shadow-sm rounded-xl">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tahap Berikutnya</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {steps.map((step) => {
                if (step.id <= activeStep) return null;
                return (
                  <div key={step.id} className="p-4 flex items-center gap-3 border-b border-slate-100 last:border-0 opacity-60">
                    <div className="size-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Lock className="size-3 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CP {step.id}</p>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">{step.label}</p>
                    </div>
                  </div>
                );
              })}
              {activeStep === 4 && (
                <div className="p-8 text-center space-y-2">
                  <div className="size-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <p className="text-sm font-bold text-emerald-600">Seluruh Checkpoint Selesai!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Need Help Card */}
          <Card className="border-amber-200 bg-amber-50/50 shadow-sm rounded-xl">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="size-4" />
                <p className="text-xs font-bold uppercase tracking-wide">Mengalami Kendala?</p>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Jika terjadi insiden darurat, segera lapor melalui menu Pusat Kendali Insiden untuk penyesuaian pinalti.
              </p>
              <Button variant="outline" className="w-full h-8 text-[10px] font-bold uppercase border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg">
                Buka Laporan Insiden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
