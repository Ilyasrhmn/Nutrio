"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Search, 
  MapPin, 
  Star, 
  Store, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  Sparkles
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"

export default function MarketplaceHomePage() {
  const suppliers = [
    {
      id: "tani-makmur",
      name: "PT Tani Makmur Sejahtera",
      desc: "Pemasok utama daging ayam potong segar terstandarisasi untuk area Yogyakarta.",
      badges: ["Verified NKV", "Daging & Unggas"],
      location: "Kec. Depok, Sleman",
      distance: "3.2 km",
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1582408921715-18e7806367c1?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "koperasi-susu",
      name: "Koperasi Susu Perah Mandiri",
      desc: "Penyedia susu UHT dan susu segar kualitas premium dari peternak lokal.",
      badges: ["Verified BPOM", "Susu Kemasan"],
      location: "Kec. Ngaglik, Sleman",
      distance: "5.1 km",
      rating: 4.9,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1550583760-704c9a42172c?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "gudang-beras",
      name: "Gudang Beras Nusantara",
      desc: "Distributor beras kualitas super dengan stok stabil untuk kebutuhan skala besar.",
      badges: ["Verified Standar BGN", "Sembako"],
      location: "Kec. Mlati, Sleman",
      distance: "6.0 km",
      rating: 4.5,
      reviews: 210,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&auto=format&fit=crop"
    }
  ]

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-background">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Direktori Supplier MBG</h1>
        <p className="text-muted-foreground font-medium mt-1">Temukan mitra pemasok tervalidasi di sekitar dapur Anda.</p>
      </div>

      {/* Filter Bar */}
      <Card className="border-border bg-card shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-10 h-11 bg-slate-50/50 rounded-xl" placeholder="Cari nama PT, Toko, atau komoditas..." />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Select defaultValue="diy">
              <SelectTrigger className="w-[140px] h-11 rounded-xl bg-slate-50/50 border-slate-200">
                <SelectValue placeholder="Provinsi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diy">DI Yogyakarta</SelectItem>
                <SelectItem value="jabar">Jawa Barat</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="sleman">
              <SelectTrigger className="w-[140px] h-11 rounded-xl bg-slate-50/50 border-slate-200">
                <SelectValue placeholder="Kabupaten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sleman">Sleman</SelectItem>
                <SelectItem value="bantul">Bantul</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px] h-11 rounded-xl bg-slate-50/50 border-slate-200">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meat">Daging & Unggas</SelectItem>
                <SelectItem value="veg">Sayur & Buah</SelectItem>
                <SelectItem value="basic">Sembako</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-200 bg-card">
              <Filter className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Notice Banner */}
      <Alert className="bg-indigo-50 border-indigo-100 shadow-sm rounded-2xl">
        <Sparkles className="size-4 text-primary" />
        <AlertDescription className="text-primary font-bold text-sm">
          Menampilkan supplier terdekat berdasarkan titik koordinat dapur SPPG Anda di Sleman.
        </AlertDescription>
      </Alert>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="group overflow-hidden border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl">
            <div className="aspect-video w-full overflow-hidden relative">
              <img src={supplier.image} alt={supplier.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {supplier.badges.map((badge, idx) => (
                  <Badge key={idx} className={cn(
                    "font-bold text-[9px] uppercase px-2 py-0.5 shadow-sm border-none",
                    badge.includes("Verified") ? "bg-emerald-500 text-white" : "bg-white/90 backdrop-blur-md text-slate-900"
                  )}>
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star className="size-3.5 fill-current" />
                  <span className="text-xs font-black">{supplier.rating}</span>
                  <span className="text-[10px] text-slate-400 font-bold">({supplier.reviews})</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-black uppercase text-primary bg-primary/5 border-primary/10">Near You</Badge>
              </div>
              <CardTitle className="text-lg font-black text-slate-900 mt-2 group-hover:text-primary transition-colors">{supplier.name}</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed mt-1">
                {supplier.desc}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                <MapPin className="size-3 text-primary" />
                {supplier.location}
                <span className="text-slate-300">•</span>
                <span className="text-primary font-black">Jarak: {supplier.distance}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Link href={`/portal/marketplace/${supplier.id}`} className="w-full">
                <Button className="w-full rounded-2xl font-black text-xs uppercase tracking-widest h-11 gap-2 shadow-lg shadow-primary/10">
                  Lihat Profil & Katalog
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
