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
  FileText,
  Plus,
  Trash2,
  Zap,
  Target
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
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
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <ChefHat className="size-8 text-primary" />
            Penyusunan Menu & Nutrisi
          </h2>
          <p className="text-muted-foreground font-medium max-w-2xl text-sm leading-relaxed">
            Rancang menu harian SPPG secara mandiri. Sistem akan menghitung nutrisi secara real-time berdasarkan takaran per porsi.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-5 py-3 rounded-2xl shadow-sm">
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-foreground">Planning Phase</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Section */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border shadow-sm bg-card rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 border-b border-border/50">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Informasi Dasar</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground pl-1">Nama Menu</Label>
                    <Input 
                      value={menuName} 
                      onChange={(e) => setMenuName(e.target.value)}
                      className="h-12 rounded-xl border-border bg-muted/30 font-bold focus:bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground pl-1">Target Porsi (Demand Zona)</Label>
                    <div className="flex items-center gap-3 h-12 bg-muted/30 border border-border rounded-xl px-4 font-black text-primary">
                      <Users className="size-4" />
                      {totalPortions} Porsi
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-amber-500" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Komposisi Bahan Baku (Per Porsi)</span>
                </div>
                <Button variant="ghost" size="sm" onClick={addIngredient} className="h-8 text-[10px] font-black uppercase text-primary hover:bg-primary/5 gap-1">
                  <Plus className="size-3" /> Tambah Bahan
                </Button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center gap-4 animate-in slide-in-from-left-2 duration-300">
                    <div className="flex-1">
                      <select 
                        value={ing.name}
                        onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                        className="w-full h-11 rounded-xl border border-border bg-muted/20 px-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        {Object.keys(NUTRI_STANDARDS).map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative w-32">
                      <Input 
                        type="number"
                        value={ing.weight}
                        onChange={(e) => updateIngredient(ing.id, 'weight', parseInt(e.target.value) || 0)}
                        className="h-11 rounded-xl border-border bg-muted/20 pr-10 font-black text-right"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">gr</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeIngredient(ing.id)}
                      className="size-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
             <Button variant="ghost" className="rounded-full h-12 px-8 font-bold text-muted-foreground hover:text-primary">
               Batal
             </Button>
             <Link href="/portal/operasional/kalkulasi-bahan">
               <Button className="rounded-full h-12 px-10 font-black shadow-xl shadow-primary/20 gap-3">
                 <Save className="size-5" />
                 Simpan & Lanjut ke Kalkulasi Logistik
               </Button>
             </Link>
          </div>
        </div>

        {/* Right: Nutrition Sidebar (Sticky) */}
        <div className="lg:col-span-4 sticky top-8">
          <Card className="border-border shadow-xl bg-card rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 bg-slate-900 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Target className="size-4 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nutri-Score Analysis</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tight">{totals.kcal} <span className="text-sm font-bold opacity-50 uppercase tracking-tighter">kcal</span></h3>
                <p className="text-[11px] font-bold text-slate-400">Hasil estimasi nutrisi per porsi</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Kalori Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Kalori (Target: {targetKcal})</span>
                  <span className={cn(
                    totals.kcal >= targetKcal ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {totals.kcal >= targetKcal ? "Target Tercapai" : `Kurang ${targetKcal - totals.kcal}`}
                  </span>
                </div>
                <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-700 rounded-full",
                      totals.kcal >= targetKcal ? "bg-emerald-500" : "bg-amber-500"
                    )}
                    style={{ width: `${kcalProgress}%` }}
                  />
                  <div className="absolute top-0 left-[100%] border-l border-white h-full" style={{ left: '100%' }} />
                </div>
              </div>

              {/* Protein Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Protein (Target: {targetProtein}g)</span>
                  <span className={cn(
                    totals.protein >= targetProtein ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {totals.protein >= targetProtein ? "Aman" : `${totals.protein}g / ${targetProtein}g`}
                  </span>
                </div>
                <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-700 rounded-full",
                      totals.protein >= targetProtein ? "bg-emerald-500" : "bg-amber-500"
                    )}
                    style={{ width: `${proteinProgress}%` }}
                  />
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase">Rangkuman Produksi</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Total Porsi</span>
                    <span className="font-black text-foreground">{totalPortions}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Beban Bahan Baku</span>
                    <span className="font-black text-foreground">
                      {Math.round(ingredients.reduce((acc, curr) => acc + curr.weight, 0) * totalPortions / 1000)} kg
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground italic leading-relaxed">
                <Info className="size-3 shrink-0" />
                Data nutrisi dihitung berdasarkan porsi standar SPPG 2026.
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
