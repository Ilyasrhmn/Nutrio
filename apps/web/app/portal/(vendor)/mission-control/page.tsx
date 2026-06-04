"use client"

import * as React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { api } from "../../../../lib/api-client"
import { opsClient } from "../../../../lib/realtime-client"
import Cookies from "js-cookie"

type CpStatus = 'pending' | 'in_progress' | 'done' | 'failed' | 'force_closed'

interface CpMatrixRow {
  sekolahId: string
  sekolahName: string
  cp1: CpStatus
  cp2: CpStatus
  cp3: CpStatus
  cp4: CpStatus
}

interface TeamMember {
  userId: string
  name: string
  role: string
  isOnline: boolean
}

interface ScoreEvent {
  id: string
  eventType: string
  scoreDelta: number
  reason: string
  occurredAt: string
}

interface MCData {
  scoreDate: string
  targetPorsi: number
  menu: string
  sekolahList: string[]
  team: TeamMember[]
  cpMatrix: CpMatrixRow[]
  score: number
  scoreEvents: ScoreEvent[]
  scoreStreak: number
  disbursementEstimate: number
  alerts: Array<{ id: string; severity: string; title: string; body: string; created_at: string }>
}

function StatusChip({ status }: { status: CpStatus }) {
  const map: Record<CpStatus, { label: string; className: string }> = {
    pending:     { label: '⬜ Belum', className: 'bg-slate-100 text-slate-600' },
    in_progress: { label: '🟡 Proses', className: 'bg-yellow-100 text-yellow-700' },
    done:        { label: '✅ Selesai', className: 'bg-green-100 text-green-700' },
    failed:      { label: '🔴 Gagal', className: 'bg-red-100 text-red-700' },
    force_closed:{ label: '🔴 Ditutup', className: 'bg-red-200 text-red-800' },
  }
  const { label, className } = map[status] ?? map.pending
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap', className)}>
      {label}
    </span>
  )
}

function DayHeaderBar({ data }: { data: MCData }) {
  const dateLabel = new Date(data.scoreDate).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-white border rounded-lg p-4">
      <div>
        <p className="text-sm text-slate-500">{dateLabel}</p>
        <p className="text-lg font-semibold">{data.menu}</p>
      </div>
      <div className="flex gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">{data.targetPorsi}</p>
          <p className="text-xs text-slate-500">Target Porsi</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{data.sekolahList.length || 1}</p>
          <p className="text-xs text-slate-500">Sekolah</p>
        </div>
      </div>
    </div>
  )
}

