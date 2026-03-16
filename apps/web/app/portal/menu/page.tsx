"use client"

import * as React from "react"
import Link from "next/link"
import { 
  CalendarDays, 
  Utensils, 
  School, 
  ChefHat, 
  Scale, 
  Calculator, 
  ShoppingCart, 
  Save, 
  Info,
  ChevronRight,
  TrendingUp,
  FileText
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

export default function MenuPlanningPage() {
  const [ingredients, setIngredients] = React.useState([
    { name: "Daging Ayam Fillet", auto: "22.5 kg", stock: "2.5", short: "20.0 kg", cost: "Rp 760.000" },
    { name: "Beras Putih", auto: "45.0 kg", stock: "0", short: "45.0 kg", cost: "Rp 675.000" },
    { name: "Wortel Segar", auto: "5.0 kg", stock: "1.0", short: "4.0 kg", cost: "Rp 48.000" },
    { name: "Susu UHT 200ml", auto: "450 kotak", stock: "50", short: "400 kotak", cost: "Rp 1.400.000" },
  ])

  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Perencanaan Menu & Kebutuhan Bahan</h2>
          <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
            Dengan fitur ini, proses pencatatan menu dan bahan baku dapur menjadi lebih efisien. 
            Susun menu harian dan catat kebutuhan bahan baku secara otomatis, lengkap dengan takaran dan biaya.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-2xl shadow-sm">
          <CalendarDays className="size-4 text-primary" />
          <span className="text-sm font-black text-foreground">Senin, 16 Maret 2026</span>
        </div>
      </div>

      {/* Top Section: Target & Menu Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <School className="size-5 text-primary" />
              <CardTitle className="text-lg font-bold">Target Distribusi Hari Ini</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nama Sekolah</p>
                <p className="text-lg font-black text-foreground">SDN Menteng 01</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">Zona A</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Total Porsi</p>
                <p className="text-xl font-black text-foreground">450 <span className="text-sm font-bold text-slate-400">Porsi</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Waktu Kirim</p>
                <p className="text-xl font-black text-foreground">07:30 <span className="text-sm font-bold text-slate-400">WIB</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Utensils className="size-5 text-emerald-500" />
              <CardTitle className="text-lg font-bold">Standar Menu BGN</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Paket C (Reguler)</p>
              <p className="text-base font-bold text-slate-800 leading-relaxed">
                Nasi Putih, Ayam Teriyaki, Sayur Sop, Susu UHT
              </p>
            </div>
            <div className="flex items-center gap-6 p-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Energi</p>
                <p className="text-lg font-black text-foreground">590 <span className="text-sm font-bold text-slate-400">kcal/porsi</span></p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Protein</p>
                <p className="text-lg font-black text-foreground">28.5 <span className="text-sm font-bold text-slate-400">gram</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Section: Ingredient Calculator */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-6 border-b border-border/50 bg-muted/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calculator className="size-5 text-primary" />
                <CardTitle className="text-lg font-bold">Kalkulasi Kebutuhan Bahan Baku (Auto-Scale)</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground font-medium">
                Sistem mengkalkulasi kebutuhan berdasarkan 450 porsi. Sesuaikan kolom 'Stok Tersedia' jika Anda memiliki sisa bahan dari hari sebelumnya.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-full h-9 border-border font-bold gap-2 text-slate-600">
              <Scale className="size-3.5" />
              Update Takaran
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/50">
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pl-8">Nama Bahan</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest text-center">Kebutuhan Standar (Auto)</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest text-center">Stok Tersedia (Manual)</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest text-center">Kekurangan / Beli</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pr-8 text-right">Estimasi Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((item, idx) => (
                <TableRow key={idx} className="group border-border/50">
                  <TableCell className="font-bold text-foreground pl-8 py-5">{item.name}</TableCell>
                  <TableCell className="text-center text-slate-600 font-medium">{item.auto}</TableCell>
                  <TableCell className="text-center">
                    <div className="max-w-[100px] mx-auto">
                      <Input 
                        defaultValue={item.stock} 
                        className="h-9 rounded-xl border-slate-200 bg-slate-50/50 text-center font-bold focus:bg-white"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-black text-primary text-sm">{item.short}</span>
                  </TableCell>
                  <TableCell className="text-right pr-8 font-bold text-slate-900">
                    {item.cost}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Catatan Penyesuaian (Opsional)</Label>
                <Textarea 
                  placeholder="Contoh: Sisa stok ayam 2.5kg diambil dari freezer batch kemarin..." 
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div className="w-full md:w-80 space-y-4">
                <div className="p-6 rounded-[24px] bg-slate-950 text-white shadow-xl shadow-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Estimasi Belanja</p>
                  <h3 className="text-3xl font-black tracking-tight">Rp 2.883.000</h3>
                  <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 italic">
                    <Info className="size-3" />
                    Harga mengikuti indeks pasar daerah setempat
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="outline" className="rounded-full h-12 px-8 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 gap-2">
                <Save className="size-4" />
                Simpan Draft
              </Button>
              <Link href="/portal/marketplace">
                <Button className="rounded-full h-12 px-10 font-black shadow-lg shadow-primary/20 gap-3">
                  <ShoppingCart className="size-5" />
                  Beli Kekurangan di E-Katalog
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
