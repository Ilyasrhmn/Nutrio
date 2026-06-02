"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@workspace/ui/hooks/use-toast"

export default function CPCapturePage() {
  const { cpId } = useParams<{ cpId: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraReady, setCameraReady] = useState(false)
  const [capturing, setCapturing] = useState(false)

  const startCamera = async (mode: 'environment' | 'user') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch {
      toast({ title: 'Kamera tidak tersedia', description: 'Izinkan akses kamera untuk melanjutkan', variant: 'destructive' })
    }
  }

  useEffect(() => {
    startCamera(facingMode)
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [facingMode])

  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLInputElement && target.type === 'file') {
        e.preventDefault()
        e.stopPropagation()
        toast({ title: 'Foto harus diambil langsung dari kamera', variant: 'destructive' })
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [toast])

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return
    setCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) { setCapturing(false); return }
      const file = new File([blob], `${cpId}-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const reader = new FileReader()
      reader.onload = () => {
        sessionStorage.setItem(`capture_${cpId}`, reader.result as string)
        sessionStorage.setItem(`capture_${cpId}_type`, file.type)
        setCapturing(false)
        router.push(`/cp/${cpId}/validate`)
      }
      reader.readAsDataURL(file)
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute top-4 left-4">
          <span className="bg-black/60 text-white text-sm px-3 py-1 rounded-full">{cpId}</span>
        </div>

        <button
          onClick={() => setFacingMode(m => m === 'environment' ? 'user' : 'environment')}
          className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full text-xl"
          aria-label="Flip camera"
        >
          🔄
        </button>

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm"
        >
          ← Kembali
        </button>
      </div>

      <div className="bg-black py-8 flex items-center justify-center">
        <button
          onClick={handleCapture}
          disabled={!cameraReady || capturing}
          className="w-20 h-20 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 disabled:opacity-50 transition-all flex items-center justify-center"
          aria-label="Ambil foto"
        >
          {capturing ? (
            <span className="text-white text-2xl">⏳</span>
          ) : (
            <span className="w-14 h-14 bg-white rounded-full block" />
          )}
        </button>
      </div>
    </div>
  )
}
