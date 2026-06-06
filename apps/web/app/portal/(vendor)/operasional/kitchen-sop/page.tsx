"use client"

import * as React from "react"
import {
  Printer,
  Clock,
  ChefHat,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Timer
} from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

interface Task {
  time: string
  instruction: string
  details: string
  isUrgent?: boolean
  completed?: boolean
}

export default function KitchenSopPage() {
  const [tasks, setTasks] = React.useState<Task[]>([
    {
      time: "02:00 WIB",
      instruction: "Persiapan Bahan Mentah (Food Prep)",
      details: "Cuci dan potong dadu 20 Kg Ayam Fillet. Kupas dan potong 5 Kg Wortel.",
      isUrgent: true,
      completed: true
    },
    {
      time: "02:30 WIB",
      instruction: "Memasak Karbohidrat",
      details: "Cuci bersih 45 Kg Beras. Masak merata ke dalam 3 rice cooker kapasitas besar (15 Kg/alat).",
      completed: false
    },
    {
      time: "03:30 WIB",
      instruction: "Memasak Lauk Utama & Sayur",
      details: "Tumis bumbu Ayam Teriyaki, pastikan matang sempurna. Rebus kuah kaldu untuk Sayur Sop.",
      completed: false
    },
    {
      time: "05:00 WIB",
      instruction: "Pemorsian & Quality Control",
      details: "Siapkan 450 kotak ompreng bersih. Masukkan nasi, lauk, dan sayur sesuai takaran. Tutup rapat.",
      isUrgent: true,
      completed: false
    },
    {
      time: "07:00 WIB",
      instruction: "Serah Terima Logistik (Dispatch)",
      details: "Pindahkan 450 kotak ke dalam kontainer termal. Naikkan ke armada pengiriman menuju SDN Menteng 01.",
      completed: false
    }
  ])

  const toggleTask = (index: number) => {
    const newTasks = [...tasks]
    if (newTasks[index]) {
      newTasks[index].completed = !newTasks[index].completed
      setTasks(newTasks)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* 1. Deep Teal Hero Banner (Screen Only) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 shadow-lg border border-teal-700/50 print:hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ChefHat className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse mr-2 inline-block" /> Live Production
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Standar Operasional Dapur</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Panduan langkah demi langkah untuk tim produksi dapur. Gunakan tampilan ini sebagai Kitchen Display System (KDS) atau cetak sebagai panduan fisik.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 w-full sm:w-auto">
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mb-1">Progress Produksi</p>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-sm font-black text-white">{progressPercent}%</span>
              </div>
            </div>
            <Button
              onClick={handlePrint}
              className="w-full sm:w-auto rounded-xl h-14 px-6 font-bold shadow-md bg-white text-teal-900 hover:bg-teal-50 gap-2 transition-all"
            >
              <Printer className="size-5" />
              Cetak Dokumen
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Bento Box Production Info (Screen Only) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <Card className="bg-white border-none shadow-sm rounded-2xl ring-1 ring-slate-200/60 flex items-center p-6 gap-5">
          <div className="size-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100 shrink-0">
            <ClipboardList className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Target Hari Ini</p>
            <p className="text-2xl font-black text-slate-900">450 <span className="text-sm font-bold opacity-50 uppercase tracking-widest ml-1">Porsi</span></p>
          </div>
        </Card>
        
        <Card className="bg-white border-none shadow-sm rounded-2xl ring-1 ring-slate-200/60 flex items-center p-6 gap-5">
          <div className="size-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 shrink-0">
            <ChefHat className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Paket Menu (C)</p>
            <p className="text-sm font-black text-slate-900 leading-tight">Ayam Teriyaki, Sayur Sop, Susu UHT</p>
          </div>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-2xl ring-1 ring-slate-200/60 flex items-center p-6 gap-5">
          <div className="size-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
            <Timer className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Tenggat Pengiriman</p>
            <p className="text-2xl font-black text-slate-900">07:30 <span className="text-sm font-bold opacity-50 uppercase tracking-widest ml-1">WIB</span></p>
          </div>
        </Card>
      </div>

      {/* 3. Interactive Task Board (Screen Only) */}
      <div className="space-y-4 print:hidden">
        <h3 className="text-lg font-black text-slate-900 px-2 flex items-center gap-2">
          <PlayCircle className="size-5 text-teal-600" />
          Timeline Eksekusi
        </h3>
        
        <div className="grid gap-4">
          {tasks.map((task, index) => (
            <div 
              key={index}
              onClick={() => toggleTask(index)}
              className={cn(
                "group relative overflow-hidden bg-white border-none shadow-sm ring-1 ring-slate-200/60 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-0.5",
                task.completed ? "ring-emerald-500/50 bg-emerald-50/30" : "hover:ring-teal-500/30"
              )}
            >
              {/* Highlight strip for urgent */}
              {task.isUrgent && !task.completed && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500" />
              )}
              {task.completed && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
              )}

              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Time & Status Column */}
                <div className="flex items-center gap-4 md:w-48 shrink-0">
                  <div className={cn(
                    "size-12 rounded-xl flex items-center justify-center border-2 transition-colors shrink-0 shadow-sm",
                    task.completed 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "bg-slate-50 border-slate-200 text-slate-300 group-hover:border-teal-500/50"
                  )}>
                    {task.completed ? <CheckCircle2 className="size-6" /> : <Clock className="size-5" />}
                  </div>
                  <div>
                    <p className={cn(
                      "text-2xl font-black tabular-nums tracking-tighter",
                      task.completed ? "text-emerald-700" : task.isUrgent ? "text-red-600" : "text-slate-900"
                    )}>
                      {task.time.split(' ')[0]}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WIB</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className={cn(
                      "text-lg font-bold tracking-tight transition-colors",
                      task.completed ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900"
                    )}>
                      {task.instruction}
                    </h4>
                    {task.isUrgent && !task.completed && (
                      <Badge className="bg-red-50 text-red-700 border border-red-200 font-bold text-[10px] uppercase tracking-widest shadow-sm">
                        <AlertTriangle className="size-3 mr-1" />
                        Critical
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    "text-sm font-medium leading-relaxed max-w-3xl",
                    task.completed ? "text-slate-400" : "text-slate-600"
                  )}>
                    {task.details}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PRINT VIEW LAYOUT ================= */}
      {/* This section only appears when printing to keep the printed page clean and ink-friendly */}
      <div className="hidden print:block bg-white p-8">
        <div className="border-b-4 border-black pb-6 mb-8 flex justify-between items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] mb-2 text-gray-500">
              Nutrio - Kitchen Work Order
            </p>
            <h2 className="text-5xl font-black tracking-tighter">
              450 <span className="text-2xl font-bold uppercase tracking-widest ml-1 text-gray-600">Porsi</span>
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xl font-black">Senin, 16 Maret 2026</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">ID PRODUKSI: #MBG-99210</p>
          </div>
        </div>

        <div className="bg-gray-100 p-6 rounded-xl mb-10 border border-gray-300">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1">Paket Menu Hari Ini</p>
          <h3 className="text-2xl font-black">Paket C: Nasi Putih, Ayam Teriyaki, Sayur Sop, Susu UHT</h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b-2 border-black pb-3 w-32 font-bold uppercase tracking-widest text-xs">Waktu</th>
              <th className="border-b-2 border-black pb-3 w-16 font-bold uppercase tracking-widest text-xs text-center">Cek</th>
              <th className="border-b-2 border-black pb-3 font-bold uppercase tracking-widest text-xs">Instruksi & Detail</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="py-6 align-top">
                  <p className="text-2xl font-black tabular-nums">{task.time.split(' ')[0]}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase">WIB</p>
                </td>
                <td className="py-6 align-top text-center">
                  <div className="size-8 border-2 border-gray-400 rounded-md mx-auto" />
                </td>
                <td className="py-6 align-top">
                  <p className="text-lg font-bold mb-1">
                    {task.instruction}
                    {task.isUrgent && <span className="ml-3 text-xs border border-black px-2 py-0.5 uppercase tracking-widest font-black">Urgent</span>}
                  </p>
                  <p className="text-gray-700">{task.details}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-20 pt-10 grid grid-cols-3 gap-10">
          <div className="text-center space-y-16">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Koki Utama</p>
            <div className="border-b-2 border-gray-400 border-dashed w-full" />
          </div>
          <div className="text-center space-y-16">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Pengawas Gizi</p>
            <div className="border-b-2 border-gray-400 border-dashed w-full" />
          </div>
          <div className="text-center space-y-16">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Pemilik/Vendor</p>
            <div className="border-b-2 border-gray-400 border-dashed w-full" />
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Dokumen dihasilkan secara otomatis oleh sistem Nutrio - Badan Gizi Nasional
          </p>
        </div>
      </div>

    </div>
  )
}
