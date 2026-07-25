"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Utensils,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  Users,
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
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state";
import { deliveryService, WeekScheduleDay } from "@/lib/services/delivery.service";
import { toQueryError } from "@/lib/services/error-handler";

const STATUS_LABEL: Record<string, string> = {
  generated: "Menunggu",
  arrived: "Tiba di Sekolah",
  used: "Selesai",
  expired: "Kedaluwarsa",
};

export default function JadwalDistribusiPage() {
  const [days, setDays] = React.useState<WeekScheduleDay[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null);
  const [activeDayIdx, setActiveDayIdx] = React.useState(0);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await deliveryService.getMyWeekSchedule();
      setDays(res.days);
      const todayIdx = res.days.findIndex((d) => d.isToday);
      if (todayIdx >= 0) setActiveDayIdx(todayIdx);
    } catch (error) {
      setLoadError(toQueryError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const activeDay = days[activeDayIdx];

  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">

      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CalendarDays className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative p-8">
          <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Minggu Ini
          </Badge>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-3">Jadwal Pengantaran</h1>
          <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed mt-1">
            Token pengiriman minggu ini per sekolah, dari data checkpoint CP3/CP4.
          </p>
        </div>
      </div>

      <QueryState
        status={loadError ? loadError.status : loading ? "loading" : "success"}
        errorMessage={loadError?.errorMessage}
        isNetworkError={loadError?.isNetworkError}
        onRetry={load}
      >
        {activeDay && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                <Users className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Porsi (SPPG)</p>
                <p className="text-2xl font-black text-slate-900">
                  {activeDay.totalPorsi} <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Porsi</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                <MapPin className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sekolah Ditugaskan</p>
                <p className="text-2xl font-black text-slate-900">{activeDay.assignedSchools.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                <LayoutDashboard className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Token Terbit Hari Ini</p>
                <p className="text-2xl font-black text-slate-900">{activeDay.schools.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
              <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">7 Hari</CardTitle>
                <CardDescription className="font-extrabold text-slate-900 text-base mt-1">
                  {days[0]?.date} - {days[6]?.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {days.map((day, idx) => {
                    const isActive = activeDayIdx === idx;
                    return (
                      <button
                        key={day.date}
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
                              isActive ? "bg-white/20 text-white" : "bg-white text-slate-500 group-hover:text-teal-700",
                            )}
                          >
                            <span>{day.dayName.substring(0, 3)}</span>
                            <span className="text-[10px] font-bold mt-1">{day.dayNum}</span>
                          </div>
                          <div>
                            <p className={cn("text-sm font-bold", isActive ? "text-white" : "text-slate-900")}>
                              {day.dayName}{day.isToday ? " (Hari Ini)" : ""}
                            </p>
                            <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", isActive ? "text-teal-200" : "text-slate-400")}>
                              {day.hasData ? `${day.schools.length} token` : "Belum ada token"}
                            </p>
                          </div>
                        </div>
                        {day.hasData && (
                          <CheckCircle2 className={cn("size-5", isActive ? "text-teal-200" : "text-emerald-500")} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {!activeDay.hasData ? (
              <Card className="border-2 shadow-sm bg-slate-50 rounded-2xl overflow-hidden border-dashed border-slate-300">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="size-24 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center">
                    <Utensils className="size-10 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">Belum Ada Token Pengiriman</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Token pengiriman dibuat otomatis setelah checkpoint CP3 (Siap Kirim) selesai hari itu.
                    </p>
                  </div>
                  <Link href="/portal/operasional/kalkulasi-bahan">
                    <Button className="rounded-xl px-8 font-bold gap-2 h-14 bg-teal-600 hover:bg-teal-700 shadow-md">
                      <ChefHat className="size-5" />
                      Susun Rencana Menu
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="size-4 text-teal-600" />
                    Token Pengiriman
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeDay.schools.map((school, sIdx) => (
                    <Card key={sIdx} className="border-none ring-1 ring-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
                      <CardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1.5">
                            <h4 className="font-extrabold text-slate-900 text-base">{school.schoolId}</h4>
                          </div>
                          <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] px-2 py-1 rounded-lg">
                            {school.porsiCount} Porsi
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest pt-4 border-t border-slate-50">
                          <Badge className={cn(
                            "border-none px-2 py-1 rounded-md",
                            school.status === 'used' ? "bg-emerald-50 text-emerald-700" :
                            school.status === 'arrived' ? "bg-blue-50 text-blue-700" :
                            school.status === 'expired' ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                          )}>
                            {STATUS_LABEL[school.status] ?? school.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

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
        </>
        )}
      </QueryState>
    </div>
  );
}
