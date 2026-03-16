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
  ShieldCheck
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"

export default function LiveCheckpointPage() {
  const steps = [
    { id: 1, label: "Bahan Baku", icon: Info, status: "active" },
    { id: 2, label: "Pemorsian", icon: Scan, status: "pending" },
    { id: 3, label: "Dispatch Armada", icon: Truck, status: "pending" },
    { id: 4, label: "Tiba di Sekolah", icon: School, status: "pending" },
  ]

  return (
    <div className="p-8 space-y-8 bg-background max-w-5xl mx-auto">
      {/* Top Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Panel Eksekusi Checkpoint</h2>
          <p className="text-muted-foreground text-sm font-medium">Validasi aktivitas dapur secara real-time untuk mencegah penalti keterlambatan.</p>
        </div>
        <Alert className="w-full md:w-[300px] bg-blue-50 border-blue-100 shadow-sm">
          <Navigation className="size-4 text-blue-600" />
          <AlertTitle className="text-[10px] font-black uppercase tracking-widest text-blue-900">Live GPS Status</AlertTitle>
          <AlertDescription className="text-xs font-bold text-blue-700">
            GPS Dapur Aktif: Akurasi 5 meter
          </AlertDescription>
        </Alert>
      </div>

      {/* Progress Tracker (Horizontal Stepper) */}
      <div className="relative flex justify-between px-4 sm:px-10">
        <div className="absolute top-[22px] left-[60px] right-[60px] h-0.5 bg-slate-100 -z-0" />
        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
            <div className={cn(
              "size-11 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl ring-1 transition-all",
              step.status === 'active' ? "bg-primary text-primary-foreground ring-primary/20 scale-110" : "bg-white text-slate-300 ring-slate-100"
            )}>
              <step.icon className="size-5" />
            </div>
            <div className="text-center">
              <p className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                step.status === 'active' ? "text-primary" : "text-slate-400"
              )}>{step.id}. {step.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Action Area (Large Centered Card) */}
      <Card className="border-border bg-card shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-border/50 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="size-2 bg-primary rounded-full animate-pulse" />
                <CardTitle className="text-xl font-black text-foreground">Tugas Saat Ini: Validasi Bahan Baku</CardTitle>
              </div>
              <CardDescription className="font-bold text-slate-500">Batas Waktu: 02:15 WIB</CardDescription>
            </div>
            <div className="bg-red-50 px-4 py-2 rounded-2xl border border-red-100 flex items-center gap-3">
              <Clock className="size-5 text-red-600 animate-pulse" />
              <div className="text-right">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Sisa Waktu</p>
                <p className="text-lg font-black text-red-600 leading-tight">45 Menit</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Camera/Upload Interface */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-600 rounded-[32px] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
            <div className="relative aspect-video sm:aspect-[21/9] border-2 border-dashed border-slate-200 rounded-[28px] bg-slate-50/50 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white transition-all cursor-pointer overflow-hidden">
              <div className="size-24 bg-white rounded-full shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Camera className="size-10 text-primary" />
              </div>
              <div className="text-center space-y-1 px-6">
                <p className="text-xl font-black text-slate-900 tracking-tight">Ketuk untuk Buka Kamera</p>
                <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                  Pastikan seluruh bahan baku (beras, sayur, lauk mentah) masuk dalam satu frame foto untuk dianalisis AI secara otomatis.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full h-16 rounded-[20px] text-lg font-black shadow-xl shadow-primary/20 gap-3">
              <CheckCircle2 className="size-6" />
              Kirim Foto & Jalankan Analisis AI
            </Button>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck className="size-3 text-emerald-500" />
              Sistem Enkripsi BGN Aktif
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Locked Future Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <Card className="bg-slate-50/50 border-border shadow-sm opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-not-allowed">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="size-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
              <Lock className="size-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahap 2</p>
              <h4 className="font-bold text-slate-700">QC Organoleptik & Pemorsian</h4>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="size-3" />
                Terbuka pukul 05:00 WIB
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 border-border shadow-sm opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-not-allowed">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="size-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
              <Truck className="size-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahap 3</p>
              <h4 className="font-bold text-slate-700">Berangkatkan Armada (Dispatch)</h4>
              <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 border-none px-2 h-5">Terkunci</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
