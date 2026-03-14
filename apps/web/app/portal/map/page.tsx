"use client"

import * as React from "react"
import { 
  MapPin, 
  Search, 
  Download, 
  Users, 
  Utensils, 
  Info,
  ChevronRight,
  Filter,
  Navigation
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
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

export default function MapDistributionPage() {
  const vendors = [
    {
      id: 1,
      name: "Catering Ibu Budi",
      location: "Kec. Depok, Sleman",
      status: "Aman",
      variant: "success",
      capacity: "1.500 porsi/hari",
    },
    {
      id: 2,
      name: "Dapur Nusantara",
      location: "Kec. Ngaglik, Sleman",
      status: "Aman",
      variant: "success",
      capacity: "2.400 porsi/hari",
    },
    {
      id: 3,
      name: "Berkah Catering",
      location: "Kec. Mlati, Sleman",
      status: "Peringatan",
      variant: "warning",
      capacity: "1.200 porsi/hari",
    },
    {
      id: 4,
      name: "Sari Rasa Katering",
      location: "Kec. Gamping, Sleman",
      status: "Risiko Tinggi",
      variant: "destructive",
      capacity: "3.000 porsi/hari",
    },
    {
      id: 5,
      name: "Dapur Sehat Mandiri",
      location: "Kec. Kalasan, Sleman",
      status: "Aman",
      variant: "success",
      capacity: "1.800 porsi/hari",
    },
    {
      id: 6,
      name: "Mitra Gizi Utama",
      location: "Kec. Seyegan, Sleman",
      status: "Aman",
      variant: "success",
      capacity: "2.100 porsi/hari",
    }
  ]

  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Peta Sebaran Mitra SPPG</h2>
          <p className="text-muted-foreground text-sm">Pemantauan cakupan wilayah dan kapasitas dapur umum (SPPG) secara nasional.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="diy">
            <SelectTrigger className="w-[180px] bg-card rounded-full h-10 border-border">
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
          <Button className="gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold rounded-full">
            <Download className="size-4" />
            Export Peta (PDF)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
        {/* Left & Center Column - Map Area */}
        <Card className="lg:col-span-2 p-0 overflow-hidden border-border bg-card relative group">
          <div className="absolute inset-0 bg-slate-100 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center">
            {/* Mock Map Background Image */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale mix-blend-multiply"></div>
            
            {/* Map Pins */}
            <div className="absolute top-[20%] left-[30%] animate-bounce duration-1000">
              <MapPin className="size-8 text-emerald-500 fill-emerald-100 drop-shadow-md" />
            </div>
            <div className="absolute top-[45%] left-[40%]">
              <MapPin className="size-8 text-emerald-500 fill-emerald-100 drop-shadow-md" />
            </div>
            <div className="absolute bottom-[30%] left-[25%]">
              <MapPin className="size-8 text-amber-500 fill-amber-100 drop-shadow-md" />
            </div>
            <div className="absolute top-[35%] right-[35%]">
              <MapPin className="size-8 text-destructive fill-red-100 drop-shadow-md animate-pulse" />
            </div>
            <div className="absolute bottom-[40%] right-[45%]">
              <MapPin className="size-8 text-emerald-500 fill-emerald-100 drop-shadow-md" />
            </div>
            <div className="absolute top-[60%] right-[20%]">
              <MapPin className="size-8 text-emerald-500 fill-emerald-100 drop-shadow-md" />
            </div>

            <div className="text-center z-10 pointer-events-none opacity-20 select-none">
              <p className="text-4xl font-black text-slate-400 uppercase tracking-widest">Map Visualization Area</p>
              <p className="text-sm font-bold text-slate-400">Yogyakarta Region View</p>
            </div>
          </div>

          {/* Top-Left Search Overlay */}
          <div className="absolute top-4 left-4 w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                className="pl-10 bg-background/90 backdrop-blur-md border-border shadow-lg rounded-full h-11 focus-visible:ring-primary" 
                placeholder="Cari alamat atau nama sekolah..." 
              />
            </div>
          </div>

          {/* Bottom-Right Legend Overlay */}
          <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md p-4 rounded-2xl border border-border shadow-xl space-y-3 min-w-[160px]">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Legenda Status</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-[11px] font-bold text-foreground">Aman (Patuh SOP)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-amber-500 shadow-sm" />
                <span className="text-[11px] font-bold text-foreground">Peringatan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-destructive shadow-sm" />
                <span className="text-[11px] font-bold text-foreground">Risiko Tinggi</span>
              </div>
            </div>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            <Button variant="outline" size="icon" className="rounded-xl bg-background/90 backdrop-blur-md shadow-lg border-border h-10 w-10">
              <Navigation className="size-4 text-primary" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl bg-background/90 backdrop-blur-md shadow-lg border-border h-10 w-10">
              <Filter className="size-4 text-foreground" />
            </Button>
          </div>
        </Card>

        {/* Right Column - Area Details & Vendor List */}
        <Card className="flex flex-col border-border bg-card shadow-sm h-full overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/10 pb-6">
            <CardTitle className="text-lg font-bold">Detail Area: Sleman</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Kabupaten Sleman, DI Yogyakarta</CardDescription>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Total Mitra</span>
                </div>
                <p className="text-lg font-black text-foreground">142</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Utensils className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Kapasitas</span>
                </div>
                <p className="text-lg font-black text-foreground">125K</p>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 pb-1">Daftar Vendor Terdekat</p>
              {vendors.map((vendor) => (
                <div 
                  key={vendor.id} 
                  className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{vendor.name}</h4>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3" />
                        {vendor.location}
                      </p>
                    </div>
                    <Badge 
                      variant={vendor.variant as any}
                      className={cn(
                        "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md",
                        vendor.variant === 'success' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                        vendor.variant === 'warning' && "bg-amber-50 text-amber-600 border-amber-100",
                        vendor.variant === 'destructive' && "bg-destructive/10 text-destructive border-destructive/10"
                      )}
                    >
                      {vendor.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[10px] font-medium text-slate-500 italic">Kapasitas: {vendor.capacity}</span>
                    <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-border bg-muted/5">
            <Button variant="ghost" className="w-full text-xs font-bold text-primary gap-2 hover:bg-primary/5">
              Lihat Analisis Sebaran Lengkap
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