function ScoreLiveCard({
  score, streak, disbursement, events, onOpenBreakdown,
}: {
  score: number
  streak: number
  disbursement: number
  events: ScoreEvent[]
  onOpenBreakdown: () => void
}) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">Skor Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <button onClick={onOpenBreakdown} className="w-full text-left">
          <p className={cn('text-6xl font-black tabular-nums transition-all', color)}>{score}</p>
          <p className="text-xs text-slate-400 mt-1">🔥 Streak {streak} hari</p>
        </button>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-slate-500 mb-1">Estimasi Disbursement</p>
          <p className="text-lg font-semibold">
            Rp {disbursement.toLocaleString('id-ID')}
          </p>
        </div>
        {events.length > 0 && (
          <div className="mt-2 space-y-1">
            {events.slice(0, 3).map(e => (
              <p key={e.id} className="text-xs text-red-600">
                {e.scoreDelta} — {e.reason}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TeamStatusGrid({ team, onContact }: { team: TeamMember[]; onContact: (m: TeamMember) => void }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">Tim ({team.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {team.map(m => (
            <button
              key={m.userId}
              onClick={() => onContact(m)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                  m.isOnline ? 'bg-green-500' : 'bg-slate-300',
                )} />
              </div>
              <p className="text-xs text-slate-600 max-w-[60px] truncate">{m.name}</p>
            </button>
          ))}
          {team.length === 0 && (
            <p className="text-sm text-slate-400">Belum ada anggota tim</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CheckpointMatrix({ matrix, onCellClick }: {
  matrix: CpMatrixRow[]
  onCellClick: (row: CpMatrixRow, cp: 'cp1' | 'cp2' | 'cp3' | 'cp4') => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">Checkpoint Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 text-slate-500 font-medium">Sekolah</th>
                {(['CP1','CP2','CP3','CP4'] as const).map(cp => (
                  <th key={cp} className="text-center py-2 px-2 text-slate-500 font-medium">{cp}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(row => (
                <tr key={row.sekolahId} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 pr-4 font-medium max-w-[120px] truncate">{row.sekolahName}</td>
                  {(['cp1','cp2','cp3','cp4'] as const).map(cp => (
                    <td key={cp} className="py-2 px-2 text-center">
                      <button onClick={() => onCellClick(row, cp)} className="hover:opacity-75">
                        <StatusChip status={row[cp]} />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function AlertStrip({ alerts }: { alerts: MCData['alerts'] }) {
  if (alerts.length === 0) return null
  return (
    <div className="sticky bottom-0 bg-red-50 border-t border-red-200 p-3">
      <div className="flex gap-2 overflow-x-auto">
        {alerts.map(a => (
          <div key={a.id} className="flex-shrink-0 bg-white border border-red-200 rounded-lg px-3 py-2 text-xs max-w-[240px]">
            <p className="font-semibold text-red-700">{a.title}</p>
            <p className="text-slate-600 truncate">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MissionControlPage() {
  const [data, setData] = useState<MCData | null>(null)
  const [loading, setLoading] = useState(true)
  const [contactTarget, setContactTarget] = useState<TeamMember | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const { toast } = useToast()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get<MCData>('/mission-control/today')
      setData(res)
    } catch {
      toast({ title: 'Gagal memuat data Mission Control', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()

    const token = Cookies.get('access_token') ?? ''
    if (token) {
      opsClient.connect(token)
      opsClient.on('score:update', () => fetchData())
      opsClient.on('mc:checkpoint:update', () => fetchData())
      opsClient.onPollTick(fetchData)
    }

    return () => {
      opsClient.off('score:update', fetchData)
      opsClient.off('mc:checkpoint:update', fetchData)
    }
  }, [fetchData])

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Memuat...</div>
  if (!data) return null

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <DayHeaderBar data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <TeamStatusGrid team={data.team} onContact={setContactTarget} />
        </div>
        <div className="lg:col-span-1">
          <ScoreLiveCard
            score={data.score}
            streak={data.scoreStreak}
            disbursement={data.disbursementEstimate}
            events={data.scoreEvents}
            onOpenBreakdown={() => setShowBreakdown(true)}
          />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-2 text-xs text-slate-400 items-start justify-center pl-2">
          <p>💡 Skor diperbarui real-time via WebSocket.</p>
          <p>Tap baris sekolah untuk detail checkpoint.</p>
        </div>
      </div>

      <CheckpointMatrix
        matrix={data.cpMatrix}
        onCellClick={(row, cp) =>
          toast({ title: `${row.sekolahName} — ${cp.toUpperCase()}`, description: `Status: ${row[cp]}` })
        }
      />

      <AlertStrip alerts={data.alerts} />

      <Dialog open={!!contactTarget} onOpenChange={() => setContactTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hubungi {contactTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-sm text-slate-500">Peran: {contactTarget?.role}</p>
            <p className={cn('text-sm', contactTarget?.isOnline ? 'text-green-600' : 'text-slate-400')}>
              {contactTarget?.isOnline ? '🟢 Online sekarang' : '⚫ Offline'}
            </p>
            <Button variant="outline" onClick={() => setContactTarget(null)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rincian Skor</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2 max-h-80 overflow-y-auto">
            {data.scoreEvents.length === 0 && (
              <p className="text-sm text-slate-400">Belum ada event hari ini</p>
            )}
            {data.scoreEvents.map(e => (
              <div key={e.id} className="flex items-start justify-between gap-2 p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">{e.reason}</p>
                  <p className="text-xs text-slate-400">{new Date(e.occurredAt).toLocaleTimeString('id-ID')}</p>
                </div>
                <span className={cn('text-sm font-bold', e.scoreDelta < 0 ? 'text-red-600' : 'text-green-600')}>
                  {e.scoreDelta > 0 ? '+' : ''}{e.scoreDelta}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
