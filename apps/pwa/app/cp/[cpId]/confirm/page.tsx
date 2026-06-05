"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const CP_CHECKLIST: Record<string, Array<{ icon: string; label: string }>> = {
  CP1: [
    { icon: '🧼', label: 'Area dapur sudah bersih' },
    { icon: '🥦', label: 'Bahan baku sudah disiapkan' },
    { icon: '📋', label: 'Jumlah porsi sudah dicek' },
  ],
  CP2: [
    { icon: '🍳', label: 'Semua porsi sudah matang' },
    { icon: '🌡️', label: 'Suhu makanan aman (>70°C)' },
    { icon: '✅', label: 'Rasa dan penampilan sesuai' },
  ],
  CP3: [
    { icon: '📦', label: 'Semua porsi sudah dikemas' },
    { icon: '🏷️', label: 'Label terpasang dengan benar' },
    { icon: '🚚', label: 'Siap diserahkan ke kurir' },
  ],
  CP4: [
    { icon: '🤝', label: 'Kurir sudah menerima makanan' },
    { icon: '📝', label: 'Jumlah porsi sesuai' },
    { icon: '📸', label: 'Foto serah terima sudah diambil' },
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
      <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center gap-4 text-white">
        <div className="text-7xl">🎯</div>
        <h1 className="text-2xl font-bold">{cpId} Selesai!</h1>
        <p className="text-green-100 text-sm">Kembali ke halaman utama...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col px-6 py-8" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="mb-2">
        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">{cpId}</span>
      </div>
      <h1 className="text-2xl font-bold mt-2 mb-2">Konfirmasi</h1>
      <p className="text-slate-500 text-sm mb-6">Centang semua item untuk menyelesaikan checkpoint ini</p>

      <div className="flex-1 space-y-3">
        {checklist.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
              checked[i] ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-white',
            )}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className={cn('flex-1 text-sm font-medium', checked[i] ? 'text-green-700 line-through' : 'text-slate-700')}>
              {item.label}
            </span>
            <span className={cn('text-xl', checked[i] ? 'text-green-500' : 'text-slate-200')}>
              {checked[i] ? '✅' : '⬜'}
            </span>
          </button>
        ))}
      </div>

      <Button
        size="lg"
        className="w-full h-14 text-base font-bold mt-8"
        disabled={!allChecked}
        onClick={handleConfirm}
      >
        {allChecked ? 'SELESAIKAN CHECKPOINT ✓' : `Centang semua (${checked.filter(Boolean).length}/${checklist.length})`}
      </Button>
    </div>
  )
}
