"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Truck, 
  Utensils, 
  ChevronRight,
  ArrowRight,
  CalendarDays,
  Info,
  Navigation
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

interface School {
  name: string
  address: string
  distance: string
  time: string
  stage: string
  portions: number
  status: "Disiapkan" | "Menunggu" | "Selesai" | "Dalam Perjalanan"
}

interface ScheduleDay {
  id: number
  dayName: string
  date: string
  menuName: string
  totalPortions: number
  status: "Hari Ini" | "Akan Datang" | "Selesai"
  schools: School[]
}

export default function JadwalDistribusiPage() {
  const scheduleData: ScheduleDay[] = [
    {
      id: 0,
      dayName: "Senin",
      date: "16 Mar",
      menuName: "Paket C: Nasi Ayam Teriyaki, Sop Sayur, Susu UHT",
      totalPortions: 650,
      status: "Hari Ini",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Disiapkan" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    },
    {
      id: 1,
      dayName: "Selasa",
      date: "17 Mar",
      menuName: "Paket A: Nasi Putih, Daging Rendang, Tumis Kacang Panjang",
      totalPortions: 650,
      status: "Akan Datang",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Menunggu" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    },
    {
      id: 2,
      dayName: "Rabu",
      date: "18 Mar",
      menuName: "Paket B: Nasi Kuning, Ayam Goreng, Orek Tempe, Telur Dadar",
      totalPortions: 650,
      status: "Akan Datang",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Menunggu" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    },
    {
      id: 3,
      dayName: "Kamis",
      date: "19 Mar",
      menuName: "Paket D: Nasi Putih, Ikan Bakar, Sayur Asem, Buah",
      totalPortions: 650,
      status: "Akan Datang",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Menunggu" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    },
    {
      id: 4,
      dayName: "Jumat",
      date: "20 Mar",
      menuName: "Paket E: Bubur Kacang Hijau & Telur Rebus (Menu Ringan)",
      totalPortions: 650,
      status: "Akan Datang",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Menunggu" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    },
    {
      id: 5,
      dayName: "Sabtu",
      date: "21 Mar",
      menuName: "Paket Khusus: Nasi Liwet, Ayam Bakar, Lalapan",
      totalPortions: 650,
      status: "Akan Datang",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Menunggu" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    }
  ]

  const [activeDayIdx, setActiveDayIdx] = React.useState(0)
  const activeDay = scheduleData[activeDayIdx]

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-[#FBFBFE]">
      {/* 1. Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <CalendarDays className="size-8 text-primary" />
          Jadwal & Target Distribusi
        </h1>
        <p className="text-muted-foreground font-medium max-w-2xl text-sm leading-relaxed">
          Pantau siklus menu BGN dan alokasi target pengiriman sekolah harian Anda secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* 2. Left Column - Weekly Calendar */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="p-6 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">Siklus Minggu Ini</CardTitle>
              <CardDescription className="font-bold text-slate-900">16 - 21 Maret 2026</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {scheduleData.map((day, idx) => {
                  const isActive = activeDayIdx === idx
                  return (
                    <button
                      key={day.id}
                      onClick={() => setActiveDayIdx(idx)}
                      className={cn(
                        "w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group text-left",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]" 
                          : "hover:bg-slate-50 text-slate-600"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "size-10 rounded-xl flex flex-col items-center justify-center font-black text-[10px] uppercase",
                          isActive ? "bg-white/20" : "bg-slate-100 text-slate-400 group-hover:bg-white"
                        )}>
                          <span>{day.dayName.substring(0, 3)}</span>
                          <span className="text-xs leading-none mt-0.5">{day.date.split(' ')[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-black">{day.dayName}, {day.date}</p>
                          <p className={cn("text-[10px] font-bold opacity-70", isActive ? "text-white" : "text-slate-400")}>
                            Total: {day.totalPortions} Porsi
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase px-2 h-5 border-none",
                        isActive 
                          ? "bg-white text-primary" 
                          : day.status === "Hari Ini" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                      )}>
                        {day.status}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Right Column - Daily Detail View */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Section: Menu Summary */}
          <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden ring-1 ring-slate-100 border-l-4 border-l-primary">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Utensils className="size-4 text-primary" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu Ditetapkan BGN</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {activeDay.menuName}
                  </h2>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="rounded-full text-[10px] font-bold border-slate-200">590 kcal</Badge>
                    <Badge variant="outline" className="rounded-full text-[10px] font-bold border-slate-200">Higienis</Badge>
                  </div>
                </div>
                <div className="md:text-right space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Beban Produksi</p>
                  <p className="text-5xl font-black text-primary tracking-tighter">
                    {activeDay.totalPortions} <span className="text-xl font-bold opacity-40">Porsi</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Middle Section: Target Schools List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Navigation className="size-4 text-primary" />
                Daftar Titik Pengiriman (Routes)
              </h3>
              <span className="text-xs font-bold text-slate-400 italic">Otomatis urut berdasarkan batch masak</span>
            </div>

            <div className="space-y-3">
              {activeDay.schools.map((school, sIdx) => (
                <Card key={sIdx} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100 hover:ring-primary/20 transition-all group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="p-6 flex items-start gap-4 flex-1">
                        <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors shrink-0">
                          <MapPin className="size-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-900">{school.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">{school.address}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase">
                            <Truck className="size-3" />
                            Estimasi Jarak: {school.distance}
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 md:py-0 border-t md:border-t-0 md:border-l border-slate-100 flex items-center gap-8 bg-slate-50/30">
                        <div className="space-y-1 min-w-[120px]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">{school.stage}</span>
                          </div>
                          <p className="text-lg font-black text-slate-700">{school.time} <span className="text-xs font-bold opacity-50 uppercase">WIB</span></p>
                        </div>

                        <div className="text-right space-y-2">
                          <p className="text-lg font-black text-slate-900 leading-none">{school.portions} <span className="text-[10px] font-bold opacity-40 uppercase">Porsi</span></p>
                          <Badge className={cn(
                            "text-[9px] font-black uppercase px-2 h-5 border-none shadow-sm",
                            school.status === "Disiapkan" ? "bg-amber-500 text-white" : 
                            school.status === "Selesai" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                          )}>
                            {school.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Section: Quick Action */}
          <div className="pt-4">
            <Link href="/portal/operasional/kalkulasi-bahan">
              <Button className="w-full h-16 rounded-[24px] font-black text-base shadow-xl shadow-primary/20 gap-3 group">
                Lanjutkan ke Kalkulasi Bahan (Auto-Scale)
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
              <Info className="size-3" />
              Data jadwal ini disinkronisasi langsung oleh BGN Regional
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
