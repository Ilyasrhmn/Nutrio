"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { api } from "../../../../lib/api-client"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Loader2, CheckCircle2, AlertCircle, Package, Utensils } from "lucide-react"

interface DeliveryInfo {
  vendorName: string
  schoolId: string
  porsiCount: number
  status: string
}

const PROBLEMS = ["Porsi kurang", "Makanan tidak layak", "Kemasan rusak", "Terlambat datang"]

type Stage = "loading" | "form" | "done" | "error"

export default function SchoolConfirmPage() {
  const params = useParams()
  const qrToken = params?.qrToken as string

  const [stage, setStage] = React.useState<Stage>("loading")
  const [info, setInfo] = React.useState<DeliveryInfo | null>(null)
  const [errorMsg, setErrorMsg] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [jumlah, setJumlah] = React.useState(0)
  const [kondisi, setKondisi] = React.useState<"baik" | "ada_masalah" | null>(null)
  const [masalah, setMasalah] = React.useState<string[]>([])
  const [catatan, setCatatan] = React.useState("")

  React.useEffect(() => {
    api.get<DeliveryInfo>(`/sekolah/confirm/${qrToken}`)
      .then(d => { setInfo(d); setJumlah(d.porsiCount); setStage("form") })
      .catch(e => { setErrorMsg(e?.message ?? "Token tidak valid"); setStage("error") })
  }, [qrToken])

  const toggleMasalah = (item: string) =>
    setMasalah(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])

  const handleSubmit = async () => {
    if (!kondisi) return
    setBusy(true)
    try {
      await api.post(`/sekolah/confirm/${qrToken}`, {
        jumlahDiterima: jumlah,
        kondisi,
        masalahJenis: kondisi === "ada_masalah" ? masalah : [],
        catatan: catatan || undefined,
      })
      setStage("done")
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Gagal mengkonfirmasi"); setStage("error")
    } finally {
      setBusy(false)
    }
  }

  if (stage === "loading") return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>

  if (stage === "error") return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
      <AlertCircle className="size-12 text-red-500" />
      <h1 className="text-xl font-bold">Tidak Dapat Dikonfirmasi</h1>
      <p className="text-slate-500 text-sm">{errorMsg}</p>
    </div>
  )

  if (stage === "done") return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4 bg-green-50">
      <CheckCircle2 className="size-16 text-green-600" />
      <h1 className="text-2xl font-black text-green-700">Konfirmasi Berhasil!</h1>
      <p className="text-slate-600 text-sm max-w-xs">Penerimaan makanan telah tercatat. Terima kasih telah ikut menjaga kualitas program MBG.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-sm mx-auto space-y-4 pb-10">
      <div className="pt-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Konfirmasi Penerimaan MBG</p>
        <h1 className="text-lg font-black mt-1">{info?.vendorName}</h1>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Utensils className="size-4 text-green-600 shrink-0" />
            <div><p className="text-xs text-slate-400 font-bold uppercase">Vendor</p><p className="font-bold">{info?.vendorName}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="size-4 text-green-600 shrink-0" />
            <div><p className="text-xs text-slate-400 font-bold uppercase">Target Porsi</p><p className="font-bold">{info?.porsiCount} porsi</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-700">Porsi Diterima</p>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setJumlah(j => Math.max(0, j - 1))}>−</Button>
          <span className="text-2xl font-black w-16 text-center">{jumlah}</span>
          <Button variant="outline" size="icon" onClick={() => setJumlah(j => j + 1)}>+</Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-700">Kondisi Makanan</p>
        <div className="grid grid-cols-2 gap-2">
          {(["baik", "ada_masalah"] as const).map(k => (
            <button key={k} onClick={() => { setKondisi(k); if (k === "baik") setMasalah([]) }}
              className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${kondisi === k
                ? k === "baik" ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-slate-600"}`}>
              {k === "baik" ? "✅ Baik" : "⚠️ Ada Masalah"}
            </button>
          ))}
        </div>
      </div>

      {kondisi === "ada_masalah" && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-700">Jenis Masalah</p>
          <div className="grid grid-cols-2 gap-2">
            {PROBLEMS.map(p => (
              <button key={p} onClick={() => toggleMasalah(p)}
                className={`p-3 rounded-xl border-2 text-xs font-bold text-left transition-all ${masalah.includes(p) ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600"}`}>
                {masalah.includes(p) ? "☑ " : "☐ "}{p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-700">Catatan (opsional)</p>
        <textarea className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Contoh: 2 porsi tumpah saat pengiriman" value={catatan} onChange={e => setCatatan(e.target.value)} />
      </div>

      <Button className="w-full h-14 font-black text-base" disabled={!kondisi || busy} onClick={handleSubmit}>
        {busy ? <Loader2 className="size-5 animate-spin" /> : "Konfirmasi Penerimaan"}
      </Button>
    </div>
  )
}
