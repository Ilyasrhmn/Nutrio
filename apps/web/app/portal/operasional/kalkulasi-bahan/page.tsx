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
  AlertCircle,
  MapPin,
  Users,
  PackageCheck
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
    const rowCost = (toBuyGr / 1000) * (item.pricePerUnit * 1000) // Price is per gram, convert back to kg for readability if needed
    // But pricePerUnit in state is price per gram for simplicity in calculation
    return { ...item, totalRequiredGr, toBuyGr, rowCost }
  })

  const grandTotal = rows.reduce((sum, row) => sum + row.rowCost, 0)

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-background">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Scale className="size-8 text-primary" />
            Kalkulasi Logistik & Bahan
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl text-sm leading-relaxed">
            Otomatisasi kebutuhan belanja bahan baku berdasarkan rencana menu dan target porsi zona.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-5 py-3 rounded-2xl shadow-sm">
          <PackageCheck className="size-5 text-emerald-500" />
          <span className="text-sm font-bold text-foreground">Stock Sync: Ready</span>
        </div>
      </div>

      {/* 2. Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Demand Zona</p>
              <p className="text-2xl font-black text-foreground">{targetPortions} <span className="text-xs font-bold opacity-40">Porsi</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Utensils className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Rencana Menu</p>
              <p className="text-lg font-black text-foreground truncate max-w-[200px]">Nasi Ayam Teriyaki</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Status Efisiensi</p>
              <p className="text-lg font-black text-foreground">Optimal (SOP)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Calculator Table */}
      <Card className="bg-card border-border shadow-sm rounded-[32px] overflow-hidden">
        <CardHeader className="p-8 border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black text-foreground">Daftar Kebutuhan Belanja</CardTitle>
              <CardDescription className="font-medium text-muted-foreground">Kalkulasi otomatis berdasarkan takaran menu per porsi.</CardDescription>
            </div>
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
              <Info className="size-4 text-primary" />
              <p className="text-[10px] font-bold text-primary leading-tight max-w-[200px]">
                Input kolom "Stok" dalam satuan KG/Unit untuk mengurangi jumlah belanja.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead className="font-black text-muted-foreground text-[10px] uppercase tracking-widest h-14 pl-8">Nama Bahan</TableHead>
                <TableHead className="font-black text-muted-foreground text-[10px] uppercase tracking-widest text-center h-14">Takaran / Porsi</TableHead>
                <TableHead className="font-black text-muted-foreground text-[10px] uppercase tracking-widest text-center h-14">Total Kebutuhan</TableHead>
                <TableHead className="font-black text-muted-foreground text-[10px] uppercase tracking-widest text-center h-14">Stok Dapur (KG)</TableHead>
                <TableHead className="font-black text-muted-foreground text-[10px] uppercase tracking-widest text-center h-14">Harus Dibeli</TableHead>
                <TableHead className="font-black text-muted-foreground text-[10px] uppercase tracking-widest pr-8 text-right h-14">Estimasi Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                  <TableCell className="font-black text-foreground py-6 pl-8">{row.name}</TableCell>
                  <TableCell className="text-center text-muted-foreground font-bold text-xs">
                    {row.stdQtyPerPortion} gr
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700">
                    {(row.totalRequiredGr / 1000).toFixed(2)} kg
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="max-w-[100px] mx-auto">
                      <Input 
                        type="number"
                        placeholder="0"
                        onChange={(e) => handleStockChange(row.id, e.target.value)}
                        className="h-9 text-center rounded-xl border-border bg-muted/20 font-black focus:bg-card"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "px-3 py-1 rounded-full font-black text-[10px] border-none shadow-sm",
                      row.toBuyGr > 0 ? "bg-primary text-white" : "bg-emerald-500 text-white"
                    )}>
                      {row.toBuyGr > 0 ? `${(row.toBuyGr / 1000).toFixed(2)} kg` : "Cukup"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-8 font-black text-foreground">
                    {formatIDR(row.rowCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-8 border-t border-border/50 bg-muted/5">
             <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                <div className="w-full md:max-w-md space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Catatan Logistik</Label>
                  <Textarea 
                    placeholder="Contoh: Ayam dipesan dari Supplier A, sayur dari pasar lokal..." 
                    className="min-h-[80px] rounded-2xl border-border bg-card shadow-inner text-sm"
                  />
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Total Belanja Hari Ini</p>
                  <h3 className="text-5xl font-black text-foreground tracking-tighter">
                    {formatIDR(grandTotal)}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground italic">Harga estimasi berdasarkan indeks pasar SPPG</p>
                </div>
             </div>
          </div>
        </CardContent>

        <CardFooter className="p-8 bg-card border-t border-border/50 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Button variant="ghost" className="rounded-full h-12 px-8 font-bold text-muted-foreground">
            Batal
          </Button>
          <Button variant="outline" className="rounded-full h-12 px-8 font-bold gap-2">
            <Save className="size-4" />
            Simpan Draft
          </Button>
          <Link href="/portal/marketplace">
            <Button className="rounded-full h-12 px-10 font-black shadow-xl shadow-primary/20 gap-3">
              <ShoppingCart className="size-5" />
              Lanjut ke E-Katalog
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
