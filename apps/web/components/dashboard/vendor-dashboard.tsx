"use client"

import React from "react"
import { 
  CookingPot, 
  Users, 
  ShieldCheck, 
  Package, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Wallet,
  AlertTriangle
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"

export function VendorDashboard() {
  return (
    <div className="p-8 space-y-8 bg-white min-h-screen animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">DAPUR OPERASIONAL</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Monitor kepatuhan masak dan estimasi pencairan dana hari ini.</p>
        </div>
        <div className="flex gap-3">
          <div className="text-right px-4 py-2 bg-slate-50 rounded-2xl border">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Dapur</p>
            <p className="text-sm font-black text-emerald-600 flex items-center gap-1 justify-end">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" /> TERVERIFIKASI
            </p>
          </div>
        </div>
      </div>

      {/* Production & Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-indigo-600 rounded-[32px] text-white space-y-4 shadow-xl shadow-indigo-100">
          <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Estimasi Pendapatan Hari Ini</p>
            <h3 className="text-2xl font-black">Rp 12.450.000</h3>
            <p className="text-[10px] text-indigo-200 mt-1">*Berdasarkan porsi terverifikasi AI</p>
          </div>
        </div>

        {[
          { label: "Target Porsi", value: "850", sub: "Siswa Terdaftar", icon: Users, color: "blue" },
          { label: "Skor Gizi AI", value: "98/100", sub: "Memenuhi Juknis", icon: ShieldCheck, color: "emerald" },
          { label: "Stok Bahan", value: "82%", sub: "Ayam, Beras, Sayur", icon: Package, color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <div className={`size-10 bg-${stat.color}-50 flex items-center justify-center rounded-xl text-${stat.color}-600`}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              <p className="text-[10px] text-slate-400 italic mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkpoint Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Timeline Kepatuhan (Checkpoints)</h3>
              <Badge variant="outline" className="bg-white font-bold text-indigo-600 border-indigo-100">Hari Ini: Senin, 20 Mar</Badge>
            </div>
            
            <div className="grid grid-cols-4 gap-4 relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
              {[
                { id: "CP1", label: "Bahan Masuk", time: "04:00", status: "done" },
                { id: "CP2", label: "Proses Masak", time: "06:30", status: "done" },
                { id: "CP3", label: "Porsi Siap", time: "09:00", status: "current" },
                { id: "CP4", label: "Distribusi", time: "10:30", status: "waiting" },
              ].map((cp, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3 relative z-10">
                  <div className={cn(
                    "size-10 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm transition-all",
                    cp.status === 'done' ? "bg-emerald-500 text-white" : 
                    cp.status === 'current' ? "bg-indigo-600 text-white animate-pulse" : "bg-white text-slate-300"
                  )}>
                    {cp.status === 'done' ? <CheckCircle2 className="size-5" /> : <span className="text-xs font-black">{cp.id}</span>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase">{cp.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                      <Clock className="size-2" /> {cp.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Menu */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 text-sm uppercase">Menu Harian: Nasi Ayam Teriyaki</h3>
              <Button variant="ghost" size="sm" className="text-indigo-600 font-bold">Lihat Detail Resep</Button>
            </div>
            <div className="space-y-4">
              {[
                { name: "Daging Ayam Fillet", qty: "85 kg", source: "PT Tani Makmur" },
                { name: "Beras Premium", qty: "120 kg", source: "Supplier Lokal" },
                { name: "Sayur Brokoli & Wortel", qty: "40 kg", source: "PT Tani Makmur" },
              ].map((ing, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 font-bold text-xs">{i+1}</div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{ing.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{ing.source}</p>
                    </div>
                  </div>
                  <p className="font-black text-indigo-600 text-sm">{ing.qty}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <AlertTriangle className="size-20" />
            </div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <div className="size-2 bg-red-500 rounded-full animate-ping" /> Alert AI
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Anomali Foto CP2</p>
                <p className="text-xs text-slate-300 leading-relaxed">AI mendeteksi foto masakan blur. Ulangi upload untuk menghindari pengurangan skor harian.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Logistik</p>
                <p className="text-xs text-slate-400 leading-relaxed">Pengiriman gas LPG akan tiba pukul 14:00 WIB.</p>
              </div>
            </div>
            <Button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl h-12 shadow-xl shadow-indigo-950/50">
              Buka Panduan Juknis
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
