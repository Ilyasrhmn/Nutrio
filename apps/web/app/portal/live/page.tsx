"use client"

import * as React from "react"
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
  AlertCircle,
  Navigation,
  ShieldCheck,
  Timer,
  AlertTriangle
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"

export default function LiveCheckpointPage() {
  const [activeStep, setActiveStep] = React.useState(1)
  const [isCP2Done, setIsCP2Done] = React.useState(false)
  const [safetyTimeLeft, setSafetyTimeLeft] = React.useState(14400) // 4 jam dalam detik

  // Simulasi countdown setelah CP2 selesai
  React.useEffect(() => {
    let timer: any
    if (isCP2Done && safetyTimeLeft > 0) {
      timer = setInterval(() => {
        setSafetyTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isCP2Done, safetyTimeLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isUrgent = safetyTimeLeft < 1800 // 30 menit terakhir

  const steps = [
    { id: 1, label: "Bahan Baku", icon: Info, time: "02:00" },
    { id: 2, label: "Pemorsian", icon: Scan, time: "05:00" },
    { id: 3, label: "Dispatch Armada", icon: Truck, time: "07:30" },
    { id: 4, label: "Tiba di Sekolah", icon: School, time: "08:00" },
  ]

  const handleNextStep = () => {
    if (activeStep === 2) setIsCP2Done(true)
    if (activeStep < 4) setActiveStep(prev => prev + 1)
  }

  return (
    <div className="p-8 space-y-8 bg-background max-w-5xl mx-auto">
      {/* Top Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Panel Eksekusi Checkpoint AI</h2>
          <p className="text-muted-foreground text-sm font-medium">Validasi aktivitas dapur secara real-time untuk mencegah penalti keterlambatan.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Alert className="w-full md:w-[240px] bg-blue-50 border-blue-100 shadow-sm py-2">
            <Navigation className="size-4 text-blue-600" />
            <div className="flex flex-col ml-2">
              <AlertTitle className="text-[9px] font-black uppercase tracking-widest text-blue-900 leading-none">GPS Dapur</AlertTitle>
              <AlertDescription className="text-[11px] font-bold text-blue-700">Aktif (Akurasi 5m)</AlertDescription>
            </div>
          </Alert>
        </div>
      </div>

      {/* Safety Countdown Banner (Sticky after CP2) */}
      {isCP2Done && (
        <Alert className={cn(
          "border-2 transition-all duration-500 animate-in fade-in slide-in-from-top-4",
          isUrgent ? "bg-red-600 border-red-400 text-white animate-pulse" : "bg-emerald-600 border-emerald-400 text-white"
        )}>
          <Timer className="size-5 text-white" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div>
              <AlertTitle className="text-xs font-black uppercase tracking-widest">ATURAN EMAS NO. 8: ZONA AMAN 4 JAM</AlertTitle>
              <AlertDescription className="text-sm font-medium">
                {isUrgent 
                  ? "PERINGATAN KRITIS! Makanan harus sampai di sekolah segera sebelum terkunci otomatis." 
                  : "Proses pengiriman sedang berjalan. Pastikan makanan tiba sebelum batas waktu habis."}
              </AlertDescription>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl border border-white/30 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none opacity-80 text-white">Sisa Waktu Aman</p>
              <p className="text-2xl font-black text-white tabular-nums">{formatTime(safetyTimeLeft)}</p>
            </div>
          </div>
        </Alert>
      )}

      {/* Progress Tracker (Horizontal Stepper) */}
      <div className="relative flex justify-between px-4 sm:px-10">
        <div className="absolute top-[22px] left-[60px] right-[60px] h-0.5 bg-slate-100 -z-0" />
        {steps.map((step) => {
          const isActive = activeStep === step.id
          const isDone = activeStep > step.id
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "size-11 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl ring-1 transition-all duration-500",
                isActive ? "bg-primary text-primary-foreground ring-primary/20 scale-110" : 
                isDone ? "bg-emerald-500 text-white ring-emerald-100" : "bg-white text-slate-300 ring-slate-100"
              )}>
                {isDone ? <CheckCircle2 className="size-5" /> : <step.icon className="size-5" />}
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-tighter",
                  isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-slate-400"
                )}>{step.time} WIB</p>
                <p className={cn(
                  "text-[10px] font-bold",
                  isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-slate-400"
                )}>{step.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Task Card */}
        <Card className="lg:col-span-2 border-border bg-card shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-border/50 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-primary rounded-full animate-pulse" />
                  <CardTitle className="text-xl font-black text-foreground">
                    Tugas {activeStep}: {steps[activeStep-1].label}
                  </CardTitle>
                </div>
                <CardDescription className="font-bold text-slate-500 italic">
                  Wajib berada di radius GPS Dapur sebelum lanjut.
                </CardDescription>
              </div>
              <div className="bg-red-50 px-4 py-2 rounded-2xl border border-red-100 flex items-center gap-3">
                <Clock className="size-5 text-red-600 animate-pulse" />
                <div className="text-right">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Batas Waktu</p>
                  <p className="text-lg font-black text-red-600 leading-tight">{steps[activeStep-1].time} WIB</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-600 rounded-[32px] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
              <div className="relative aspect-video sm:aspect-[21/10] border-2 border-dashed border-slate-200 rounded-[28px] bg-slate-50/50 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white transition-all cursor-pointer overflow-hidden group">
                <div className="size-24 bg-white rounded-full shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Camera className="size-10 text-primary" />
                </div>
                <div className="text-center space-y-1 px-6">
                  <p className="text-xl font-black text-slate-900 tracking-tight">Ambil Foto Validasi AI</p>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    {activeStep === 1 
                      ? "Pastikan seluruh bahan baku masuk dalam satu frame foto." 
                      : "Foto porsi makanan lengkap (Nasi, Lauk, Sayur, Buah)."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleNextStep}
                className="w-full h-16 rounded-[20px] text-lg font-black shadow-xl shadow-primary/20 gap-3 group"
              >
                <CheckCircle2 className="size-6 transition-transform group-hover:scale-110" />
                Kirim & Validasi Otomatis
              </Button>
              <div className="flex items-center justify-center gap-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  Secured by BGN-AI
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="size-3 text-blue-500" />
                  GPS Verified
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Status / Locked Items */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="p-5 border-b border-border/50">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tahap Berikutnya</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {steps.map((step) => {
                const isLocked = step.id > activeStep
                if (step.id <= activeStep) return null
                return (
                  <div key={step.id} className="p-5 flex items-center gap-4 opacity-50 grayscale border-b border-border/50 last:border-0">
                    <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Lock className="size-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CP {step.id}</p>
                      <h4 className="text-sm font-bold text-slate-700">{step.label}</h4>
                    </div>
                  </div>
                )
              })}
              {activeStep === 4 && (
                <div className="p-8 text-center space-y-3">
                  <div className="size-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <p className="text-sm font-bold text-emerald-700">Seluruh Checkpoint Selesai!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Need Help Card */}
          <Card className="border-amber-100 bg-amber-50/50 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="size-4" />
                <p className="text-xs font-bold uppercase tracking-tight">Mengalami Kendala?</p>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Jika terjadi insiden darurat (ban bocor, kecelakaan, dll), segera lapor melalui menu <b>Pusat Kendali Insiden</b> untuk penyesuaian pinalti.
              </p>
              <Button variant="outline" className="w-full h-8 text-[10px] font-black uppercase border-amber-200 text-amber-700 hover:bg-amber-100">
                Buka Laporan Insiden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
