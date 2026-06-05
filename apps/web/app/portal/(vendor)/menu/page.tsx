"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ChefHat, 
  ShoppingCart, 
  Save, 
  Info,
  TrendingUp,
  FileText,
  Plus,
  Trash2,
  Zap,
  Target
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
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
  const [menuName, setMenuName] = React.useState("")
  const [totalPortions, setTotalPortions] = React.useState(100)
  const [ingredients, setIngredients] = React.useState<{ id: number; name: string; weight: number }[]>([
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <ChefHat className="size-6 text-primary" />
            Penyusunan Menu & Nutrisi
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Rancang menu harian SPPG secara mandiri berdasarkan takaran per porsi.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200/60 px-4 py-2 rounded-xl shadow-sm">
          <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Planning Phase</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Section */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="size-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Informasi Dasar</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 pl-1">Nama Menu</Label>
                    <Input 
                      value={menuName} 
                      onChange={(e) => setMenuName(e.target.value)}
                      className="h-10 rounded-lg border-slate-200 bg-white font-semibold focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 pl-1">Target Porsi (Demand Zona)</Label>
                    <div className="flex items-center gap-2 h-10 bg-slate-100/50 border border-slate-200 rounded-lg px-3 font-bold text-primary text-sm">
                      <Users className="size-4" />
                      {totalPortions} Porsi
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Komposisi Bahan (Per Porsi)</span>
                </div>
                <Button variant="ghost" size="sm" onClick={addIngredient} className="h-8 text-[10px] font-bold uppercase text-primary hover:bg-primary/5 gap-1 rounded-lg">
                  <Plus className="size-3" /> Tambah Bahan
                </Button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex-1">
                      <select 
                        value={ing.name}
                        onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        {Object.keys(NUTRI_STANDARDS).map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative w-28">
                      <Input 
                        type="number"
                        value={ing.weight}
                        onChange={(e) => updateIngredient(ing.id, 'weight', parseInt(e.target.value) || 0)}
                        className="h-10 rounded-lg border-slate-200 bg-white pr-8 font-bold text-right text-sm focus:ring-primary/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">gr</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeIngredient(ing.id)}
                      className="size-10 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
             <Button variant="ghost" className="w-full sm:w-auto rounded-lg h-10 px-6 font-bold text-slate-500 hover:text-slate-900 hover:bg-white">
               Batal
             </Button>
             <Link href="/portal/operasional/kalkulasi-bahan" className="w-full sm:w-auto">
               <Button className="w-full sm:w-auto rounded-lg h-10 px-6 font-bold shadow-sm gap-2">
                 <Save className="size-4" />
                 Simpan & Kalkulasi Logistik
               </Button>
             </Link>
          </div>
        </div>

        {/* Right: Nutrition Sidebar */}
        <div className="lg:col-span-4 sticky top-24">
          <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-b border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <Target className="size-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nutri-Score Analysis</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-3xl font-bold tracking-tight">{totals.kcal} <span className="text-xs font-semibold opacity-60 uppercase tracking-widest">kcal</span></h3>
                <p className="text-[10px] text-slate-400 font-medium">Hasil estimasi nutrisi per porsi</p>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Kalori Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Kalori (Target: {targetKcal})</span>
                  <span className={cn(
                    totals.kcal >= targetKcal ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {totals.kcal >= targetKcal ? "Tercapai" : `Kurang ${targetKcal - totals.kcal}`}
                  </span>
                </div>
                <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-700 rounded-full",
                      totals.kcal >= targetKcal ? "bg-emerald-500" : "bg-amber-500"
                    )}
                    style={{ width: `${kcalProgress}%` }}
                  />
                  <div className="absolute top-0 border-l-2 border-white h-full z-10" style={{ left: '100%' }} />
                </div>
              </div>

              {/* Protein Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Protein (Target: {targetProtein}g)</span>
                  <span className={cn(
                    totals.protein >= targetProtein ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {totals.protein >= targetProtein ? "Aman" : `${totals.protein}g / ${targetProtein}g`}
                  </span>
                </div>
                <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-700 rounded-full",
                      totals.protein >= targetProtein ? "bg-emerald-500" : "bg-amber-500"
                    )}
                    style={{ width: `${proteinProgress}%` }}
                  />
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Rangkuman Produksi</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Porsi</span>
                    <span className="font-bold text-slate-900">{totalPortions}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Beban Bahan Baku</span>
                    <span className="font-bold text-slate-900">
                      {Math.round(ingredients.reduce((acc, curr) => acc + curr.weight, 0) * totalPortions / 1000)} kg
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[10px] font-medium text-slate-400 italic leading-relaxed bg-white/50">
                <Info className="size-3.5 shrink-0 text-slate-300 mt-0.5" />
                Data nutrisi dihitung berdasarkan porsi standar SPPG 2026 yang telah divalidasi oleh AI.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Users({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
