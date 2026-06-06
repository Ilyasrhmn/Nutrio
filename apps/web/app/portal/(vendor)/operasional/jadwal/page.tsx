"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Truck,
  Utensils,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  Navigation,
  Users,
  TrendingUp,
  LayoutDashboard,
  ChefHat,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

interface School {
  name: string;
  address: string;
  distance: string;
  time: string;
  stage: string;
  portions: number;
  status: "Disiapkan" | "Menunggu" | "Selesai" | "Dalam Perjalanan";
}

interface ScheduleDay {
  id: number;
  dayName: string;
  date: string;
  menuName: string;
  totalPortions: number;
  status: "Planned" | "Draft" | "No Plan";
  schools: School[];
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
        {
          name: "SDN Menteng 01",
          address: "Jl. Menteng Raya No.9",
          distance: "2.5 km",
          time: "07:30",
          stage: "Tahap 1",
          portions: 450,
          status: "Disiapkan",
        },
        {
          name: "SMPN 03 Jakarta",
          address: "Jl. Manggarai 1",
          distance: "4.1 km",
          time: "10:30",
          stage: "Tahap 3",
          portions: 200,
          status: "Menunggu",
        },
      ],
    },
    {
      id: 1,
      dayName: "Selasa",
      date: "17 Mar",
      menuName: "Paket A: Nasi Putih, Daging Rendang, Tumis Kacang Panjang",
      totalPortions: 650,
      status: "Planned",
      schools: [
        {
          name: "SDN Menteng 01",
          address: "Jl. Menteng Raya No.9",
          distance: "2.5 km",
          time: "07:30",
          stage: "Tahap 1",
          portions: 450,
          status: "Menunggu",
        },
        {
          name: "SMPN 03 Jakarta",
          address: "Jl. Manggarai 1",
          distance: "4.1 km",
          time: "10:30",
          stage: "Tahap 3",
          portions: 200,
          status: "Menunggu",
        },
      ],
    },
    {
      id: 2,
      dayName: "Rabu",
      date: "18 Mar",
      menuName: "Belum Ditentukan",
      totalPortions: 650,
      status: "Draft",
      schools: [
        {
          name: "SDN Menteng 01",
          address: "Jl. Menteng Raya No.9",
          distance: "2.5 km",
          time: "07:30",
          stage: "Tahap 1",
          portions: 450,
          status: "Menunggu",
        },
        {
          name: "SMPN 03 Jakarta",
          address: "Jl. Manggarai 1",
          distance: "4.1 km",
          time: "10:30",
          stage: "Tahap 3",
          portions: 200,
          status: "Menunggu",
        },
      ],
    },
    {
      id: 3,
      dayName: "Kamis",
      date: "19 Mar",
      menuName: "Belum Ditentukan",
      totalPortions: 650,
      status: "No Plan",
      schools: [
        {
          name: "SDN Menteng 01",
          address: "Jl. Menteng Raya No.9",
          distance: "2.5 km",
          time: "07:30",
          stage: "Tahap 1",
          portions: 450,
          status: "Menunggu",
        },
        {
          name: "SMPN 03 Jakarta",
          address: "Jl. Manggarai 1",
          distance: "4.1 km",
          time: "10:30",
          stage: "Tahap 3",
          portions: 200,
          status: "Menunggu",
        },
      ],
    },
    {
      id: 4,
      dayName: "Jumat",
      date: "20 Mar",
      menuName: "Belum Ditentukan",
      totalPortions: 650,
      status: "No Plan",
      schools: [
        {
          name: "SDN Menteng 01",
          address: "Jl. Menteng Raya No.9",
          distance: "2.5 km",
          time: "07:30",
          stage: "Tahap 1",
          portions: 450,
          status: "Menunggu",
        },
        {
          name: "SMPN 03 Jakarta",
          address: "Jl. Manggarai 1",
          distance: "4.1 km",
          time: "10:30",
          stage: "Tahap 3",
          portions: 200,
          status: "Menunggu",
        },
      ],
    },
  ];

  const [activeDayIdx, setActiveDayIdx] = React.useState(0);
  const activeDay = scheduleData[activeDayIdx] ?? scheduleData[0]!;

  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* 1. Deep Teal Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CalendarDays className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Active Planning
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Kalender Perencanaan SPPG</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Kelola perencanaan menu harian dan pantau target demand zona pengiriman MBG Anda.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Demand Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <CardContent className="p-6 md:p-8 flex items-center gap-4">
            <div className="size-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Target Demand
              </p>
              <p className="text-2xl font-black text-slate-900">
                {activeDay?.totalPortions}{" "}
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Porsi</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <CardContent className="p-6 md:p-8 flex items-center gap-4">
            <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Target Nutrisi
              </p>
              <p className="text-2xl font-black text-slate-900">
                600 <span className="text-xs font-bold opacity-40 uppercase tracking-widest">kcal</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <CardContent className="p-6 md:p-8 flex items-center gap-4">
            <div className="size-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
              <MapPin className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Zona Layanan
              </p>
              <p className="text-2xl font-black text-slate-900">Menteng</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <CardContent className="p-6 md:p-8 flex items-center gap-4">
            <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
              <LayoutDashboard className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Total Sekolah
              </p>
              <p className="text-2xl font-black text-slate-900">
                {activeDay.schools.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 3. Left Column - Weekly Calendar Strip */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Minggu Ini
              </CardTitle>
              <CardDescription className="font-extrabold text-slate-900 text-base mt-1">
                16 - 21 Maret 2026
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {scheduleData.map((day, idx) => {
                  const isActive = activeDayIdx === idx;
                  return (
                    <button
                      key={day.id}
                      onClick={() => setActiveDayIdx(idx)}
                      className={cn(
                        "w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group text-left border border-transparent",
                        isActive
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/20 scale-[1.02]"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:border-slate-200",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "size-12 rounded-xl flex flex-col items-center justify-center font-black text-xs uppercase shadow-sm",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-white text-slate-500 group-hover:text-teal-700",
                          )}
                        >
                          <span>{day.dayName.substring(0, 3)}</span>
                          <span className="text-[10px] font-bold mt-1">
                            {day.date.split(" ")[0]}
                          </span>
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-sm font-bold",
                              isActive ? "text-white" : "text-slate-900",
                            )}
                          >
                            {day.dayName}, {day.date}
                          </p>
                          <p
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest mt-1",
                              isActive ? "text-teal-200" : "text-slate-400",
                            )}
                          >
                            {day.status}
                          </p>
                        </div>
                      </div>
                      {day.status === "Planned" && (
                        <CheckCircle2 className={cn("size-5", isActive ? "text-teal-200" : "text-emerald-500")} />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Right Column - Plan Detail */}
        <div className="lg:col-span-8 space-y-8">
          {activeDay.status === "Planned" ? (
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200/60 border-l-4 border-l-teal-500">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ChefHat className="size-4 text-teal-600" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Rencana Menu Anda
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                      {activeDay.menuName}
                    </h2>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-md text-[10px] font-bold border-none bg-emerald-50 text-emerald-700 px-2 py-1 uppercase tracking-widest"
                      >
                        610 kcal (Optimal)
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-md text-[10px] font-bold border-none bg-teal-50 text-teal-700 px-2 py-1 uppercase tracking-widest"
                      >
                        High Protein
                      </Badge>
                    </div>
                  </div>
                  <Link href="/portal/menu">
                    <Button
                      variant="outline"
                      className="rounded-xl font-bold gap-2 h-12 px-6 border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Ubah Menu
                      <ChevronRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 shadow-sm bg-slate-50 rounded-2xl overflow-hidden border-dashed border-slate-300">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="size-24 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center">
                  <Utensils className="size-10 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">
                    Belum Ada Rencana Menu
                  </h3>
                  <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Anda belum menyusun menu untuk hari ini. Silakan buat
                    rencana menu untuk memenuhi target nutrisi zona.
                  </p>
                </div>
                <Link href="/portal/menu">
                  <Button className="rounded-xl px-8 font-bold gap-2 h-14 bg-teal-600 hover:bg-teal-700 shadow-md">
                    <ChefHat className="size-5" />
                    Mulai Susun Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Target Schools Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Navigation className="size-4 text-teal-600" />
                Sekolah Dalam Zona
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeDay.schools.map((school, sIdx) => (
                <Card
                  key={sIdx}
                  className="border-none ring-1 ring-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden hover:ring-2 hover:ring-teal-500/50 transition-all group"
                >
                  <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                          {school.name}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 truncate max-w-[200px]">
                          {school.address}
                        </p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] px-2 py-1 rounded-lg">
                        {school.portions} Porsi
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Clock className="size-3.5 text-slate-400" />
                        {school.time} WIB
                      </div>
                      <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-2 py-1 rounded-md">
                        <Truck className="size-3.5 text-teal-500" />
                        {school.distance}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <Link href="/portal/operasional/kalkulasi-bahan">
              <Button className="w-full h-16 rounded-2xl font-bold text-base shadow-lg bg-teal-900 hover:bg-teal-950 text-white gap-3 group transition-all">
                Lanjutkan ke Kalkulasi Logistik
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
