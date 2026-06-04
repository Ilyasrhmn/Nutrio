"use client"

import * as React from "react"
import { 
  Search, 
  HelpCircle,
  BookOpen,
  MessageSquare,
  FileText,
  Video,
  ChevronRight,
  PhoneCall,
  Mail,
  ExternalLink,
  LifeBuoy
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

export default function HelpCenterPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F0F3F7] animate-in fade-in duration-500 pb-12">
      
      {/* HEADER HERO */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 pt-16 pb-32 px-6 lg:px-12 overflow-hidden text-center flex flex-col items-center">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2000&auto=format&fit=crop')] mix-blend-overlay opacity-10 bg-cover bg-center pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <Badge className="bg-white/10 text-indigo-100 border border-white/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full w-fit mx-auto">
            <LifeBuoy className="size-3 mr-1.5 inline-block" /> Bantuan & Dukungan
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
            Halo, ada yang bisa kami bantu?
          </h1>
          <p className="text-indigo-200 font-medium text-sm md:text-base px-4">
            Cari panduan penggunaan, solusi kendala sistem, atau hubungi tim teknis Badan Gizi Nasional.
          </p>
          
          <div className="relative w-full max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-indigo-300" />
            <Input 
              className="pl-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-indigo-200 rounded-2xl h-14 text-base focus-visible:ring-white/30 shadow-2xl" 
              placeholder="Ketik topik bantuan... (Contoh: Lupa password, Klaim dana)" 
            />
            <Button size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold h-10 px-4">
              Cari
            </Button>
          </div>
        </div>
      </div>

      {/* QUICK CATEGORIES (Overlapping) */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 lg:px-12 -mt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 bg-white group cursor-pointer">
            <CardContent className="p-6 md:p-8 flex flex-col items-center text-center gap-4">
              <div className="size-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Buku Panduan</h3>
                <p className="text-sm text-slate-500 mt-1">Dokumentasi lengkap penggunaan portal BGN.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 bg-white group cursor-pointer">
            <CardContent className="p-6 md:p-8 flex flex-col items-center text-center gap-4">
              <div className="size-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Video className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Video Tutorial</h3>
                <p className="text-sm text-slate-500 mt-1">Langkah demi langkah dalam format video interaktif.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 bg-white group cursor-pointer">
            <CardContent className="p-6 md:p-8 flex flex-col items-center text-center gap-4">
              <div className="size-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <FileText className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Regulasi & Juknis</h3>
                <p className="text-sm text-slate-500 mt-1">Unduh SK dan Petunjuk Teknis Program MBG resmi.</p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* MAIN CONTENT DIVIDER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          
          {/* FAQ SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Pertanyaan Populer (FAQ)</h3>
              <p className="text-sm text-slate-500">Hal yang paling sering ditanyakan oleh Pengguna & Vendor.</p>
            </div>
            
            <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-2 md:p-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-slate-100 px-4">
                    <AccordionTrigger className="text-sm font-bold text-slate-800 hover:text-indigo-600 py-4 hover:no-underline">
                      Bagaimana cara mencairkan dana termin pertama?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                      Pencairan dana secara otomatis dijalankan melalui Smart Contract apabila vendor telah mengunggah minimal 5 log harian foto gizi yang telah tervalidasi oleh sistem AI. Status dapat dicek melalui menu Kelola Dana.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b border-slate-100 px-4">
                    <AccordionTrigger className="text-sm font-bold text-slate-800 hover:text-indigo-600 py-4 hover:no-underline">
                      Mengapa akun vendor saya diblokir sementara?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                      Pemblokiran sementara dilakukan oleh AI Compliance kami karena terdeteksinya anomali indikasi fraud (seperti foto berulang, atau penyimpangan GPS rute). Tim inspektorat akan melakukan peninjauan manual 1x24 jam.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-b border-slate-100 px-4">
                    <AccordionTrigger className="text-sm font-bold text-slate-800 hover:text-indigo-600 py-4 hover:no-underline">
                      Bagaimana jika aplikasi logistik mengalami down saat pengiriman?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                      Aplikasi Logistik Vendor kami dilengkapi fitur Offline-first. Anda tetap dapat memotret dan memindai barcode secara offline. Sistem akan melakukan sinkronisasi otomatis ke blockchain saat koneksi internet kembali stabil.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4" className="border-none px-4">
                    <AccordionTrigger className="text-sm font-bold text-slate-800 hover:text-indigo-600 py-4 hover:no-underline">
                      Apakah saya bisa mengganti kurir pengiriman terdaftar?
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                      Bisa. Silakan masuk ke menu Marketplace &gt; Profil Supplier &gt; Manajemen Kurir, lalu ajukan ID KTP kurir baru. Proses verifikasi biasanya memakan waktu maksimal 2 jam kerja.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* CONTACT SUPPORT */}
          <div className="space-y-6">
             <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Butuh Bantuan Langsung?</h3>
              <p className="text-sm text-slate-500">Hubungi tim Helpdesk kami.</p>
            </div>
            
            <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0 divide-y divide-slate-100">
                
                <div className="p-6 md:p-8 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                    <MessageSquare className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Live Chat BGN</h4>
                    <p className="text-xs text-slate-500 mt-1">Tim kami online Senin-Jumat, Pukul 08.00 - 16.00 WIB.</p>
                    <Button variant="link" className="p-0 h-auto text-indigo-600 font-bold text-xs mt-3">Mulai Chat <ChevronRight className="size-3 ml-1" /></Button>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <PhoneCall className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Call Center</h4>
                    <p className="text-xs text-slate-500 mt-1">Layanan darurat 24/7 bebas pulsa.</p>
                    <p className="font-black text-slate-900 text-lg tracking-tight mt-1">1500 - 021</p>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Email Ticketing</h4>
                    <p className="text-xs text-slate-500 mt-1">Kirim kendala teknis atau pengaduan secara tertulis.</p>
                    <p className="font-bold text-orange-600 text-xs mt-2">support@nutrio.go.id</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
