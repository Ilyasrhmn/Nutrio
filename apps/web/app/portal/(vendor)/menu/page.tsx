"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ChefHat, 
  Save, 
  Info,
  TrendingUp,
  FileText,
  Plus,
  Trash2,
  Zap,
  Target,
  Users
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

const NUTRI_STANDARDS = {
  "Ayam": { kcal: 239, protein: 27 },
  "Beras": { kcal: 365, protein: 7 },
  "Telur": { kcal: 155, protein: 13 },
  "Wortel": { kcal: 41, protein: 0.9 },
  "Buncis": { kcal: 31, protein: 1.8 },
  "Minyak": { kcal: 884, protein: 0 },
}

export default function MenuPlanningPage() {
  const [menuName, setMenuName] = React.useState("Nasi Ayam Teriyaki & Tumis Sayur")
  const [totalPortions] = React.useState(650)
  const [ingredients, setIngredients] = React.useState([
    { id: 1, name: "Beras", weight: 100 },
    { id: 2, name: "Ayam", weight: 80 },
    { id: 3, name: "Wortel", weight: 30 },
    { id: 4, name: "Buncis", weight: 20 },
    { id: 5, name: "Minyak", weight: 5 },
  ])

  const totals = React.useMemo(() => {
    let kcal = 0
    let protein = 0
    ingredients.forEach(ing => {
      const std = NUTRI_STANDARDS[ing.name as keyof typeof NUTRI_STANDARDS] || { kcal: 0, protein: 0 }
      kcal += (ing.weight * std.kcal) / 100
      protein += (ing.weight * std.protein) / 100
    })
    return { kcal: Math.round(kcal), protein: Math.round(protein * 10) / 10 }
  }, [ingredients])

  const targetKcal = 600
  const targetProtein = 25

  const kcalProgress = Math.min((totals.kcal / targetKcal) * 100, 100)
  const proteinProgress = Math.min((totals.protein / targetProtein) * 100, 100)

  const removeIngredient = (id: number) => {
    setIngredients(ingredients.filter(ing => ing.id !== id))
  }

  const addIngredient = () => {
    const newId = ingredients.length > 0 ? Math.max(...ingredients.map(i => i.id)) + 1 : 1
    setIngredients([...ingredients, { id: newId, name: "Beras", weight: 0 }])
  }

  const updateIngredient = (id: number, field: string, value: string | number) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, [field]: value } : ing))
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* 1. Deep Teal Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 shadow-lg border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ChefHat className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse mr-2 inline-block" /> Nutrition Engine
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Penyusunan Menu & Nutrisi</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Rancang menu harian SPPG secara presisi. Sistem akan otomatis menghitung kalori & protein.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Section */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none ring-1 ring-slate-200/60 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="size-4 text-teal-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Informasi Dasar Menu</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Nama Menu Harian</Label>
                    <Input 
                      value={menuName} 
                      onChange={(e) => setMenuName(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Target Porsi (Demand Zona)</Label>
                    <div className="flex items-center gap-3 h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-900 text-sm">
                      <Users className="size-5 text-teal-600" />
                      {totalPortions} Porsi
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Komposisi Bahan (Per Porsi)</span>
                </div>
                <Button variant="ghost" size="sm" onClick={addIngredient} className="h-9 text-[10px] font-bold uppercase text-teal-700 hover:bg-teal-50 bg-teal-50/50 gap-1.5 rounded-lg px-3">
                  <Plus className="size-3.5" /> Tambah Bahan
                </Button>
              </div>

              <div className="space-y-4">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex-1">
                      <Select 
                        value={ing.name}
                        onValueChange={(value) => updateIngredient(ing.id, 'name', value)}
                      >
                        <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-white font-bold text-sm text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all hover:border-teal-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          {Object.keys(NUTRI_STANDARDS).map(name => (
                            <SelectItem key={name} value={name} className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative w-32">
                      <Input 
                        type="number"
                        value={ing.weight}
                        onChange={(e) => updateIngredient(ing.id, 'weight', parseInt(e.target.value) || 0)}
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 pr-10 font-black text-right text-base text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">gr</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeIngredient(ing.id)}
                      className="size-12 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shrink-0"
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
             <Button variant="ghost" className="w-full sm:w-auto rounded-xl h-12 px-8 font-bold text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200">
               Batal
             </Button>
             <Link href="/portal/operasional/kalkulasi-bahan" className="w-full sm:w-auto">
               <Button className="w-full sm:w-auto rounded-xl h-12 px-8 font-bold shadow-md gap-2 bg-teal-600 hover:bg-teal-700 text-white transition-all">
                 <Save className="size-4" />
                 Simpan & Kalkulasi Logistik
               </Button>
             </Link>
          </div>
        </div>

        {/* Right: Nutrition Sidebar */}
        <div className="lg:col-span-4 sticky top-24">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-slate-900 text-white">
            <CardHeader className="p-8 bg-gradient-to-br from-teal-900 to-slate-900 border-b border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="size-32" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Live Nutri-Score</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-5xl font-black tracking-tighter text-white">{totals.kcal} <span className="text-sm font-bold opacity-60 uppercase tracking-widest ml-1">kcal</span></h3>
                  <p className="text-xs text-teal-100/70 font-semibold">Estimasi kalori per porsi</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 bg-slate-900">
              {/* Kalori Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">Kalori (Target: {targetKcal})</span>
                  <span className={cn(
                    totals.kcal >= targetKcal ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {totals.kcal >= targetKcal ? "Tercapai" : `Kurang ${targetKcal - totals.kcal}`}
                  </span>
                </div>
                <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-700 rounded-full",
                      totals.kcal >= targetKcal ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-amber-500"
                    )}
                    style={{ width: `${kcalProgress}%` }}
                  />
                  <div className="absolute top-0 border-l-2 border-white h-full z-10" style={{ left: '100%' }} />
                </div>
              </div>

              {/* Protein Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">Protein (Target: {targetProtein}g)</span>
                  <span className={cn(
                    totals.protein >= targetProtein ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {totals.protein >= targetProtein ? "Aman" : `${totals.protein}g / ${targetProtein}g`}
                  </span>
                </div>
                <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-700 rounded-full",
                      totals.protein >= targetProtein ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-amber-500"
                    )}
                    style={{ width: `${proteinProgress}%` }}
                  />
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-teal-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Rangkuman Produksi</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-semibold">Total Porsi</span>
                    <span className="font-bold text-white">{totalPortions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-semibold">Beban Bahan Baku</span>
                    <span className="font-black text-white">
                      {Math.round(ingredients.reduce((acc, curr) => acc + curr.weight, 0) * totalPortions / 1000)} kg
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-teal-950/50 rounded-xl border border-teal-900">
                <Info className="size-4 shrink-0 text-teal-400 mt-0.5" />
                <p className="text-[11px] font-semibold text-teal-100/70 leading-relaxed">
                  Data nutrisi dihitung berdasarkan standar gizi SPPG 2026 dan divalidasi oleh AI.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
