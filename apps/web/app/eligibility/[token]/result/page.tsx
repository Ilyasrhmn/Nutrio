"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, ShieldCheck, Mail, Send } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { api } from "../../../../lib/api-client"

interface DocumentRequirement {
  name: string
  estimatedDays?: number
  estimatedCost?: number
  regulationRef?: string
}

interface RoadmapFlag {
  type: "info" | "warning" | "critical"
  message: string
}

interface PersonalRoadmap {
  docsHave: string[]
  docsInProgress: DocumentRequirement[]
  docsMissing: DocumentRequirement[]
  flags: RoadmapFlag[]
  eligibilityScore: number
  estimatedDaysToReady: number
  recommendedNextStep: string
}

interface EligibilitySession {
  roadmapResult?: PersonalRoadmap
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function ScoreIndicator({ score }: { score: number }) {
  const isGreen = score >= 70
  const isYellow = score >= 40 && score < 70
  const colorClass = isGreen
    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : isYellow
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-red-600 bg-red-50 border-red-200"
  const label = isGreen ? "Siap" : isYellow ? "Perlu Persiapan" : "Perlu Banyak Persiapan"

  return (
    <div className={cn("rounded-3xl border-2 p-6 text-center", colorClass)}>
      <div className="text-6xl font-black leading-none mb-2">{score}</div>
      <div className="text-sm font-bold uppercase tracking-wider opacity-80">Skor Kesiapan</div>
      <div className="mt-2 text-xs font-bold uppercase tracking-widest opacity-60">{label}</div>
    </div>
  )
}

function DocCard({
  doc,
  variant,
}: {
  doc: DocumentRequirement
  variant: "in_progress" | "missing"
}) {
  const accentClass =
    variant === "in_progress"
      ? "border-amber-200 bg-amber-50/50"
      : "border-red-200 bg-red-50/50"

  return (
    <Card className={cn("rounded-2xl border-2", accentClass)}>
      <CardContent className="pt-4 pb-4 space-y-1.5">
        <p className="font-bold text-sm text-foreground">{doc.name}</p>
        {doc.estimatedDays !== undefined && (
          <p className="text-xs text-slate-500 font-medium">
            Estimasi waktu: {doc.estimatedDays} hari
          </p>
        )}
        {doc.estimatedCost !== undefined && (
          <p className="text-xs text-slate-500 font-medium">
            Estimasi biaya: {formatRupiah(doc.estimatedCost)}
          </p>
        )}
        {doc.regulationRef && (
          <p className="text-xs text-slate-400 font-medium italic">{doc.regulationRef}</p>
        )}
      </CardContent>
    </Card>
  )
}

function FlagAlert({ flag }: { flag: RoadmapFlag }) {
  const config = {
    info: {
      icon: "🔵",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    },
    warning: {
      icon: "🟡",
      className: "bg-amber-50 border-amber-200 text-amber-800",
    },
    critical: {
      icon: "🔴",
      className: "bg-red-50 border-red-200 text-red-800",
    },
  }

  const { icon, className } = config[flag.type]

  return (
    <div className={cn("rounded-2xl border p-4 flex items-start gap-3", className)}>
      <span className="text-lg leading-none mt-0.5 flex-shrink-0">{icon}</span>
      <p className="text-sm font-medium leading-relaxed">{flag.message}</p>
    </div>
  )
}

export default function EligibilityResultPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const token = params?.token as string

