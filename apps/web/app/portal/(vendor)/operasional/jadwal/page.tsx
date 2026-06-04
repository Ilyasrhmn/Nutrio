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
  LayoutDashboard,
  ChefHat,
  Loader2,
  CheckCircle2,
  Package,
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

interface SchoolDelivery {
  schoolId: string;
  porsiCount: number;
  status: string;
  arrivedAt: string | null;
  completedAt: string | null;
}

interface DaySchedule {
  date: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
  totalPorsi: number;
  hasData: boolean;
  schools: SchoolDelivery[];
  assignedSchools: string[];
}

const STATUS_META: Record<string, { label: string; cn: string }> = {
  active: { label: "Belum Berangkat", cn: "bg-slate-100 text-slate-600" },
  in_progress: { label: "Dalam Perjalanan", cn: "bg-blue-100 text-blue-700" },
  waiting_school_confirm: { label: "Menunggu Konfirmasi", cn: "bg-amber-100 text-amber-700" },
  used: { label: "Selesai", cn: "bg-emerald-100 text-emerald-700" },
  expired: { label: "Kedaluwarsa", cn: "bg-red-100 text-red-700" },
}

function fmtTime(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export default function JadwalDistribusiPage() {
  const [days, setDays] = React.useState<DaySchedule[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeDayIdx, setActiveDayIdx] = React.useState(0)

  React.useEffect(() => {
    import("@/lib/api-client").then(({ api }) => {
      api.get<{ days: DaySchedule[] }>("/delivery/my/week-schedule")
        .then((res) => {
          if (res?.days?.length) {
            setDays(res.days)
            const todayIdx = res.days.findIndex((d) => d.isToday)
            if (todayIdx >= 0) setActiveDayIdx(todayIdx)
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    })
  }, [])

  const activeDay = days[activeDayIdx]

  const schoolDisplay = (school: SchoolDelivery) =>
    school.schoolId.length > 24
      ? school.schoolId.substring(0, 22) + "…"
      : school.schoolId

  const assignedDisplay = (ids: string[]) =>
    ids.map((id) => (id.length > 24 ? id.substring(0, 22) + "…" : id))

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-background">
      {/* Header */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Demand</p>
              <p className="text-2xl font-black text-foreground">
                {loading ? "—" : (activeDay?.totalPorsi ?? 0)}{" "}
                <span className="text-xs font-bold opacity-40">Porsi</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Package className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pengiriman Hari Ini</p>
              <p className="text-2xl font-black text-foreground">
                {loading ? "—" : (days.find(d => d.isToday)?.schools.length ?? 0)}{" "}
                <span className="text-xs font-bold opacity-40">Token</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <MapPin className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Selesai Hari Ini</p>
              <p className="text-2xl font-black text-foreground">
                {loading ? "—" : (days.find(d => d.isToday)?.schools.filter(s => s.status === "used").length ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
              <LayoutDashboard className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sekolah Ditugaskan</p>
              <p className="text-2xl font-black text-foreground">
                {loading ? "—" : (activeDay?.assignedSchools.length ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="size-8 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Left: Weekly Calendar */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-border shadow-sm bg-card rounded-[32px] overflow-hidden">
              <CardHeader className="p-6 border-b border-border/50">
                <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">Minggu Ini</CardTitle>
                <CardDescription className="font-bold text-foreground">
                  {days.length > 0
                    ? `${days[0]?.dayNum} – ${days[6]?.dayNum} ${new Date(days[0]?.date ?? "").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`
                    : "Minggu Ini"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {days.map((day, idx) => {
                    const isActive = activeDayIdx === idx
                    const hasDone = day.schools.some(s => s.status === "used")
                    const hasActive = day.schools.some(s => s.status === "active" || s.status === "in_progress")
                    return (
                      <button
                        key={day.date}
                        onClick={() => setActiveDayIdx(idx)}
                        className={cn(
                          "w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group text-left",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]"
                            : "hover:bg-muted/50 text-muted-foreground",
                          day.isToday && !isActive && "border border-primary/20"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "size-10 rounded-xl flex flex-col items-center justify-center font-black text-[10px] uppercase",
                            isActive ? "bg-white/20" : "bg-muted text-muted-foreground group-hover:bg-white",
                          )}>
                            <span>{day.dayName.substring(0, 3)}</span>
                            <span className="text-xs leading-none mt-0.5">{day.dayNum}</span>
                          </div>
                          <div>
                            <p className={cn("text-sm font-black", isActive ? "text-white" : "text-foreground")}>
                              {day.dayName}
                              {day.isToday && <span className="ml-1.5 text-[9px] font-black uppercase opacity-70">(Hari Ini)</span>}
                            </p>
                            <p className={cn("text-[10px] font-bold opacity-70", isActive ? "text-white" : "text-muted-foreground")}>
                              {day.hasData ? `${day.schools.length} pengiriman` : "Tidak ada data"}
                            </p>
                          </div>
                        </div>
                        {hasDone && <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />}
                        {!hasDone && hasActive && <Truck className="size-4 text-blue-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Day Detail */}
          <div className="lg:col-span-7 space-y-6">
            {activeDay?.hasData ? (
              <>
                <Card className="border-border shadow-sm bg-card rounded-[32px] overflow-hidden border-l-4 border-l-primary">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Truck className="size-4 text-primary" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Pengiriman {activeDay.dayName}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-foreground leading-tight">
                          {activeDay.schools.length} Token Aktif
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                          {activeDay.schools.filter(s => s.status === "used").length > 0 && (
                            <Badge variant="outline" className="rounded-full text-[10px] font-bold border-border bg-emerald-50 text-emerald-700">
                              {activeDay.schools.filter(s => s.status === "used").length} Selesai
                            </Badge>
                          )}
                          {activeDay.schools.filter(s => s.status === "in_progress").length > 0 && (
                            <Badge variant="outline" className="rounded-full text-[10px] font-bold border-border bg-blue-50 text-blue-700">
                              {activeDay.schools.filter(s => s.status === "in_progress").length} Dalam Perjalanan
                            </Badge>
                          )}
                          {activeDay.schools.filter(s => s.status === "active").length > 0 && (
                            <Badge variant="outline" className="rounded-full text-[10px] font-bold border-border bg-slate-50 text-slate-600">
                              {activeDay.schools.filter(s => s.status === "active").length} Belum Berangkat
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Link href="/portal/operasional/kalkulasi-bahan">
                        <Button variant="outline" className="rounded-full font-bold gap-2">
                          Kalkulasi Bahan
                          <ChevronRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                      <Navigation className="size-4 text-primary" />
                      Token Pengiriman
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeDay.schools.map((school, sIdx) => {
                      const meta = STATUS_META[school.status] ?? STATUS_META.active!
                      return (
                        <Card key={sIdx} className="border-border shadow-sm bg-card rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1 min-w-0">
                                <h4 className="font-black text-foreground truncate">{schoolDisplay(school)}</h4>
                                <p className="text-[10px] text-muted-foreground font-medium">ID Sekolah</p>
                              </div>
                              <Badge className={cn("border-none font-bold text-[10px] shrink-0 ml-2", meta.cn)}>
                                {school.porsiCount} Porsi
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Clock className="size-3" />
                                {school.arrivedAt ? fmtTime(school.arrivedAt) : "Belum tiba"}
                              </div>
                              <Badge className={cn("border-none font-bold text-[9px]", meta.cn)}>
                                {meta.label}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Card className="border-border shadow-sm bg-card rounded-[32px] overflow-hidden border-dashed border-2">
                  <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="size-20 bg-muted rounded-full flex items-center justify-center">
                      <Utensils className="size-10 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-foreground">Belum Ada Pengiriman</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Tidak ada token pengiriman untuk {activeDay?.dayName ?? "hari ini"}. Token dibuat otomatis setelah CP3 selesai.
                      </p>
                    </div>
                    <Link href="/portal/checkpoints">
                      <Button className="rounded-full px-8 font-black gap-2 h-12">
                        <ChefHat className="size-5" />
                        Ke Halaman Checkpoint
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {activeDay && activeDay.assignedSchools.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <Navigation className="size-4 text-primary" />
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Sekolah Dalam Zona</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignedDisplay(activeDay.assignedSchools).map((name, i) => (
                        <Card key={i} className="border-border shadow-sm bg-card rounded-2xl overflow-hidden">
                          <CardContent className="p-5 flex items-center gap-3">
                            <div className="size-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                              <MapPin className="size-4" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 truncate">{name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

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
      )}
    </div>
  );
}
