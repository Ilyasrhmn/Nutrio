"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { Button } from "@workspace/ui/components/button"
import { ImageIcon } from "lucide-react"

export default function CPCapturePage() {
  const { cpId } = useParams<{ cpId: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraDenied, setCameraDenied] = useState(false)
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
        setCameraDenied(false)
      }
    } catch {
      setCameraDenied(true)
      toast({ title: 'Kamera tidak tersedia', description: 'Izinkan akses kamera, atau unggah foto dari galeri di bawah', variant: 'destructive' })
    }
  }

  useEffect(() => {
    startCamera(facingMode)
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [facingMode])

  const saveAndGoToValidate = (dataUrl: string, mimeType: string) => {
    sessionStorage.setItem(`capture_${cpId}`, dataUrl)
    sessionStorage.setItem(`capture_${cpId}_type`, mimeType)
    router.push(`/cp/${cpId}/validate`)
  }

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
        setCapturing(false)
        saveAndGoToValidate(reader.result as string, file.type)
      }
      reader.readAsDataURL(file)
    }, 'image/jpeg', 0.9)
  }

  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Foto terlalu besar', description: 'Maksimal 10MB', variant: 'destructive' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => saveAndGoToValidate(reader.result as string, file.type)
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        {cameraDenied ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-white/60">
              <ImageIcon className="h-10 w-10" />
            </div>
            <div>
              <p className="text-white font-bold">Kamera tidak bisa diakses</p>
              <p className="text-slate-400 text-sm mt-1">Izinkan akses kamera di pengaturan browser, atau unggah foto dari galeri.</p>
            </div>
            <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => startCamera(facingMode)}>
              Coba Kamera Lagi
            </Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        )}
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute top-4 left-4">
          <span className="bg-black/60 text-white text-sm px-3 py-1 rounded-full">{cpId}</span>
        </div>

        {!cameraDenied && (
          <button
            onClick={() => setFacingMode(m => m === 'environment' ? 'user' : 'environment')}
            className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full text-xl"
            aria-label="Flip camera"
          >
            🔄
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm"
        >
          ← Kembali
        </button>
      </div>

      <div className="bg-black py-8 flex flex-col items-center justify-center gap-4">
        {!cameraDenied && (
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
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileFallback}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-slate-400 text-xs font-medium underline underline-offset-2"
        >
          {cameraDenied ? 'Unggah Foto dari Galeri' : 'Kamera bermasalah? Unggah foto'}
        </button>
      </div>
    </div>
  )
}
