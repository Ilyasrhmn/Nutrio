"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { api } from "../../../lib/api-client"
import QRCode from "qrcode"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Loader2, MapPin, Camera, QrCode, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@workspace/ui/hooks/use-toast"

type Step = "info" | "gps" | "photo" | "qr" | "done" | "error"

interface DeliveryInfo {
  token: string
  vendorName: string
  schoolId: string
  porsiCount: number
  status: string
  arrivedAt: string | null
  completedAt: string | null
}

export default function KurirDeliveryPage() {
  const params = useParams()
  const token = params?.token as string
  const { toast } = useToast()

  const [step, setStep] = React.useState<Step>("info")
  const [info, setInfo] = React.useState<DeliveryInfo | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("")
  const [errorMsg, setErrorMsg] = React.useState("")
  const fileRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    api.get<DeliveryInfo>(`/delivery/${token}`)
      .then(d => {
        setInfo(d)
        if (d.completedAt) setStep("done")
        else if (d.arrivedAt) setStep("photo")
      })
      .catch(e => {
        setErrorMsg(e?.message ?? "Token tidak valid atau sudah kedaluwarsa")
        setStep("error")
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleGps = async () => {
    setBusy(true)
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      ).catch(() => null)

      await api.post(`/delivery/${token}/arrived`, {
        gpsLat: pos?.coords.latitude,
        gpsLng: pos?.coords.longitude,
      })
      setStep("photo")
    } catch (e: any) {
      toast({ title: "Gagal", description: e?.message ?? "Error", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const form = new FormData()
      form.append("file", file)
      await api.post(`/delivery/${token}/photo`, form)
      const payload = await api.get<{ qrValue: string }>(`/delivery/${token}/qr-payload`)
      const dataUrl = await QRCode.toDataURL(payload.qrValue, { width: 280, margin: 2 })
      setQrDataUrl(dataUrl)
      setStep("qr")
    } catch (e: any) {
      toast({ title: "Gagal upload foto", description: e?.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const handleComplete = async () => {
    setBusy(true)
    try {
      await api.post(`/delivery/${token}/complete`)
      setStep("done")
    } catch (e: any) {
      toast({ title: "Gagal", description: e?.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (step === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
        <AlertCircle className="size-12 text-red-500" />
        <h1 className="text-xl font-bold">Link Tidak Valid</h1>
        <p className="text-slate-500 text-sm">{errorMsg}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="w-full mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Nutrio · Pengiriman MBG</p>
        <h1 className="text-xl font-black mt-1">{info?.vendorName}</h1>
        <p className="text-sm text-slate-500">{info?.porsiCount} porsi → {info?.schoolId}</p>
      </div>

      {/* Steps */}
      <div className="flex gap-1 w-full mb-6">
        {(["info","gps","photo","qr","done"] as Step[]).map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${
            step === "done" || (["info","gps","photo","qr","done"].indexOf(step) > i) ? "bg-green-500" :
            step === s ? "bg-primary" : "bg-slate-200"
          }`} />
        ))}
      </div>

      {step === "info" && (
        <Card className="w-full">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Vendor</span>
                <span className="font-bold">{info?.vendorName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-slate-500">Sekolah</span>
                <span className="font-bold">{info?.schoolId}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Jumlah Porsi</span>
                <span className="font-bold">{info?.porsiCount} porsi</span>
              </div>
            </div>
            <Button className="w-full h-12 font-bold" onClick={() => setStep("gps")}>
              Mulai Pengiriman →
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "gps" && (
        <Card className="w-full">
          <CardContent className="pt-6 space-y-4 text-center">
            <MapPin className="size-12 text-primary mx-auto" />
            <h2 className="font-bold text-lg">Catat Lokasi Tiba</h2>
            <p className="text-sm text-slate-500">Klik tombol di bawah untuk merekam lokasi GPS saat tiba di sekolah.</p>
            <Button className="w-full h-12 font-bold" onClick={handleGps} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <>
                <MapPin className="size-4 mr-2" /> Rekam GPS Sekarang
              </>}
            </Button>
            <Button variant="ghost" className="w-full text-xs text-slate-400" onClick={() => {
              api.post(`/delivery/${token}/arrived`).then(() => setStep("photo")).catch(() => {})
            }}>
              Lewati (GPS tidak tersedia)
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "photo" && (
        <Card className="w-full">
          <CardContent className="pt-6 space-y-4 text-center">
            <Camera className="size-12 text-primary mx-auto" />
            <h2 className="font-bold text-lg">Foto Serah Terima</h2>
            <p className="text-sm text-slate-500">Ambil foto saat menyerahkan makanan ke pihak sekolah.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhoto}
            />
            <Button className="w-full h-12 font-bold" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <>
                <Camera className="size-4 mr-2" /> Ambil Foto
              </>}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "qr" && (
        <Card className="w-full">
          <CardContent className="pt-6 space-y-4 text-center">
            <QrCode className="size-8 text-primary mx-auto" />
            <h2 className="font-bold text-lg">Tunjukkan QR ke Sekolah</h2>
            <p className="text-sm text-slate-500">Minta pihak sekolah scan QR ini untuk konfirmasi penerimaan.</p>
            {qrDataUrl && (
              <div className="flex justify-center p-4 bg-white rounded-2xl border">
                <img src={qrDataUrl} alt="QR Code" className="w-52 h-52" />
              </div>
            )}
            <Button className="w-full h-12 font-bold bg-green-600 hover:bg-green-700" onClick={handleComplete} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Selesai Pengiriman ✓"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "done" && (
        <div className="text-center space-y-4">
          <CheckCircle2 className="size-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-black text-green-700">Pengiriman Selesai!</h2>
          <p className="text-slate-500 text-sm">Makanan telah diserahkan. Menunggu konfirmasi dari sekolah.</p>
        </div>
      )}
    </div>
  )
}
