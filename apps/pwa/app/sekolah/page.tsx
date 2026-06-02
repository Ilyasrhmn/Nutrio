import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { School, MapPin, Clock, Utensils, Calendar, ChevronRight, QrCode } from "lucide-react";
import Link from "next/link";

export default function SchoolDashboardPage() {
  const nextDelivery = {
    vendor: "Dapur Sehat Bu Sari",
    status: "Dalam Perjalanan",
    eta: "10:45 WIB",
    menu: "Nasi + Ayam Goreng + Sayur Bayam + Pisang",
    nutrition: { cal: 650, pro: "25g", fat: "15g" }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Portal Sekolah" />
      
      <div className="p-4 space-y-6">
        <section className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <School className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">SDN 01 Pontianak</h2>
            <p className="text-sm text-slate-500 font-medium">Kamis, 20 Maret 2026</p>
          </div>
        </section>

        <Link href="/sekolah/confirm" className="block">
          <Button className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-between px-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Kurir Sudah Tiba?</p>
                <p className="text-lg font-black">Scan QR Code</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-500" />
          </Button>
        </Link>

        <section className="space-y-3">
          <h3 className="font-bold text-slate-900">Pengiriman Hari Ini</h3>
          <Card className="border-blue-100 bg-blue-50/30">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] text-blue-700 font-bold uppercase">{nextDelivery.vendor}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <p className="font-bold text-slate-900">{nextDelivery.status}</p>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-white border-none font-bold">
                  ETA {nextDelivery.eta}
                </Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100">
                <Utensils className="h-5 w-5 text-blue-500" />
                <p className="text-xs font-bold text-slate-700">{nextDelivery.menu}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-2 rounded-lg text-center border border-blue-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Energi</p>
                  <p className="text-xs font-black text-slate-900">{nextDelivery.nutrition.cal} kkal</p>
                </div>
                <div className="bg-white p-2 rounded-lg text-center border border-blue-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Protein</p>
                  <p className="text-xs font-black text-slate-900">{nextDelivery.nutrition.pro}</p>
                </div>
                <div className="bg-white p-2 rounded-lg text-center border border-blue-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Lemak</p>
                  <p className="text-xs font-black text-slate-900">{nextDelivery.nutrition.fat}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3 pb-8">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Jadwal 5 Hari ke Depan</h3>
            <Calendar className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {[21, 22, 23, 24, 25].map((day, i) => (
              <div key={day} className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-colors ${i === 0 ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                <span className="text-[10px] font-bold uppercase">{['JUM', 'SAB', 'MIN', 'SEN', 'SEL'][i]}</span>
                <span className="text-lg font-black">{day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
