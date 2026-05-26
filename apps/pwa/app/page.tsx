"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { UserRole } from "@workspace/common/types";
import { PageHeader } from "@/components/layout/page-header";
import { mockVendor } from "@/lib/mock-data/vendor";
import { mockOrders } from "@/lib/mock-data/orders";
import { mockPublicStats } from "@/lib/mock-data/public-stats";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  ClipboardList,
  Calendar,
  Phone,
  AlertCircle,
  TrendingUp,
  Package,
  School,
  Globe,
  ChevronRight,
  Truck,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Database,
} from "lucide-react";
import Link from "next/link";

export default function RootPage() {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!user) return null;

  switch (user.role) {
    case UserRole.VENDOR:
      return <VendorHome />;
    case UserRole.SUPPLIER:
      return <SupplierHome />;
    case UserRole.COORDINATOR_SPPG:
      return <SchoolHome />;
    case UserRole.PUBLIC:
      return <PublicHome />;
    default:
      return <PublicHome />;
  }
}

function VendorHome() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Vendor Dashboard" />
      <div className="p-4 space-y-4">
        <section>
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            Selamat pagi, {mockVendor.name.split(" ")[3]} 👋
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {mockVendor.location}
          </p>
        </section>

        <Card className="bg-green-600 text-white border-none shadow-lg shadow-green-100 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 bg-white/10 h-24 w-24 rounded-full blur-2xl"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100 text-[10px] font-bold uppercase tracking-widest">
                  Compliance Minggu Ini
                </p>
                <h3 className="text-4xl font-black mt-1">
                  {mockVendor.weeklyCompliance}%
                </h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-none font-bold"
              >
                Level: Platinum 🎉
              </Badge>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-2 gap-3">
          <Link href="/operasional/live" className="block">
            <Button
              variant="outline"
              className="w-full h-28 flex flex-col gap-2 border-slate-200 shadow-sm bg-white rounded-2xl active:scale-95 transition-transform"
            >
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                Mulai Checkpoint
              </span>
            </Button>
          </Link>
          <Link href="/operasional/score" className="block">
            <Button
              variant="outline"
              className="w-full h-28 flex flex-col gap-2 border-slate-200 shadow-sm bg-white rounded-2xl active:scale-95 transition-transform"
            >
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                Lihat Skor
              </span>
            </Button>
          </Link>
        </section>

        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Menu Makan Siang</h3>
            <Badge variant="outline" className="text-[10px] border-slate-200">
              180 Porsi
            </Badge>
          </div>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4 flex gap-4">
              <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
                🍱
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">
                  {mockVendor.todayMenu}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    650 kkal
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    High Protein
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3 pb-8">
          <h3 className="font-bold text-slate-900">Updates</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold">
                CP2 belum diverifikasi oleh AI (Proses Masak)
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SupplierHome() {
  const newOrders = mockOrders.filter((o) => o.status === "new");
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Supplier Portal" />
      <div className="p-4 space-y-4">
        <section>
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            Halo, PT Berkah Jaya 👋
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Monitoring pengiriman hari ini
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-sm bg-blue-600 text-white rounded-2xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                Pesanan Baru
              </p>
              <h3 className="text-3xl font-black mt-1">{newOrders.length}</h3>
              <p className="text-[10px] font-medium mt-1">Butuh Konfirmasi</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-slate-100 text-slate-900 rounded-2xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Total Invoice
              </p>
              <h3 className="text-3xl font-black mt-1">12</h3>
              <p className="text-[10px] font-medium text-slate-500 mt-1">
                Bulan Maret
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Pengiriman Mendatang</h3>
            <Link href="/orders" className="text-xs text-blue-600 font-bold">
              Lihat Semua
            </Link>
          </div>
          {mockOrders.slice(0, 2).map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="border-none shadow-sm bg-white rounded-2xl mb-2">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {order.vendorName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {order.items[0]?.name} • {order.items[0]?.qty}kg
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

function SchoolHome() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Sekolah Dashboard" />
      <div className="p-4 space-y-6">
        <section>
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            SDN 01 Pontianak
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Penerimaan Makan Siang
          </p>
        </section>

        <Link href="/sekolah/confirm" className="block">
          <Button className="w-full h-24 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-between px-6 shadow-xl active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-2xl">
                <QrCode className="h-8 w-8" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Siap Scan?
                </p>
                <p className="text-xl font-black">Konfirmasi Terima</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-500" />
          </Button>
        </Link>

        <section className="space-y-3">
          <h3 className="font-bold text-slate-900">Status Hari Ini</h3>
          <Card className="border-blue-100 bg-blue-50/30 rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Vendor Sedang Menuju Lokasi
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Estimasi Tiba: 10:45 WIB
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function PublicHome() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="MBG Indonesia" showNotifications={false} />
      <div className="p-4 space-y-6">
        <section className="text-center space-y-3 py-6">
          <Badge className="bg-green-100 text-green-700 border-none font-bold px-3 py-1 uppercase tracking-widest text-[10px]">
            Program Strategis Nasional
          </Badge>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
            Membangun Generasi <span className="text-green-600">Emas 2045</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium px-4">
            Sistem verifikasi berbasis AI untuk memastikan setiap
            anak Indonesia mendapatkan nutrisi terbaik dengan standar keamanan
            tertinggi.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-slate-900 text-white border-none rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Globe className="h-32 w-32" />
            </div>
            <CardContent className="p-8 space-y-8 relative z-10">
              <div className="space-y-1">
                <p className="text-xs text-green-400 font-bold uppercase tracking-[0.2em]">
                  Siswa Terlayani
                </p>
                <h3 className="text-6xl font-black tracking-tighter tabular-nums">
                  285.400
                </h3>
                <p className="text-xs text-slate-400 font-medium italic">
                  Update real-time hari ini
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Sinergi SPPG
                  </p>
                  <p className="text-2xl font-black">19.188</p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    Dapur Terintegrasi
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Standar Mutu
                  </p>
                  <p className="text-2xl font-black text-green-400">100%</p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    Digitalized SOP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-none shadow-sm bg-white rounded-3xl p-4 flex flex-col items-center text-center space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Keamanan
              </p>
              <p className="text-xs font-bold text-slate-700">
                Verifikasi AI 24/7
              </p>
            </Card>
            <Card className="border-none shadow-sm bg-white rounded-3xl p-4 flex flex-col items-center text-center space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Database className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Audit
              </p>
              <p className="text-xs font-bold text-slate-700">
                Audit Trail
              </p>
            </Card>
          </div>

          <Link href="/publik">
            <Button className="w-full h-16 bg-green-600 hover:bg-green-700 text-white rounded-3xl font-black text-lg shadow-lg shadow-green-100 transition-all active:scale-95">
              Pantau Transparansi <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>

        <section className="pt-4 pb-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-black text-slate-900 tracking-tight">
              Live Impact Feed
            </h3>
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm items-center">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                🚚
              </div>
              <p className="text-xs font-medium text-slate-600">
                <span className="font-bold text-slate-900">
                  SDN 01 Pontianak
                </span>{" "}
                baru saja mengonfirmasi penerimaan 180 porsi.
              </p>
            </div>
            <div className="flex gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm items-center opacity-60">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                🍳
              </div>
              <p className="text-xs font-medium text-slate-600">
                <span className="font-bold text-slate-900">Dapur Bu Sari</span>{" "}
                memulai proses masak tahap CP2.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
