"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

type ValidationState = 'loading' | 'polling' | 'pass' | 'pending' | 'fail' | 'manual'

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

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white text-lg">{uploading ? 'Mengunggah foto...' : 'Menyiapkan...'}</p>
        <p className="text-slate-400 text-sm">Mohon tunggu</p>
      </div>
    )
  }

  if (state === 'polling') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white text-lg">Menunggu hasil AI...</p>
        <p className="text-slate-400 text-sm">Foto sudah tersimpan, sedang diverifikasi</p>
      </div>
    )
  }

  if (state === 'pending') {
    return (
      <div className="min-h-screen bg-slate-700 flex flex-col items-center justify-center gap-4 text-white p-6 text-center" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="text-6xl">⏳</div>
        <h1 className="text-2xl font-bold">Foto Tersimpan</h1>
        <p className="text-slate-300 text-sm">Validasi AI masih diproses di server. Anda tetap bisa lanjut — hasilnya akan terlihat nanti di riwayat.</p>
        <Button
          size="lg"
          className="mt-4 bg-white text-slate-800 hover:bg-slate-100 font-bold"
          onClick={() => router.push(`/cp/${cpId}/confirm`)}
        >
          Lanjut ke Konfirmasi →
        </Button>
      </div>
    )
  }

  if (state === 'pass') {
    return (
      <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
        <div className="text-7xl animate-bounce">✅</div>
        <h1 className="text-2xl font-bold">Foto Valid!</h1>
        <p className="text-green-100 text-sm">{aiNotes || 'Foto berhasil divalidasi'}</p>
        <Button
          size="lg"
          className="mt-4 bg-white text-green-700 hover:bg-green-50 font-bold"
          onClick={() => router.push(`/cp/${cpId}/confirm`)}
        >
          Lanjut ke Konfirmasi →
        </Button>
      </div>
    )
  }

  if (state === 'manual') {
    return (
      <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center gap-4 text-white p-6 text-center" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="text-5xl">⚠️</div>
        <h1 className="text-xl font-bold">Foto Gagal 3 Kali</h1>
        <p className="text-slate-300 text-sm">Catatan manual review akan ditambahkan. Penalti -5 diterapkan.</p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={handleRetry}>
            Coba Lagi
          </Button>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold" onClick={handleManualContinue}>
            Lanjutkan dengan Catatan Manual
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-700 flex flex-col items-center justify-center gap-4 text-white p-6 text-center" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="text-6xl">❌</div>
      <h1 className="text-2xl font-bold">Foto Tidak Valid</h1>
      <p className="text-red-100 text-base">{failReason}</p>
      <p className="text-red-200 text-sm">Percobaan {failCount}/3</p>
      <Button
        size="lg"
        className="mt-4 bg-white text-red-700 hover:bg-red-50 font-bold"
        onClick={handleRetry}
      >
        Ambil Foto Ulang →
      </Button>
    </div>
  )
}