  const [roadmap, setRoadmap] = React.useState<PersonalRoadmap | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showEmailInput, setShowEmailInput] = React.useState(false)
  const [emailValue, setEmailValue] = React.useState("")

  React.useEffect(() => {
    if (!token) return
    let cancelled = false
    async function fetchResult() {
      try {
        const session = await api.get<EligibilitySession>(`/eligibility/sessions/${token}`)
        if (!cancelled) {
          if (session.roadmapResult) {
            setRoadmap(session.roadmapResult)
          } else {
            setError("Roadmap belum tersedia. Silakan ulangi proses cek kelayakan.")
          }
        }
      } catch {
        if (!cancelled) {
          setError("Gagal memuat hasil. Silakan coba lagi.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchResult()
    return () => {
      cancelled = true
    }
  }, [token])

  const handleSendEmail = () => {
    if (!emailValue || !roadmap) return
    const missing = roadmap.docsMissing.map(d => `- ${d.name}`).join("\n")
    const inProgress = roadmap.docsInProgress.map(d => `- ${d.name}`).join("\n")
    const body = encodeURIComponent(
      `Halo,\n\nBerikut hasil Cek Kelayakan Vendor MBG Anda:\n\nSkor Kesiapan: ${roadmap.eligibilityScore}/100\nEstimasi Siap: ${roadmap.estimatedDaysToReady} hari\n\nLangkah Selanjutnya: ${roadmap.recommendedNextStep}\n\n` +
      (inProgress ? `Dokumen Sedang Diproses:\n${inProgress}\n\n` : "") +
      (missing ? `Dokumen Belum Ada:\n${missing}\n\n` : "") +
      `Mulai persiapan di: ${window.location.origin}/register/vendor?from_eligibility=${token}\n\n— Nutrio MBG`
    )
    window.open(`mailto:${emailValue}?subject=${encodeURIComponent("Hasil Cek Kelayakan Vendor MBG — Nutrio")}&body=${body}`)
    toast({ title: "Email siap dikirim!", description: "Klien email Anda akan terbuka." })
    setShowEmailInput(false)
    setEmailValue("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-sm text-slate-500 font-medium">Memuat hasil...</p>
        </div>
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <p className="text-sm text-red-500 font-medium">{error ?? "Terjadi kesalahan."}</p>
            <Button onClick={() => router.push("/eligibility")} className="rounded-2xl">
              Ulangi Cek Kelayakan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.push("/eligibility")}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
          aria-label="Kembali"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="size-7 bg-primary rounded-lg flex items-center justify-center">
            <ShieldCheck className="size-4 text-primary-foreground" />
          </div>
          <span className="font-black text-foreground text-sm">Nutrio</span>
        </div>
        <h1 className="ml-1 font-bold text-foreground text-sm">Hasil Cek Kelayakan</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Score card */}
        <ScoreIndicator score={roadmap.eligibilityScore} />

        {/* Estimated time */}
        {roadmap.estimatedDaysToReady > 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 text-center">
            <p className="text-sm font-medium text-slate-600">
              Estimasi waktu persiapan:{" "}
              <span className="font-black text-foreground">
                {roadmap.estimatedDaysToReady} hari
              </span>
            </p>
          </div>
        )}

        {/* Recommended next step */}
        <div className="rounded-2xl bg-blue-50 border border-blue-200 px-5 py-4">
          <p className="text-xs font-black text-blue-500 uppercase tracking-wider mb-1">
            Langkah yang Direkomendasikan
          </p>
          <p className="text-sm font-medium text-blue-900 leading-relaxed">
            {roadmap.recommendedNextStep}
          </p>
        </div>

        {/* Flags */}
        {roadmap.flags.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider pl-1">
              Perhatian
            </h2>
            <div className="space-y-2">
              {roadmap.flags.map((flag, i) => (
                <FlagAlert key={i} flag={flag} />
              ))}
            </div>
          </section>
        )}

        {/* Docs have */}
        {roadmap.docsHave.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider pl-1">
              Sudah Anda Miliki ✅
            </h2>
            <div className="flex flex-wrap gap-2">
              {roadmap.docsHave.map((doc, i) => (
                <Badge
                  key={i}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1.5 rounded-full text-xs"
                >
                  {doc}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Docs in progress */}
        {roadmap.docsInProgress.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider pl-1">
              Sedang Diproses ⏳
            </h2>
            <div className="space-y-3">
              {roadmap.docsInProgress.map((doc, i) => (
                <DocCard key={i} doc={doc} variant="in_progress" />
              ))}
            </div>
          </section>
        )}

        {/* Docs missing */}
        {roadmap.docsMissing.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider pl-1">
              Perlu Diurus ⚠️
            </h2>
            <div className="space-y-3">
              {roadmap.docsMissing.map((doc, i) => (
                <DocCard key={i} doc={doc} variant="missing" />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="space-y-3 pt-2 pb-6">
          <Button
            onClick={() => router.push(`/register/vendor?from_eligibility=${token}`)}
            className="w-full h-14 rounded-2xl font-black text-base shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Mulai Persiapan Dokumen
          </Button>
          {showEmailInput ? (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="alamat@email.com"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendEmail() }}
                className="rounded-2xl h-12 flex-1 text-sm"
                autoFocus
              />
              <Button
                onClick={handleSendEmail}
                disabled={!emailValue}
                className="h-12 rounded-2xl px-4 font-bold shadow-none"
              >
                <Send className="size-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowEmailInput(false); setEmailValue("") }}
                className="h-12 rounded-2xl px-4 font-bold text-slate-400"
              >
                ×
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setShowEmailInput(true)}
              className="w-full h-12 rounded-2xl font-bold text-sm text-slate-500 hover:text-foreground hover:bg-slate-100 transition-all gap-2"
            >
              <Mail className="size-4" />
              Kirim ke Email
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
