"use client"

import * as React from "react"
import Link from "next/link"
import {
  Package, ChefHat, BoxSelect, Truck,
  CheckCircle2, Lock, Upload, RefreshCw,
  Loader2, Brain, ExternalLink,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { api } from "../../../../lib/api-client"

interface CpEvent {
  id: string
  cpType: "CP1" | "CP2" | "CP3" | "CP4"
  cpStatus: "pending" | "in_progress" | "done" | "failed" | "force_closed"
  photos: Array<{ fileKey: string; fileUrl: string }>
  aiValidation: { pass: boolean; reason: string; confidence: number } | null
  completedAt: string | null
}

type CpKey = "CP1" | "CP2" | "CP3" | "CP4"

const CP_META: Record<CpKey, { label: string; Icon: React.ElementType; hint: string; deadline: string; iconBg: string; text: string; bg: string; ring: string; badgeCn: string; dashedCn: string; cardBorderActive: string }> = {
  CP1: {
    label: "Penerimaan Bahan Baku", Icon: Package, deadline: "sebelum 10:00",
    hint: "Foto tumpukan bahan baku yang baru diterima dari pemasok",
    iconBg: "bg-blue-100 text-blue-600", text: "text-blue-700", bg: "bg-blue-50",
    ring: "ring-2 ring-blue-200", badgeCn: "bg-blue-50 text-blue-700 border-blue-100",
    dashedCn: "border-blue-200 hover:border-blue-400 hover:bg-blue-50",
    cardBorderActive: "border-blue-200 shadow-md shadow-blue-100/50",
  },
  CP2: {
    label: "Produksi Makanan", Icon: ChefHat, deadline: "sebelum 12:00",
    hint: "Foto makanan yang sedang atau telah selesai dimasak",
    iconBg: "bg-orange-100 text-orange-600", text: "text-orange-700", bg: "bg-orange-50",
    ring: "ring-2 ring-orange-200", badgeCn: "bg-orange-50 text-orange-700 border-orange-100",
    dashedCn: "border-orange-200 hover:border-orange-400 hover:bg-orange-50",
    cardBorderActive: "border-orange-200 shadow-md shadow-orange-100/50",
  },
  CP3: {
    label: "Pengemasan & Pelabelan", Icon: BoxSelect, deadline: "sebelum 13:00",
    hint: "Foto box makanan yang sudah dikemas dan berlabel QR",
    iconBg: "bg-purple-100 text-purple-600", text: "text-purple-700", bg: "bg-purple-50",
    ring: "ring-2 ring-purple-200", badgeCn: "bg-purple-50 text-purple-700 border-purple-100",
    dashedCn: "border-purple-200 hover:border-purple-400 hover:bg-purple-50",
    cardBorderActive: "border-purple-200 shadow-md shadow-purple-100/50",
  },
  CP4: {
    label: "Distribusi & Konfirmasi", Icon: Truck, deadline: "sebelum 14:00",
    hint: "Foto kendaraan atau proses pengiriman ke sekolah",
    iconBg: "bg-emerald-100 text-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50",
    ring: "ring-2 ring-emerald-200", badgeCn: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dashedCn: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
    cardBorderActive: "border-emerald-200 shadow-md shadow-emerald-100/50",
  },
}

const CP_ORDER: CpKey[] = ["CP1", "CP2", "CP3", "CP4"]

export default function CheckpointsPage() {
  const { toast } = useToast()
  const [cpMap, setCpMap] = React.useState<Partial<Record<CpKey, CpEvent>>>({})
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState<CpKey | null>(null)
  const [selectedFiles, setSelectedFiles] = React.useState<Partial<Record<CpKey, File>>>({})
  const [previews, setPreviews] = React.useState<Partial<Record<CpKey, string>>>({})
  const fileRefs = React.useRef<Partial<Record<CpKey, HTMLInputElement | null>>>({})

  const today = new Date().toISOString().split("T")[0]!

  const fetchCheckpoints = React.useCallback(async () => {
    try {
      const events = await api.get<CpEvent[]>("/checkpoints/today")
      const map: Partial<Record<CpKey, CpEvent>> = {}
      for (const ev of events ?? []) map[ev.cpType] = ev
      setCpMap(map)
    } catch {
      // no vendor or API error
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchCheckpoints() }, [fetchCheckpoints])

  const isDone = (cp: CpKey) => cpMap[cp]?.cpStatus === "done"
  const isLocked = (cp: CpKey) => {
    const idx = CP_ORDER.indexOf(cp)
    return idx > 0 && !isDone(CP_ORDER[idx - 1]!)
  }

  const handleFileChange = (cp: CpKey, file: File) => {
    setSelectedFiles(prev => ({ ...prev, [cp]: file }))
    setPreviews(prev => ({ ...prev, [cp]: URL.createObjectURL(file) }))
  }

  const handleSubmit = async (cp: CpKey) => {
    const file = selectedFiles[cp]
    if (!file) return
    setSubmitting(cp)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      await api.post(`/checkpoints/${cp}/submit`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast({ title: `${cp} berhasil dikirim!` })
      setSelectedFiles(prev => ({ ...prev, [cp]: undefined }))
      setPreviews(prev => ({ ...prev, [cp]: undefined }))
      await fetchCheckpoints()
    } catch (e: any) {
      toast({ title: e?.message ?? "Gagal submit checkpoint", variant: "destructive" })
    } finally {
      setSubmitting(null)
    }
  }

  const doneCount = CP_ORDER.filter(isDone).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Checkpoint Harian</h1>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">{doneCount} dari 4 checkpoint selesai</p>
        </div>
        <div className="flex items-center gap-2">
          {doneCount === 4 && (
            <Link href={`/portal/debrief/${today}`}>
              <Button variant="outline" className="gap-2 rounded-full font-bold text-sm h-9">
                <ExternalLink className="size-3.5" />
                Lihat Debrief
              </Button>
            </Link>
          )}
          <Button variant="ghost" onClick={fetchCheckpoints} className="rounded-full font-bold text-sm gap-2 text-muted-foreground h-9">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Progress stepper */}
      <div className="flex items-center gap-1 sm:gap-2">
        {CP_ORDER.map((cp, i) => {
          const done = isDone(cp)
          const active = !done && !isLocked(cp)
          const meta = CP_META[cp]
          return (
            <React.Fragment key={cp}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "size-10 rounded-full flex items-center justify-center border-2 transition-all",
                  done && "bg-emerald-500 border-emerald-500 text-white",
                  active && cn(meta.iconBg, meta.ring, "border-transparent"),
                  !done && !active && "bg-slate-100 border-slate-200 text-slate-300",
                )}>
                  {done ? <CheckCircle2 className="size-5" /> : <meta.Icon className="size-4" />}
                </div>
                <span className={cn(
                  "text-[10px] font-black",
                  done ? "text-emerald-600" : active ? meta.text : "text-slate-400",
                )}>{cp}</span>
              </div>
              {i < 3 && (
                <div className={cn("h-0.5 flex-1 rounded-full mt-[-14px] transition-all", done ? "bg-emerald-400" : "bg-slate-200")} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* CP Cards */}
      <div className="space-y-4">
        {CP_ORDER.map((cp) => {
          const meta = CP_META[cp]
          const done = isDone(cp)
          const locked = isLocked(cp)
          const active = !done && !locked
          const event = cpMap[cp]

          return (
            <Card
              key={cp}
              className={cn(
                "rounded-2xl border transition-all overflow-hidden",
                done && "border-emerald-200 bg-emerald-50/20",
                active && meta.cardBorderActive,
                locked && "border-slate-100 bg-slate-50/50 opacity-60",
              )}
            >
              {/* Card header row */}
              <div className={cn("flex items-center gap-4 p-5", done && "bg-emerald-50/40", active && meta.bg + "/20")}>
                <div className={cn(
                  "size-12 rounded-2xl flex items-center justify-center shrink-0",
                  done && "bg-emerald-100 text-emerald-600",
                  active && meta.iconBg,
                  locked && "bg-slate-100 text-slate-300",
                )}>
                  {done ? <CheckCircle2 className="size-6" /> : locked ? <Lock className="size-5" /> : <meta.Icon className="size-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm leading-tight">
                    {cp} — {meta.label}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {locked ? "Selesaikan checkpoint sebelumnya terlebih dahulu" : `Deadline: ${meta.deadline}`}
                  </p>
                </div>
                <Badge className={cn(
                  "font-bold text-[10px] uppercase shrink-0 border",
                  done && "bg-emerald-100 text-emerald-700 border-emerald-200",
                  active && meta.badgeCn,
                  locked && "bg-slate-100 text-slate-400 border-slate-200",
                )}>
                  {done ? "Selesai ✓" : locked ? "Terkunci" : "Menunggu"}
                </Badge>
              </div>

              {/* Done — show photo + AI validation */}
              {done && event && (
                <CardContent className="px-5 pb-5 pt-0">
                  <div className="border-t border-emerald-100 pt-4 flex flex-col sm:flex-row gap-4">
                    {event.photos[0]?.fileUrl && (
                      <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        <img src={event.photos[0].fileUrl} alt={`Foto ${cp}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      {event.completedAt && (
                        <p className="text-xs font-bold text-slate-500">
                          Selesai pukul {new Date(event.completedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {event.aiValidation ? (
                        <div className={cn(
                          "flex items-start gap-2 p-3 rounded-xl border text-xs font-medium",
                          event.aiValidation.pass
                            ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                            : "bg-red-50 border-red-100 text-red-800",
                        )}>
                          <Brain className="size-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black">
                              {event.aiValidation.pass ? "AI: Foto Valid" : "AI: Foto Perlu Perbaikan"}
                            </span>
                            <span className="ml-1.5 text-[10px] opacity-60">
                              ({Math.round(event.aiValidation.confidence * 100)}%)
                            </span>
                            <p className="mt-0.5 opacity-80 leading-snug">{event.aiValidation.reason}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                          <Brain className="size-3.5 animate-pulse" />
                          Validasi AI sedang diproses...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}

              {/* Active — file upload form */}
              {active && (
                <CardContent className="px-5 pb-5 pt-0">
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-[11px] text-slate-500 font-medium">💡 {meta.hint}</p>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={el => { fileRefs.current[cp] = el }}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFileChange(cp, file)
                      }}
                    />

                    {previews[cp] ? (
                      <div className="space-y-3">
                        <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-50">
                          <img src={previews[cp]} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              setPreviews(p => ({ ...p, [cp]: undefined }))
                              setSelectedFiles(f => ({ ...f, [cp]: undefined }))
                            }}
                            className="absolute top-2 right-2 size-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors text-xs font-black leading-none"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => fileRefs.current[cp]?.click()}
                            className="rounded-xl font-bold text-xs h-10 flex-1"
                          >
                            <Upload className="size-3.5 mr-1.5" />
                            Ganti Foto
                          </Button>
                          <Button
                            onClick={() => handleSubmit(cp)}
                            disabled={submitting === cp}
                            className="rounded-xl font-black h-10 flex-1 shadow-lg shadow-primary/15"
                          >
                            {submitting === cp ? (
                              <><RefreshCw className="size-3.5 animate-spin mr-1.5" />Mengirim...</>
                            ) : (
                              `Kirim ${cp} →`
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRefs.current[cp]?.click()}
                        className={cn(
                          "w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all text-slate-400 hover:text-slate-600",
                          meta.dashedCn,
                        )}
                      >
                        <Upload className="size-7" />
                        <div className="text-center">
                          <p className="text-sm font-bold">Klik untuk memilih foto</p>
                          <p className="text-xs mt-0.5">JPG, PNG, WEBP — maks. 10 MB</p>
                        </div>
                      </button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* All done — debrief CTA */}
      {doneCount === 4 && (
        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl text-center space-y-3">
          <div className="text-4xl">🎉</div>
          <p className="font-black text-emerald-800 text-lg">Semua Checkpoint Selesai!</p>
          <p className="text-sm text-emerald-700 font-medium">
            Debrief harian dan estimasi pencairan dana sudah tersedia.
          </p>
          <Link href={`/portal/debrief/${today}`}>
            <Button className="rounded-full font-black px-8 shadow-lg shadow-emerald-200 mt-2">
              Lihat Debrief Hari Ini →
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
