"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import {
  Sparkles,
  Salad,
  ClipboardList,
  CookingPot,
  Thermometer,
  CheckCircle2,
  Circle,
  Package,
  Tag,
  Truck,
  Handshake,
  FileText,
  Camera,
  Target,
} from "lucide-react"

const CP_CHECKLIST: Record<string, Array<{ icon: typeof Sparkles; label: string }>> = {
  CP1: [
    { icon: Sparkles, label: 'Area dapur sudah bersih' },
    { icon: Salad, label: 'Bahan baku sudah disiapkan' },
    { icon: ClipboardList, label: 'Jumlah porsi sudah dicek' },
  ],
  CP2: [
    { icon: CookingPot, label: 'Semua porsi sudah matang' },
    { icon: Thermometer, label: 'Suhu makanan aman (>70°C)' },
    { icon: CheckCircle2, label: 'Rasa dan penampilan sesuai' },
  ],
  CP3: [
    { icon: Package, label: 'Semua porsi sudah dikemas' },
    { icon: Tag, label: 'Label terpasang dengan benar' },
    { icon: Truck, label: 'Siap diserahkan ke kurir' },
  ],
  CP4: [
    { icon: Handshake, label: 'Kurir sudah menerima makanan' },
    { icon: FileText, label: 'Jumlah porsi sesuai' },
    { icon: Camera, label: 'Foto serah terima sudah diambil' },
  ],
}

export default function CPConfirmPage() {
  const { cpId } = useParams<{ cpId: string }>()
  const router = useRouter()
  const checklist = CP_CHECKLIST[cpId] ?? []
  const [checked, setChecked] = useState<boolean[]>(checklist.map(() => false))
  const [done, setDone] = useState(false)

  const allChecked = checked.every(Boolean)

  const toggle = (i: number) => {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  const handleConfirm = () => {
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="border-none shadow-sm w-full max-w-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Target className="h-7 w-7" />
            </div>
            <p className="font-bold text-slate-900">{cpId} Selesai!</p>
            <p className="text-sm text-slate-500">Kembali ke halaman utama...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col px-6 py-8 max-w-md mx-auto min-h-screen">
      <div className="mb-2">
        <Badge className="bg-primary text-primary-foreground border-none">{cpId}</Badge>
      </div>
      <h1 className="text-2xl font-bold mt-2 mb-2 text-slate-900">Konfirmasi</h1>
      <p className="text-slate-500 text-sm mb-6">Centang semua item untuk menyelesaikan checkpoint ini</p>

      <div className="flex-1 space-y-3">
        {checklist.map((item, i) => {
          const ItemIcon = item.icon
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                checked[i] ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white',
              )}
            >
              <div className={cn(
                'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                checked[i] ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400',
              )}>
                <ItemIcon className="h-4.5 w-4.5" />
              </div>
              <span className={cn('flex-1 text-sm font-medium', checked[i] ? 'text-green-700 line-through' : 'text-slate-700')}>
                {item.label}
              </span>
              {checked[i] ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-slate-200 shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      <Button
        size="lg"
        className="w-full h-14 text-base font-bold mt-8"
        disabled={!allChecked}
        onClick={handleConfirm}
      >
        {allChecked ? 'Selesaikan Checkpoint' : `Centang semua (${checked.filter(Boolean).length}/${checklist.length})`}
      </Button>
    </div>
  )
}
