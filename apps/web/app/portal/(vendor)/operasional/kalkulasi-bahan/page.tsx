"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ShoppingCart, 
  Save, 
  Scale, 
  Info, 
  Utensils, 
  ArrowRight,
  TrendingUp,
  Users,
  PackageCheck,
  CheckCircle2
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
import { cn } from "@workspace/ui/lib/utils"

interface Ingredient {
  id: number
  name: string
  stdQtyPerPortion: number // in grams
  unit: string
  pricePerUnit: number
  availableStock: number // in grams
}

export default function KalkulasiBahanPage() {
  const targetPortions = 650

  const [ingredients, setIngredients] = React.useState<Ingredient[]>([
    { id: 1, name: "Daging Ayam Fillet", stdQtyPerPortion: 80, unit: "gr", pricePerUnit: 45, availableStock: 0 },
    { id: 2, name: "Beras Putih", stdQtyPerPortion: 100, unit: "gr", pricePerUnit: 15, availableStock: 0 },
    { id: 3, name: "Wortel Segar", stdQtyPerPortion: 30, unit: "gr", pricePerUnit: 12, availableStock: 0 },
    { id: 4, name: "Buncis", stdQtyPerPortion: 20, unit: "gr", pricePerUnit: 14, availableStock: 0 },
    { id: 5, name: "Minyak Goreng", stdQtyPerPortion: 5, unit: "gr", pricePerUnit: 20, availableStock: 0 },
  ])

  const handleStockChange = (id: number, value: string) => {
    const numValue = Math.max(0, parseFloat(value) || 0)
    setIngredients(prev => prev.map(item => 
      item.id === id ? { ...item, availableStock: numValue * 1000 } : item // Convert input kg to gr
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
    const totalRequiredGr = item.stdQtyPerPortion * targetPortions
    const toBuyGr = Math.max(0, totalRequiredGr - item.availableStock)
    const rowCost = (toBuyGr / 1000) * (item.pricePerUnit * 1000)
    return { ...item, totalRequiredGr, toBuyGr, rowCost }
  })

  const grandTotal = rows.reduce((sum, row) => sum + row.rowCost, 0)

  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* 1. Deep Teal Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Scale className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Auto Calculation
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Kalkulasi Logistik & Bahan</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Otomatisasi kebutuhan belanja bahan baku dapur secara real-time berdasarkan rencana menu dan porsi harian.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 shrink-0">
            <PackageCheck className="size-5 text-emerald-400" />
            <div>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Inventory Sync</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">Ready & Connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <CardContent className="p-6 md:p-8 flex items-center gap-4">
            <div className="size-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Demand Zona</p>
              <p className="text-2xl font-black text-slate-900">{targetPortions} <span className="text-xs font-bold opacity-40">Porsi</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <CardContent className="p-6 md:p-8 flex items-center gap-4">
            <div className="size-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
              <Utensils className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Rencana Menu</p>
              <p className="text-lg font-black text-slate-900 truncate max-w-[200px]">Nasi Ayam Teriyaki</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <CardContent className="p-6 md:p-8 flex items-center gap-4">
            <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status Efisiensi</p>
              <p className="text-lg font-black text-emerald-600 flex items-center gap-2">
                Optimal <CheckCircle2 className="size-4" />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Calculator Table */}
      <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-slate-900">Daftar Kebutuhan Belanja</CardTitle>
              <CardDescription className="font-semibold text-slate-500">Kalkulasi otomatis berdasarkan takaran menu per porsi.</CardDescription>
            </div>
            <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-center gap-3">
              <Info className="size-5 text-teal-600 shrink-0" />
              <p className="text-[11px] font-bold text-teal-800 leading-tight">
                Input stok sisa dapur di kolom "Stok Fisik (KG)" untuk mengurangi total belanja.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-14 pl-8">Nama Bahan</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center h-14">Takaran / Porsi</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center h-14">Total Kebutuhan</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center h-14">Stok Fisik (KG)</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center h-14">Harus Dibeli</TableHead>
                  <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-8 text-right h-14">Estimasi Biaya</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                    <TableCell className="font-extrabold text-slate-900 py-6 pl-8">{row.name}</TableCell>
                    <TableCell className="text-center text-slate-500 font-bold text-xs bg-slate-50/30">
                      {row.stdQtyPerPortion} gr
                    </TableCell>
                    <TableCell className="text-center font-extrabold text-slate-700">
                      {(row.totalRequiredGr / 1000).toFixed(2)} kg
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="max-w-[120px] mx-auto">
                        <Input 
                          type="number"
                          placeholder="0"
                          onChange={(e) => handleStockChange(row.id, e.target.value)}
                          className="h-10 text-center rounded-xl border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "px-3 py-1 rounded-md font-bold text-[10px] border-none uppercase tracking-widest",
                        row.toBuyGr > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      )}>
                        {row.toBuyGr > 0 ? `${(row.toBuyGr / 1000).toFixed(2)} kg` : "Cukup"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8 font-black text-slate-900 text-sm">
                      {formatIDR(row.rowCost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-8 border-t border-slate-100 bg-slate-50/50">
             <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                <div className="w-full md:max-w-md space-y-3">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Catatan Opsional Belanja</Label>
                  <Textarea 
                    placeholder="Contoh: Ayam dipesan dari Supplier A, sayur dari pasar lokal..." 
                    className="min-h-[100px] rounded-2xl border-slate-200 bg-white shadow-sm text-sm focus:ring-2 focus:ring-teal-500/20 p-4"
                  />
                </div>
                <div className="text-right space-y-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:min-w-[300px]">
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest leading-none">Total Belanja Hari Ini</p>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                    {formatIDR(grandTotal)}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">Harga estimasi berdasarkan indeks pasar SPPG</p>
                </div>
             </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
          <Button variant="ghost" className="rounded-xl h-12 px-8 font-bold text-slate-500 hover:text-slate-900 w-full sm:w-auto">
            Batal
          </Button>
          <Button variant="outline" className="rounded-xl h-12 px-8 font-bold gap-2 w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50">
            <Save className="size-4" />
            Simpan Draft
          </Button>
          <Link href="/portal/marketplace" className="w-full sm:w-auto">
            <Button className="w-full rounded-xl h-12 px-10 font-bold shadow-md bg-teal-600 hover:bg-teal-700 text-white gap-2 transition-all">
              <ShoppingCart className="size-4" />
              Lanjut ke E-Katalog
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
