"use client"

import * as React from "react"
import { 
  Printer, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ClipboardList
} from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

interface Task {
  time: string
  instruction: string
  details: string
  isUrgent?: boolean
}

export default function KitchenSopPage() {
  const [tasks, setTasks] = React.useState<Task[]>([
    {
      time: "02:00 WIB",
      instruction: "Persiapan Bahan Mentah (Food Prep)",
      details: "Cuci dan potong dadu 20 Kg Ayam Fillet. Kupas dan potong 5 Kg Wortel.",
      isUrgent: true
    },
    {
      time: "02:30 WIB",
      instruction: "Memasak Karbohidrat",
      details: "Cuci bersih 45 Kg Beras. Masak merata ke dalam 3 rice cooker kapasitas besar (15 Kg/alat)."
    },
    {
      time: "03:30 WIB",
      instruction: "Memasak Lauk Utama & Sayur",
      details: "Tumis bumbu Ayam Teriyaki, pastikan matang sempurna. Rebus kuah kaldu untuk Sayur Sop."
    },
    {
      time: "05:00 WIB",
      instruction: "Pemorsian & Quality Control",
      details: "Siapkan 450 kotak ompreng bersih. Masukkan nasi, lauk, dan sayur sesuai takaran. Tutup rapat.",
      isUrgent: true
    },
    {
      time: "07:00 WIB",
      instruction: "Serah Terima Logistik (Dispatch)",
      details: "Pindahkan 450 kotak ke dalam kontainer termal. Naikkan ke armada pengiriman menuju SDN Menteng 01."
    }
  ])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-8 space-y-8 bg-[#FBFBFE] min-h-screen">
      {/* 1. Action Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="size-8 text-primary" />
            Lembar Kerja Dapur (SOP Harian)
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl text-sm">
            Instruksi teknis untuk tim masak. Cetak atau tampilkan di tablet dapur untuk koordinasi tim.
          </p>
        </div>
        
        <Button 
          size="lg" 
          onClick={handlePrint}
          className="rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/20 gap-3 active:scale-95 transition-all"
        >
          <Printer className="size-5" />
          Cetak Lembar Kerja (PDF)
        </Button>
      </div>

      {/* 2. Main Printable Document Area */}
      <Card className="max-w-5xl mx-auto border-none shadow-2xl bg-white rounded-[40px] overflow-hidden ring-1 ring-slate-100 print:shadow-none print:ring-0 print:rounded-none">
        <CardContent className="p-10 md:p-16 space-y-12">
          
          {/* 2A. Document Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-slate-900 pb-8">
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                VENDORTRACK - KITCHEN WORK ORDER
              </p>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
                450 <span className="text-3xl text-slate-400 uppercase tracking-normal">Porsi</span>
              </h2>
            </div>
            <div className="text-left md:text-right space-y-1">
              <Badge className="bg-slate-900 text-white font-black text-xs px-4 py-1.5 rounded-lg mb-2">TARGET UTAMA</Badge>
              <p className="text-xl font-black text-slate-900">Senin, 16 Maret 2026</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">ID PRODUKSI: #MBG-99210</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Paket Menu Hari Ini</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
              Paket C: Nasi Putih, Ayam Teriyaki, Sayur Sop, Susu UHT
            </h3>
          </div>

          {/* 2B. Timeline / Task Checklist */}
          <div className="space-y-0 border-t border-slate-100">
            {tasks.map((task, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex flex-col md:flex-row gap-6 md:gap-12 py-10 border-b border-slate-100 transition-colors group hover:bg-slate-50/50",
                  task.isUrgent && "bg-primary/[0.02]"
                )}
              >
                {/* Time Column */}
                <div className="md:w-40 shrink-0 space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="size-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Start Time</span>
                  </div>
                  <p className={cn(
                    "text-3xl font-black tabular-nums tracking-tighter",
                    task.isUrgent ? "text-primary" : "text-slate-900"
                  )}>
                    {task.time}
                  </p>
                </div>

                {/* Checkbox Column */}
                <div className="flex items-start pt-1.5">
                  <div className="p-1 rounded-xl bg-white border-2 border-slate-200 group-hover:border-primary transition-colors">
                    <Checkbox className="size-8 rounded-lg border-none data-[state=checked]:bg-primary" />
                  </div>
                </div>

                {/* Instruction Column */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                      {task.instruction}
                    </h4>
                    {task.isUrgent && (
                      <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] px-2 h-5">CRITICAL</Badge>
                    )}
                  </div>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-3xl">
                    {task.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 2C. Footer Signatures */}
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-12">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Disiapkan Oleh (Koki Utama)</p>
              <div className="border-b-2 border-slate-200 w-48 mx-auto" />
              <p className="text-xs font-bold text-slate-300 text-center uppercase tracking-tighter">Tanda Tangan & Nama Terang</p>
            </div>
            <div className="space-y-12">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Diperiksa Oleh (Pengawas Gizi)</p>
              <div className="border-b-2 border-slate-200 w-48 mx-auto" />
              <p className="text-xs font-bold text-slate-300 text-center uppercase tracking-tighter">Tanda Tangan & Nama Terang</p>
            </div>
            <div className="space-y-12">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Disetujui Oleh (Pemilik/Vendor)</p>
              <div className="border-b-2 border-slate-200 w-48 mx-auto" />
              <p className="text-xs font-bold text-slate-300 text-center uppercase tracking-tighter">Tanda Tangan & Nama Terang</p>
            </div>
          </div>

          {/* Print Only Notice */}
          <div className="hidden print:block text-center pt-8 border-t border-dashed border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">
              Dokumen ini dihasilkan secara otomatis oleh sistem VendorTrack - Badan Gizi Nasional (BGN)
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Quick Help (Hidden on Print) */}
      <div className="max-w-5xl mx-auto flex items-center gap-4 bg-primary/5 p-6 rounded-[24px] border border-primary/10 print:hidden">
        <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shrink-0">
          <ChefHat className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-primary uppercase tracking-widest">Tips Dapur</p>
          <p className="text-xs font-bold text-slate-600">
            Gunakan fitur checklist di atas melalui tablet untuk sinkronisasi otomatis ke dashboard BGN Regional.
          </p>
        </div>
      </div>
    </div>
  )
}
