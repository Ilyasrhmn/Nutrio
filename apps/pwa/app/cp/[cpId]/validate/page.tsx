"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { enqueueCheckpointSubmit, isNetworkFailure } from "@/lib/offline-queue"
import { Loader2, CheckCircle2, XCircle, AlertTriangle, WifiOff, Clock } from "lucide-react"

type ValidationState = 'loading' | 'polling' | 'pass' | 'pending' | 'queued' | 'fail' | 'manual'

interface CheckpointEvent {
  cpType: string
  scoreDelta: number
  aiValidation: { pass: boolean; reason: string; confidence: number } | null
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function pollForAiValidation(cpType: string, attempts = 6, delayMs = 2000) {
  for (let i = 0; i < attempts; i++) {
    await sleep(delayMs)
    try {
      const res = await apiClient.get<CheckpointEvent[]>('/checkpoints/today')
      const match = res.data.find((cp) => cp.cpType === cpType)
      if (match?.aiValidation) return match.aiValidation
    } catch {
      // keep polling
    }
  }
  return null
}

export default function CPValidatePage() {
  const { cpId } = useParams<{ cpId: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<ValidationState>('loading')
  const [failReason, setFailReason] = useState('')
  const [failCount, setFailCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [aiNotes, setAiNotes] = useState('')

  const uploadAndValidate = async () => {
    setState('loading')
    const dataUrl = sessionStorage.getItem(`capture_${cpId}`)
    if (!dataUrl) {
      toast({ title: 'Foto tidak ditemukan, ambil ulang', variant: 'destructive' })
      router.push(`/cp/${cpId}/capture`)
      return
    }

    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `${cpId}.jpg`, { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('photo', file)

      setUploading(true)
      await apiClient.post(`/checkpoints/${cpId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploading(false)

      sessionStorage.removeItem(`capture_${cpId}`)
      sessionStorage.removeItem(`capture_${cpId}_type`)

      // Upload succeeded, but AI validation runs async server-side —
      // poll for the real result instead of assuming it passed.
      setState('polling')
      const validation = await pollForAiValidation(cpId)
      if (!validation) {
        setState('pending')
      } else if (validation.pass) {
        setAiNotes(validation.reason)
        setState('pass')
      } else {
        setAiNotes(validation.reason)
        setFailReason(validation.reason)
        const newCount = failCount + 1
        setFailCount(newCount)
        setState(newCount >= 3 ? 'manual' : 'fail')
      }
    } catch (err: unknown) {
      setUploading(false)

      if (isNetworkFailure(err)) {
        try {
          const res = await fetch(dataUrl)
          const blob = await res.blob()
          await enqueueCheckpointSubmit({ cpId, photoBlob: blob, photoType: 'image/jpeg' })
          sessionStorage.removeItem(`capture_${cpId}`)
          sessionStorage.removeItem(`capture_${cpId}_type`)
          setState('queued')
          return
        } catch {
          // fall through to normal failure handling below
        }
      }

      const axiosError = err as { response?: { data?: { message?: string } } }
      const msg: string = axiosError?.response?.data?.message ?? 'Validasi gagal'
      setFailReason(msg)
      const newCount = failCount + 1
      setFailCount(newCount)
      if (newCount >= 3) {
        setState('manual')
      } else {
        setState('fail')
      }
    }
  }

  useEffect(() => { uploadAndValidate() }, [])

  const handleRetry = () => {
    router.push(`/cp/${cpId}/capture`)
  }

  const handleManualContinue = async () => {
    const dataUrl = sessionStorage.getItem(`capture_${cpId}`)
    if (dataUrl) {
      try {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        const file = new File([blob], `${cpId}.jpg`, { type: 'image/jpeg' })
        const formData = new FormData()
        formData.append('photo', file)
        formData.append('notes', 'Manual review — 3x AI validation failed')
        await apiClient.post(`/checkpoints/${cpId}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } catch {
        // Submit anyway, error is non-fatal for manual review
      }
    }
    router.push(`/cp/${cpId}/confirm`)
  }

  if (state === 'loading' || state === 'polling') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="border-none shadow-sm w-full max-w-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="font-bold text-slate-900">
              {state === 'polling' ? 'Menunggu hasil AI...' : uploading ? 'Mengunggah foto...' : 'Menyiapkan...'}
            </p>
            <p className="text-sm text-slate-500">
              {state === 'polling' ? 'Foto sudah tersimpan, sedang diverifikasi' : 'Mohon tunggu'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === 'queued') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="border-none shadow-sm w-full max-w-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <WifiOff className="h-7 w-7" />
            </div>
            <p className="font-bold text-slate-900">Tersimpan Offline</p>
            <p className="text-sm text-slate-500">Tidak ada koneksi internet. Foto disimpan di perangkat dan akan otomatis terkirim saat online kembali.</p>
            <Button size="lg" className="w-full mt-2" onClick={() => router.push(`/cp/${cpId}/confirm`)}>
              Lanjut ke Konfirmasi →
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="border-none shadow-sm w-full max-w-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Clock className="h-7 w-7" />
            </div>
            <p className="font-bold text-slate-900">Foto Tersimpan</p>
            <p className="text-sm text-slate-500">Validasi AI masih diproses di server. Anda tetap bisa lanjut — hasilnya akan terlihat nanti di riwayat.</p>
            <Button size="lg" className="w-full mt-2" onClick={() => router.push(`/cp/${cpId}/confirm`)}>
              Lanjut ke Konfirmasi →
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === 'pass') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="border-none shadow-sm w-full max-w-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="font-bold text-slate-900">Foto Valid!</p>
            <p className="text-sm text-slate-500">{aiNotes || 'Foto berhasil divalidasi'}</p>
            <Button size="lg" className="w-full mt-2 bg-green-600 hover:bg-green-700" onClick={() => router.push(`/cp/${cpId}/confirm`)}>
              Lanjut ke Konfirmasi →
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === 'manual') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="border-none shadow-sm w-full max-w-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <p className="font-bold text-slate-900">Foto Gagal 3 Kali</p>
            <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Penalti -5 poin</Badge>
            <p className="text-sm text-slate-500">Catatan manual review akan ditambahkan.</p>
            <div className="flex gap-3 w-full mt-2">
              <Button variant="outline" className="flex-1" onClick={handleRetry}>
                Coba Lagi
              </Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleManualContinue}>
                Lanjutkan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="border-none shadow-sm w-full max-w-sm">
        <CardContent className="p-8 flex flex-col items-center text-center gap-3">
          <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <XCircle className="h-7 w-7" />
          </div>
          <p className="font-bold text-slate-900">Foto Tidak Valid</p>
          <p className="text-sm text-slate-500">{failReason}</p>
          <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">Percobaan {failCount}/3</Badge>
          <Button size="lg" className="w-full mt-2" onClick={handleRetry}>
            Ambil Foto Ulang →
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
