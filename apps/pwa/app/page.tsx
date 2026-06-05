"use client"

import * as React from "react"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { useRouter } from "next/navigation"
import { apiClient } from "../lib/api-client"

interface CheckpointState {
  id: string
  cpType: 'CP1' | 'CP2' | 'CP3' | 'CP4'
  cpStatus: 'pending' | 'in_progress' | 'done' | 'failed' | 'force_closed'
  completedAt: string | null
}

interface DailyData {
  targetPorsi: number
  menu: string
  score: number
}

const CP_LABELS: Record<string, string> = {
  CP1: 'Persiapan Masak',
  CP2: 'Selesai Masak',
  CP3: 'Siap Kirim',
  CP4: 'Serah Terima',
}

const CP_WINDOWS: Record<string, { start: number; end: number }> = {
  CP1: { start: 6, end: 10 },
  CP2: { start: 10, end: 12 },
  CP3: { start: 12, end: 13 },
  CP4: { start: 13, end: 14 },
}

function getNextPendingCp(checkpoints: CheckpointState[]): CheckpointState | null {
  const order = ['CP1', 'CP2', 'CP3', 'CP4']
  for (const cpType of order) {
    const cp = checkpoints.find(c => c.cpType === cpType)
    if (!cp || cp.cpStatus === 'pending') {
      return cp ?? { id: cpType, cpType: cpType as 'CP1' | 'CP2' | 'CP3' | 'CP4', cpStatus: 'pending', completedAt: null }
    }
  }
  return null
}

function isWindowOpen(cpType: string): boolean {
  const win = CP_WINDOWS[cpType]
  if (!win) return true
  const hour = new Date().getHours()
  return hour >= win.start && hour < win.end
}

function getCountdownToWindow(cpType: string): string {
  const win = CP_WINDOWS[cpType]
  if (!win) return ''
  const now = new Date()
  const target = new Date()
  target.setHours(win.start, 0, 0, 0)
  if (now >= target) return ''
  const diffMs = target.getTime() - now.getTime()
  const h = Math.floor(diffMs / 3_600_000)
  const m = Math.floor((diffMs % 3_600_000) / 60_000)
  return `${h}j ${m}m`
}

export default function PWALandingPage() {
  const [checkpoints, setCheckpoints] = useState<CheckpointState[]>([])
  const [dailyData, setDailyData] = useState<DailyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const [cpRes, scoreRes, meRes, sppgRes] = await Promise.all([
        apiClient.get<CheckpointState[]>('/checkpoints/today'),
        apiClient.get<{ score: number }>('/scoring/today'),
        apiClient.get<{ fullName?: string; email?: string }>('/auth/me'),
        apiClient.get<{ targetPorsi?: number }[]>('/public/sppg/search?limit=1').catch(() => ({ data: [] })),
      ])
      setCheckpoints(cpRes.data ?? [])
      setDailyData({
        targetPorsi: (sppgRes.data[0] as any)?.targetPorsi ?? 0,
        menu: 'Nasi + Lauk Pauk',
        score: scoreRes.data?.score ?? 100,
      })
      setUserName(meRes.data?.fullName ?? meRes.data?.email ?? '')
    } catch {
      toast({ title: 'Gagal memuat data harian', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchData() }, [fetchData])

  const allDone = checkpoints.length === 4 && checkpoints.every(c => c.cpStatus === 'done')
  const nextCp = getNextPendingCp(checkpoints)
  const windowOpen = nextCp ? isWindowOpen(nextCp.cpType) : false
  const countdown = nextCp ? getCountdownToWindow(nextCp.cpType) : ''

  const handleStart = () => {
    if (!nextCp) return
    router.push(`/cp/${nextCp.cpType}/context`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-8 gap-6" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="text-center">
        <p className="text-slate-500 text-sm">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl font-bold mt-1">Halo, {userName || 'Anggota Tim'} 👋</h1>
        {dailyData && (
          <p className="text-slate-500 mt-1 text-sm">
            Target hari ini: <span className="font-semibold">{dailyData.targetPorsi} porsi</span> · Skor: <span className="font-semibold">{dailyData.score}</span>
          </p>
        )}
      </div>

      {allDone ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-green-600">Semua Tugas Selesai!</h2>
          <p className="text-slate-500 text-sm mt-2">Kerja bagus hari ini. Sampai besok!</p>
        </div>
      ) : nextCp ? (
        <div className="w-full space-y-4">
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tugas Berikutnya</p>
            <p className="text-xl font-bold">{nextCp.cpType} — {CP_LABELS[nextCp.cpType]}</p>
            {!windowOpen && countdown && (
              <p className="text-sm text-yellow-600 mt-2">⏰ Dimulai dalam {countdown}</p>
            )}
          </div>

          <Button
            size="lg"
            className="w-full h-16 text-lg font-bold"
            disabled={!windowOpen}
            onClick={handleStart}
          >
            {windowOpen ? 'TUGAS SEKARANG →' : `Tunggu ${countdown}`}
          </Button>

          <div className="grid grid-cols-4 gap-2">
            {(['CP1','CP2','CP3','CP4'] as const).map(cpType => {
              const cp = checkpoints.find(c => c.cpType === cpType)
              const status = cp?.cpStatus ?? 'pending'
              return (
                <div key={cpType} className={cn(
                  'rounded-lg border p-2 text-center text-xs',
                  status === 'done' ? 'bg-green-50 border-green-200' :
                  status === 'in_progress' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-white border-slate-200',
                )}>
                  <p className="font-bold">{cpType}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5 truncate">{CP_LABELS[cpType]}</p>
                  <p className="mt-1">{status === 'done' ? '✅' : status === 'in_progress' ? '🔄' : '⬜'}</p>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
