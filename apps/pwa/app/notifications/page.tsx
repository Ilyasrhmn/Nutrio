"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { 
  Bell, Package, ClipboardList, CheckCircle2, 
  AlertTriangle, Truck, Info, ChevronLeft 
} from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "Bahan Mentah Tiba",
      message: "Supplier PT Berkah Jaya telah tiba di lokasi Vendor.",
      time: "10 menit yang lalu",
      icon: Truck,
      color: "bg-blue-100 text-blue-600",
      type: "supplier",
    },
    {
      id: 2,
      title: "CP3 Diverifikasi AI",
      message: "Hasil analisis foto Makanan Siap: Layak (Skor 92).",
      time: "1 jam yang lalu",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
      type: "checkpoint",
    },
    {
      id: 3,
      title: "Peringatan Higienitas",
      message: "Dapur Cabang B memerlukan pengecekan sanitasi ulang.",
      time: "2 jam yang lalu",
      icon: AlertTriangle,
      color: "bg-amber-100 text-amber-600",
      type: "alert",
    },
    {
      id: 4,
      title: "Pesanan Baru",
      message: "PO-2024-088 telah diterbitkan untuk Vendor Bu Sari.",
      time: "5 jam yang lalu",
      icon: Package,
      color: "bg-indigo-100 text-indigo-600",
      type: "order",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 h-16 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 text-slate-500">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">Notifikasi</h1>
      </div>

      <div className="p-4 space-y-3">
        {notifications.map((notif) => (
          <Card key={notif.id} className="border-none shadow-sm rounded-2xl overflow-hidden active:scale-[0.98] transition-all">
            <CardContent className="p-4 flex gap-4">
              <div className={`h-12 w-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${notif.color}`}>
                <notif.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-black text-slate-900">{notif.title}</h3>
                  <span className="text-[10px] font-bold text-slate-400">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="py-12 text-center space-y-2">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
             <Info className="h-8 w-8" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada notifikasi lama</p>
        </div>
      </div>
    </div>
  );
}
