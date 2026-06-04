"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { 
  MapPin, 
  Search, 
  Download, 
  Users, 
  Utensils, 
  ChevronRight,
  Filter,
  Navigation,
  Globe,
  Map as MapIcon
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/dashboard/map-view"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 space-y-4 rounded-3xl border border-slate-100">
      <div className="size-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Memuat Peta Satelit...</p>
    </div>
  )
})

export default function MapDistributionPage() {
  const [activeVendor, setActiveVendor] = React.useState<number | null>(null)

  const vendors = [
    {
      id: 1,
      name: "Catering Ibu Budi",
      location: "Kec. Depok, Sleman",
      status: "Aman",
      variant: "success",
      capacity: "1.500 porsi/hari",
      lat: -7.7656, 
      lng: 110.3725,
      color: "#10b981" // emerald-500
    },
    {
      id: 2,
      name: "Dapur Nusantara",
      location: "Kec. Ngaglik, Sleman",
      status: "Aman",
      variant: "success",
      capacity: "2.400 porsi/hari",
      lat: -7.7336, 
      lng: 110.3925,
      color: "#10b981"
    },
    {
      id: 3,
      name: "Berkah Catering",
      location: "Kec. Mlati, Sleman",
      status: "Peringatan",
      variant: "warning",
      capacity: "1.200 porsi/hari",
      lat: -7.7416, 
      lng: 110.3525,
      color: "#f59e0b" // amber-500
    },
    {
      id: 4,
      name: "Sari Rasa Katering",
      location: "Kec. Gamping, Sleman",
      status: "Risiko Tinggi",
      variant: "destructive",
      capacity: "3.000 porsi/hari",
      lat: -7.7956, 
      lng: 110.3325,
      color: "#ef4444" // red-500
    },
    {
      id: 5,
      name: "Dapur Sehat Mandiri",
      location: "Kec. Kalasan, Sleman",
      status: "Aman",
      variant: "success",
      capacity: "1.800 porsi/hari",
      lat: -7.7616, 
      lng: 110.4525,
      color: "#10b981"
    },
    {
      id: 6,
      name: "Mitra Gizi Utama",
      location: "Kec. Seyegan, Sleman",
      status: "Aman",
      variant: "success",
      capacity: "2.100 porsi/hari",
      lat: -7.7356, 
      lng: 110.3025,
      color: "#10b981"
    }
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F0F3F7] animate-in fade-in duration-500 pb-6 flex flex-col relative">
      
      {/* VIBRANT MAP HERO SECTION */}
      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 pt-8 pb-32 px-6 lg:px-8 overflow-hidden shrink-0">
        {/* Abstract Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] mix-blend-overlay opacity-20 bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="relative z-10 w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge className="bg-white/10 text-cyan-50 border border-white/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                <Globe className="size-3" /> Live Global Tracking
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Peta Sebaran Mitra SPPG
              </h1>
              <p className="text-cyan-100 font-medium text-sm max-w-xl">
                Pemantauan spasial cakupan wilayah, kapasitas dapur umum, dan status risiko keamanan secara nasional.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select defaultValue="diy">
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white rounded-2xl h-11 shadow-inner font-semibold focus:ring-white/30">
                  <SelectValue placeholder="Pilih Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diy">DI Yogyakarta</SelectItem>
                  <SelectItem value="jabar">Jawa Barat</SelectItem>
                  <SelectItem value="jateng">Jawa Tengah</SelectItem>
                  <SelectItem value="jatim">Jawa Timur</SelectItem>
                  <SelectItem value="jakarta">DKI Jakarta</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-11 px-6 bg-white text-cyan-700 hover:bg-cyan-50 shadow-lg font-bold rounded-2xl gap-2 transition-transform active:scale-95">
                <Download className="size-4" />
                Export Peta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Overlapping Hero) */}
      <div className="relative z-20 w-full px-6 lg:px-8 -mt-20 flex-1 min-h-0 flex flex-col">
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
          
          {/* Left & Center Column - REAL Map Area */}
          <div className="lg:col-span-2 rounded-[24px] overflow-hidden border border-slate-200/60 bg-slate-100 relative shadow-xl shadow-cyan-900/10 h-full flex flex-col group">
            
            <div className="flex-1 relative z-0">
              {/* The Real Leaflet Map */}
              <MapView vendors={vendors} />
            </div>

            {/* Top-Left Search Overlay */}
            <div className="absolute top-6 left-6 w-80 z-10 pointer-events-none transition-transform group-hover:translate-y-1">
              <div className="relative pointer-events-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input 
                  className="pl-11 bg-white/95 backdrop-blur-xl border-white/50 shadow-lg shadow-black/5 rounded-2xl h-14 focus-visible:ring-primary/20 font-medium text-sm" 
                  placeholder="Cari lokasi mitra..." 
                />
              </div>
            </div>

            {/* Bottom-Right Legend Overlay */}
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-xl space-y-4 min-w-[180px] z-10 transition-transform group-hover:-translate-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <MapPin className="size-3" /> Legenda
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700">Aman</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3.5 rounded-full bg-amber-500 ring-4 ring-amber-50 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700">Peringatan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3.5 rounded-full bg-red-500 ring-4 ring-red-50 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700">Risiko Tinggi</span>
                </div>
              </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-3 z-10">
              <Button variant="outline" size="icon" className="rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border-white h-12 w-12 hover:bg-white text-slate-700">
                <Navigation className="size-5 text-cyan-600" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border-white h-12 w-12 hover:bg-white text-slate-700">
                <Filter className="size-5" />
              </Button>
            </div>
          </div>

          {/* Right Column - Area Details & Vendor List */}
          <div className="flex flex-col border border-slate-200/60 bg-white rounded-[24px] shadow-xl shadow-cyan-900/10 h-full overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Detail Area: Sleman</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Kabupaten Sleman, DI Yogyakarta</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-7 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                      <Users className="size-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Mitra</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">142</p>
                </div>
                <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-7 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Utensils className="size-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kapasitas</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">125K</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 bg-white">
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 pb-2 pt-2">Daftar Mitra Terdekat</p>
                {vendors.map((vendor) => (
                  <div 
                    key={vendor.id} 
                    onMouseEnter={() => setActiveVendor(vendor.id)}
                    onMouseLeave={() => setActiveVendor(null)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden mx-2",
                      activeVendor === vendor.id 
                        ? "bg-slate-50 border-slate-200 shadow-sm" 
                        : "bg-transparent border-transparent hover:bg-slate-50/50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">{vendor.name}</h4>
                        <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                          <MapPin className="size-3 text-slate-400" />
                          {vendor.location}
                        </p>
                      </div>
                      <Badge 
                        className={cn(
                          "text-[9px] font-bold uppercase px-3 py-1 rounded-lg border-none tracking-widest",
                          vendor.variant === 'success' && "bg-emerald-100 text-emerald-700",
                          vendor.variant === 'warning' && "bg-amber-100 text-amber-700",
                          vendor.variant === 'destructive' && "bg-red-100 text-red-700"
                        )}
                      >
                        {vendor.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Utensils className="size-3 text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-700">{vendor.capacity}</span>
                      </div>
                      <div className={cn(
                        "size-8 rounded-full flex items-center justify-center transition-all",
                        activeVendor === vendor.id ? "bg-white shadow-sm border border-slate-200" : "bg-transparent"
                      )}>
                        <ChevronRight className={cn(
                          "size-4 transition-transform",
                          activeVendor === vendor.id ? "text-cyan-600 translate-x-0.5" : "text-slate-300"
                        )} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <Button className="w-full text-sm font-bold gap-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm h-12 transition-transform active:scale-95">
                Analisis Lengkap
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
