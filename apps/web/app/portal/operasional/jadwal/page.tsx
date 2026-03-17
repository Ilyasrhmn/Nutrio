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
  Navigation,
  Users,
  TrendingUp,
  LayoutDashboard,
  ChefHat
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
  status: "Planned" | "Draft" | "No Plan"
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
      status: "Planned",
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
      status: "Planned",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Menunggu" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    },
    {
      id: 2,
      dayName: "Rabu",
      date: "18 Mar",
      menuName: "Belum Ditentukan",
      totalPortions: 650,
      status: "Draft",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Menunggu" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    },
    {
      id: 3,
      dayName: "Kamis",
      date: "19 Mar",
      menuName: "Belum Ditentukan",
      totalPortions: 650,
      status: "No Plan",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Menunggu" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    },
    {
      id: 4,
      dayName: "Jumat",
      date: "20 Mar",
      menuName: "Belum Ditentukan",
      totalPortions: 650,
      status: "No Plan",
      schools: [
        { name: "SDN Menteng 01", address: "Jl. Menteng Raya No.9", distance: "2.5 km", time: "07:30", stage: "Tahap 1", portions: 450, status: "Menunggu" },
        { name: "SMPN 03 Jakarta", address: "Jl. Manggarai 1", distance: "4.1 km", time: "10:30", stage: "Tahap 3", portions: 200, status: "Menunggu" },
      ]
    }
  ]

  const [activeDayIdx, setActiveDayIdx] = React.useState(0)
  const activeDay = scheduleData[activeDayIdx]

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-background">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <CalendarDays className="size-8 text-primary" />
            Kalender Perencanaan SPPG
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl text-sm leading-relaxed">
            Kelola perencanaan menu harian dan pantau target demand zona MBG Anda.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-5 py-3 rounded-2xl shadow-sm">
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-foreground tracking-tight">Status: Active Planning</span>
        </div>
      </div>

      {/* 2. Demand Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Demand</p>
              <p className="text-2xl font-black text-foreground">{activeDay.totalPortions} <span className="text-xs font-bold opacity-40">Porsi</span></p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Nutrisi</p>
              <p className="text-2xl font-black text-foreground">600 <span className="text-xs font-bold opacity-40">kcal</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <MapPin className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Zona Layanan</p>
              <p className="text-2xl font-black text-foreground">Menteng A</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
              <LayoutDashboard className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Sekolah</p>
              <p className="text-2xl font-black text-foreground">{activeDay.schools.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* 3. Left Column - Weekly Calendar Strip */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-border shadow-sm bg-card rounded-[32px] overflow-hidden">
            <CardHeader className="p-6 border-b border-border/50">
              <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">Minggu Ini</CardTitle>
              <CardDescription className="font-bold text-foreground">16 - 21 Maret 2026</CardDescription>
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
                          : "hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "size-10 rounded-xl flex flex-col items-center justify-center font-black text-[10px] uppercase",
                          isActive ? "bg-white/20" : "bg-muted text-muted-foreground group-hover:bg-white"
                        )}>
                          <span>{day.dayName.substring(0, 3)}</span>
                          <span className="text-xs leading-none mt-0.5">{day.date.split(' ')[0]}</span>
                        </div>
                        <div>
                          <p className={cn("text-sm font-black", isActive ? "text-white" : "text-foreground")}>{day.dayName}, {day.date}</p>
                          <p className={cn("text-[10px] font-bold opacity-70", isActive ? "text-white" : "text-muted-foreground")}>
                            {day.status}
                          </p>
                        </div>
                      </div>
                      {day.status === "Planned" && <CheckCircle className="size-4 text-emerald-400" />}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Right Column - Plan Detail */}
        <div className="lg:col-span-7 space-y-6">
          {activeDay.status === "Planned" ? (
            <Card className="border-border shadow-sm bg-card rounded-[32px] overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ChefHat className="size-4 text-primary" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rencana Menu Anda</span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground leading-tight">
                      {activeDay.menuName}
                    </h2>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="rounded-full text-[10px] font-bold border-border bg-emerald-50 text-emerald-700">610 kcal (Optimal)</Badge>
                      <Badge variant="outline" className="rounded-full text-[10px] font-bold border-border bg-primary/5 text-primary">High Protein</Badge>
                    </div>
                  </div>
                  <Link href="/portal/menu">
                    <Button variant="outline" className="rounded-full font-bold gap-2">
                      Ubah Menu
                      <ChevronRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-sm bg-card rounded-[32px] overflow-hidden border-dashed border-2">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="size-20 bg-muted rounded-full flex items-center justify-center">
                  <Utensils className="size-10 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-foreground">Belum Ada Rencana Menu</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Anda belum menyusun menu untuk hari ini. Silakan buat rencana menu untuk memenuhi target nutrisi zona.
                  </p>
                </div>
                <Link href="/portal/menu">
                  <Button className="rounded-full px-8 font-black gap-2 h-12">
                    <ChefHat className="size-5" />
                    Mulai Susun Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Target Schools Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Navigation className="size-4 text-primary" />
                Sekolah Dalam Zona
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDay.schools.map((school, sIdx) => (
                <Card key={sIdx} className="border-border shadow-sm bg-card rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-black text-foreground">{school.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[200px]">{school.address}</p>
                      </div>
                      <Badge className="bg-muted text-muted-foreground border-none font-bold text-[10px]">{school.portions} Porsi</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3" />
                        {school.time} WIB
                      </div>
                      <div className="flex items-center gap-1.5 text-primary">
                        <Truck className="size-3" />
                        {school.distance}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Link href="/portal/operasional/kalkulasi-bahan">
              <Button className="w-full h-16 rounded-[24px] font-black text-base shadow-xl shadow-primary/20 gap-3 group">
                Lanjutkan ke Kalkulasi Logistik
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}
