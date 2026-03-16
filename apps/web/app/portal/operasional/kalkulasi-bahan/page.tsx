"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ShoppingCart, 
  Save, 
  Scale, 
  Info, 
  BrainCircuit, 
  Utensils, 
  School,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"

interface Ingredient {
  id: number
  name: string
  stdQtyPerPortion: number
  unit: string
  pricePerUnit: number
  availableStock: number
}

export default function KalkulasiBahanPage() {
  const targetPortions = 450

  const [ingredients, setIngredients] = React.useState<Ingredient[]>([
    { id: 1, name: "Daging Ayam Fillet", stdQtyPerPortion: 0.05, unit: "kg", pricePerUnit: 38000, availableStock: 0 },
    { id: 2, name: "Beras Putih", stdQtyPerPortion: 0.1, unit: "kg", pricePerUnit: 15000, availableStock: 0 },
    { id: 3, name: "Wortel Segar", stdQtyPerPortion: 0.02, unit: "kg", pricePerUnit: 12000, availableStock: 0 },
    { id: 4, name: "Susu UHT 200ml", stdQtyPerPortion: 1, unit: "kotak", pricePerUnit: 3200, availableStock: 0 },
  ])

  const handleStockChange = (id: number, value: string) => {
    const numValue = Math.max(0, parseFloat(value) || 0)
    setIngredients(prev => prev.map(item => 
      item.id === id ? { ...item, availableStock: numValue } : item
    ))
  }

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Derive values
  const rows = ingredients.map(item => {
    const totalRequired = item.stdQtyPerPortion * targetPortions
    const toBuy = Math.max(0, totalRequired - item.availableStock)
    const rowCost = toBuy * item.pricePerUnit
    return { ...item, totalRequired, toBuy, rowCost }
  })

  const grandTotal = rows.reduce((sum, row) => sum + row.rowCost, 0)

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-[#FBFBFE]">
      {/* 1. Header & Context Cards */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Scale className="size-8 text-primary" />
          Kalkulasi Bahan Baku (Auto-Scale)
        </h1>
        <p className="text-muted-foreground font-medium max-w-2xl text-sm leading-relaxed">
          Sistem menghitung otomatis volume belanja berdasarkan target porsi hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden ring-1 ring-slate-100">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
              <School className="size-7" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Target Produksi Hari Ini</p>
              <p className="text-3xl font-black text-slate-900 leading-tight">450 <span className="text-base font-bold text-slate-400">Porsi</span></p>
              <p className="text-xs font-bold text-primary flex items-center gap-1">
                <MapPin className="size-3" /> SDN Menteng 01
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden ring-1 ring-slate-100">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="size-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <Utensils className="size-7" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Standar Menu BGN</p>
              <p className="text-xl font-black text-slate-800 leading-tight">Paket C (Nasi Ayam Teriyaki)</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-[9px] font-black border-slate-200">SOP SAYUR</Badge>
                <Badge variant="outline" className="text-[9px] font-black border-slate-200">SUSU UHT</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Interactive Table (Main Content) */}
      <Card className="border-none shadow-xl bg-white rounded-[32px] overflow-hidden ring-1 ring-slate-100">
        <CardHeader className="p-8 pb-0 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <BrainCircuit className="size-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-900">Kalkulator Kebutuhan Bahan</CardTitle>
              <CardDescription className="font-medium text-slate-500">Sesuaikan stok fisik gudang untuk memvalidasi daftar belanja.</CardDescription>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-100 rounded-2xl py-3 shadow-sm shadow-blue-50/50">
            <Info className="size-4 text-blue-600" />
            <AlertDescription className="text-blue-700 text-xs font-bold leading-relaxed">
              Isi kolom 'Stok di Gudang' jika Anda memiliki sisa bahan. Sistem akan otomatis mengurangi jumlah yang harus dibeli.
            </AlertDescription>
          </Alert>
        </CardHeader>

        <CardContent className="p-8">
          <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-100">
                  <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-12 pl-6">Nama Bahan</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center h-12">Kebutuhan (Auto)</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center h-12">Stok di Gudang (Manual)</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center h-12">Harus Dibeli</TableHead>
                  <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right h-12 pr-6">Estimasi Biaya</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-50 last:border-0">
                    <TableCell className="font-bold text-slate-800 py-5 pl-6">{row.name}</TableCell>
                    <TableCell className="text-center text-slate-500 font-medium italic">
                      {row.totalRequired.toFixed(1)} {row.unit}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="max-w-[120px] mx-auto relative group">
                        <Input 
                          type="number"
                          value={row.availableStock}
                          onChange={(e) => handleStockChange(row.id, e.target.value)}
                          className="h-10 text-center rounded-xl border-slate-200 bg-slate-50/50 font-black focus:bg-white transition-all focus:ring-primary/20 pr-8"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 pointer-events-none uppercase">
                          {row.unit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "px-3 py-1 rounded-full font-black text-xs border-none shadow-sm",
                        row.toBuy > 0 ? "bg-primary text-white" : "bg-emerald-100 text-emerald-600"
                      )}>
                        {row.toBuy > 0 ? `${row.toBuy.toFixed(1)} ${row.unit}` : "Cukup"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 font-black text-slate-900">
                      {formatIDR(row.rowCost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-10 space-y-6">
            <div className="flex flex-col gap-4">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Catatan Penyesuaian (Opsional)</Label>
              <Textarea 
                placeholder="Tambahkan catatan jika ada penyesuaian porsi khusus sekolah, atau pembelian di luar E-Katalog..." 
                className="min-h-[100px] rounded-[24px] border-slate-200 bg-slate-50/30 p-5 focus:bg-white transition-all text-sm font-medium leading-relaxed resize-none"
              />
            </div>

            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Inventaris</p>
                  <p className="text-sm font-bold text-slate-700">Dapur Siap Produksi</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total Estimasi Belanja</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {formatIDR(grandTotal)}
                </h3>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Button variant="outline" className="w-full sm:w-auto rounded-2xl h-14 px-8 border-slate-200 font-bold text-slate-600 gap-2 hover:bg-white transition-all">
            <Save className="size-4" />
            Simpan Draft
          </Button>
          <Link href="/portal/marketplace" className="w-full sm:w-auto">
            <Button className="w-full rounded-2xl h-14 px-10 font-black shadow-xl shadow-primary/20 gap-3 text-sm tracking-tight transition-all active:scale-95">
              <ShoppingCart className="size-5" />
              Beli Kekurangan di E-Katalog
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
