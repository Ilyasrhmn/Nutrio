"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { api } from "../../lib/api-client"

const QUESTIONS = [
  {
    id: "q1_business_type",
    text: "Apa tipe badan usaha Anda?",
    hint: undefined,
    options: [
      { value: "pt", label: "PT (Perseroan Terbatas)" },
      { value: "cv", label: "CV (Commanditaire Vennootschap)" },
      { value: "koperasi", label: "Koperasi" },
      { value: "yayasan", label: "Yayasan / Perkumpulan" },
      { value: "perorangan", label: "Perorangan / UMKM" },
    ],
  },
  {
    id: "q2_nib_status",
    text: "Apakah usaha Anda sudah memiliki NIB (Nomor Induk Berusaha)?",
    hint: "NIB diterbitkan melalui OSS (Online Single Submission) dan wajib untuk semua usaha.",
    options: [
      { value: "active", label: "Sudah memiliki NIB aktif" },
      { value: "in_progress", label: "Sedang proses di OSS" },
      { value: "none", label: "Belum memiliki NIB" },
    ],
  },
  {
    id: "q3_npwp_status",
    text: "Apakah Anda sudah memiliki NPWP / NPWP Badan?",
    hint: "NPWP diperlukan untuk pembayaran dana MBG dari BGN.",
    options: [
      { value: "active", label: "Sudah memiliki dan aktif" },
      { value: "in_progress", label: "Sedang mengurus" },
      { value: "none", label: "Belum memiliki" },
    ],
  },
  {
    id: "q4_slhs_status",
    text: "Apakah dapur Anda memiliki SLHS (Sertifikat Laik Higiene Sanitasi) dari Dinas Kesehatan?",
    hint: "SLHS membuktikan dapur Anda memenuhi standar sanitasi pangan.",
    options: [
      { value: "active", label: "Sudah memiliki dan masih berlaku" },
      { value: "expired", label: "Sudah ada tapi perlu diperpanjang" },
      { value: "none", label: "Belum memiliki" },
    ],
  },
  {
    id: "q5_halal_status",
    text: "Apakah dapur/produk Anda sudah memiliki Sertifikasi Halal dari BPJPH/MUI?",
    hint: "Sertifikasi halal diprioritaskan BGN untuk sekolah-sekolah tertentu.",
    options: [
      { value: "certified", label: "Sudah bersertifikat halal" },
      { value: "in_progress", label: "Sedang dalam proses sertifikasi" },
      { value: "none", label: "Belum memiliki" },
    ],
  },
  {
    id: "q6_daily_capacity",
    text: "Berapa kapasitas produksi harian dapur Anda?",
    hint: "BGN menetapkan minimum 500 porsi/hari untuk vendor aktif.",
    options: [
      { value: "below_500", label: "Di bawah 500 porsi/hari" },
      { value: "500_1000", label: "500 – 1.000 porsi/hari" },
      { value: "1001_2000", label: "1.001 – 2.000 porsi/hari" },
      { value: "above_2000", label: "Di atas 2.000 porsi/hari" },
    ],
  },
  {
    id: "q7_operating_area",
    text: "Di wilayah mana Anda akan beroperasi?",
    hint: "Pilih zona terdekat untuk mendapat informasi sekolah mitra di area Anda.",
    options: [
      { value: "jabodetabek", label: "Jakarta & Sekitarnya (Jabodetabek)" },
      { value: "jabar", label: "Jawa Barat (di luar Jabodetabek)" },
      { value: "jateng_diy", label: "Jawa Tengah & DIY" },
      { value: "jatim", label: "Jawa Timur" },
      { value: "sumatera", label: "Sumatera" },
      { value: "other", label: "Kalimantan, Sulawesi, atau wilayah lainnya" },
    ],
  },
]

export default function EligibilityWizardPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = React.useState(1)
  const [sessionToken, setSessionToken] = React.useState<string | null>(null)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [initError, setInitError] = React.useState<string | null>(null)

  const questionIndex = currentStep - 1
  const currentQuestion = QUESTIONS[questionIndex]
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined
  const totalSteps = QUESTIONS.length
  const progressValue = (currentStep / totalSteps) * 100
  const isLastStep = currentStep === totalSteps

  // Init session on mount
  React.useEffect(() => {
    let cancelled = false
    async function initSession() {
      try {
        const data = await api.post<{ sessionToken: string }>("/eligibility/sessions")
        if (!cancelled) setSessionToken(data.sessionToken)
      } catch {
        if (!cancelled) {
          setInitError("Gagal memulai sesi. Silakan muat ulang halaman.")
        }
      }
    }
    initSession()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSelectOption = (value: string) => {
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  const handleNext = async () => {
    if (!selectedAnswer || !sessionToken || !currentQuestion) return

    setIsLoading(true)
    try {
      await api.patch(`/eligibility/sessions/${sessionToken}`, {
        questionId: currentQuestion.id,
        answer: selectedAnswer,
      })

      if (isLastStep) {
        // Generate roadmap
        await api.post(`/eligibility/sessions/${sessionToken}/generate`)
        router.push(`/eligibility/${sessionToken}/result`)
      } else {
        setCurrentStep((s) => s + 1)
      }
    } catch {
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal menyimpan jawaban. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    } else {
      router.push("/")
    }
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <p className="text-sm text-red-500 font-medium">{initError}</p>
            <Button onClick={() => window.location.reload()} className="rounded-2xl">
              Muat Ulang
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={handleBack}
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
        <div className="ml-auto text-xs font-bold text-slate-400">
          Langkah {currentStep} dari {totalSteps}
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-white border-b border-slate-100 px-4 pb-3 pt-1">
        <Progress value={progressValue} className="h-2 rounded-full" />
        <p className="text-[11px] font-bold text-slate-400 mt-2 text-center tracking-wide uppercase">
          Cek Kelayakan Vendor MBG
        </p>
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-xl mx-auto w-full">
        {currentQuestion && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Question card */}
            <div className="space-y-2">
              <h2 className="text-xl font-black text-foreground leading-snug">
                {currentQuestion.text}
              </h2>
              {currentQuestion.hint && (
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  {currentQuestion.hint}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectOption(option.value)}
                    className={cn(
                      "w-full min-h-14 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 font-medium text-sm",
                      "hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99]",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "border-slate-200 bg-white text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "size-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-slate-300 bg-white"
                        )}
                      >
                        {isSelected && (
                          <div className="size-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <span>{option.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-4 w-full">
        <div className="max-w-xl mx-auto">
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer || isLoading}
            className="w-full h-14 rounded-2xl font-black text-base shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                {isLastStep ? "Membuat Roadmap..." : "Menyimpan..."}
              </span>
            ) : isLastStep ? (
              "Generate Roadmap"
            ) : (
              "Lanjut"
            )}
          </Button>
        </div>
      </footer>

      {/* Loading overlay when generating */}
      {isLoading && isLastStep && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl max-w-xs mx-4 text-center">
            <Loader2 className="size-12 animate-spin text-primary" />
            <div className="space-y-1">
              <p className="font-black text-foreground">Menganalisis Kesiapan Anda</p>
              <p className="text-sm text-slate-400 font-medium">
                AI sedang menyusun roadmap dokumen personal Anda...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
