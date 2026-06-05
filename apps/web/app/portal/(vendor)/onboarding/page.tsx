"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Lock,
  Upload,
  UserPlus,
  Link2,
  PartyPopper,
  Clock,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Package,
  ChefHat,
  BoxSelect,
  Truck,
  ClipboardCheck,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { api } from "../../../../lib/api-client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OnboardingProgressState {
  step1Done: boolean
  step2Done: boolean
  step3Done: boolean
  step4Done: boolean
  step5Done: boolean
  completedAt: string | null
}

interface TeamMember {
  id: string
  role: string
  inviteEmail: string
  status: string
  acceptedAt: string | null
}

interface Supplier {
  id: string
  businessName: string
  supplierType: string
  addressCity: string
  addressProvince: string
  hasHalalCert: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<string, string> = {
  kepala_dapur: "Kepala Dapur",
  staf_masak: "Staf Masak",
  admin: "Admin",
}

function firstIncompleteStep(p: OnboardingProgressState): number {
  if (!p.step1Done) return 1
  if (!p.step2Done) return 2
  if (!p.step3Done) return 3
  if (!p.step4Done) return 4
  return 5
}

function countDone(p: OnboardingProgressState): number {
  return [p.step1Done, p.step2Done, p.step3Done, p.step4Done, p.step5Done].filter(Boolean).length
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface StepHeaderProps {
  number: number
  title: string
  done: boolean
  current: boolean
  locked: boolean
  onClick: () => void
}

function StepHeader({ number, title, done, current, locked, onClick }: StepHeaderProps) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={cn(
        "w-full flex items-center gap-4 p-4 transition-colors rounded-t-2xl text-left",
        done && "cursor-pointer hover:bg-emerald-50/60",
        current && "cursor-pointer hover:bg-blue-50/60",
        locked && "cursor-not-allowed opacity-60",
      )}
    >
      {/* Number circle */}
      <div
        className={cn(
          "size-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black border-2 transition-all",
          done && "bg-emerald-500 border-emerald-500 text-white",
          current && "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200",
          locked && "bg-slate-100 border-slate-200 text-slate-400",
        )}
      >
        {done ? <CheckCircle2 className="size-5" /> : locked ? <Lock className="size-4" /> : <span>{number}</span>}
      </div>

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "font-bold text-sm",
            done && "text-emerald-700",
            current && "text-blue-700",
            locked && "text-slate-400",
          )}
        >
          {title}
        </span>
        {locked && (
          <p className="text-[11px] text-slate-400 mt-0.5">Selesaikan langkah sebelumnya terlebih dahulu</p>
        )}
      </div>

      {done && (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold text-[10px] uppercase tracking-wide shrink-0">
          Selesai ✓
        </Badge>
      )}
      {current && (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-bold text-[10px] uppercase tracking-wide shrink-0">
          Aktif
        </Badge>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Core state
  const [progress, setProgress] = React.useState<OnboardingProgressState | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeStep, setActiveStep] = React.useState<number>(1)
  const [celebrating, setCelebrating] = React.useState(false)

  // Step 1 state
  const [phone, setPhone] = React.useState("")
  const [addressStreet, setAddressStreet] = React.useState("")
  const [addressCity, setAddressCity] = React.useState("")
  const [addressProvince, setAddressProvince] = React.useState("")
  const [logoUrl, setLogoUrl] = React.useState<string | undefined>()
  const [logoPreview, setLogoPreview] = React.useState<string | undefined>()
  const [uploadingLogo, setUploadingLogo] = React.useState(false)
  const [savingStep1, setSavingStep1] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Step 2 state
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [inviteRole, setInviteRole] = React.useState<"kepala_dapur" | "staf_masak" | "admin">("kepala_dapur")
  const [invitePhone, setInvitePhone] = React.useState("")
  const [sendingInvite, setSendingInvite] = React.useState(false)
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([])
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  // Step 3 state
  const [simulationChecked, setSimulationChecked] = React.useState(false)
  const [completingSimulation, setCompletingSimulation] = React.useState(false)
  const [guideStep, setGuideStep] = React.useState(0)

  // Step 4 state
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = React.useState(false)
  const [connectingSupplier, setConnectingSupplier] = React.useState<string | null>(null)

  // Step 5 state
  const [completingOnboarding, setCompletingOnboarding] = React.useState(false)

  // ---------------------------------------------------------------------------
  // Fetch progress
  // ---------------------------------------------------------------------------

  const fetchProgress = React.useCallback(async () => {
    try {
      const data = await api.get<OnboardingProgressState>("/onboarding/state")
      setProgress(data)
      // Only update activeStep on first load (isLoading === true) to avoid overriding user navigation
      setActiveStep((prev) => {
        if (isLoading) return firstIncompleteStep(data)
        return prev
      })
    } catch (err) {
      toast({ title: "Gagal memuat progress onboarding", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, toast])

  React.useEffect(() => {
    fetchProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll team when step 2 is active
  const fetchTeam = React.useCallback(async () => {
    try {
      const data = await api.get<TeamMember[]>("/onboarding/step2/team")
      setTeamMembers(data)
    } catch {
      // silently ignore poll errors
    }
  }, [])

  React.useEffect(() => {
    if (activeStep === 2 && progress?.step1Done) {
      fetchTeam()
      pollRef.current = setInterval(() => {
        fetchTeam()
        fetchProgress()
      }, 10_000)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeStep, progress?.step1Done, fetchTeam, fetchProgress])

  // Load suppliers when step 4 becomes active
  React.useEffect(() => {
    if (activeStep === 4 && progress?.step3Done && suppliers.length === 0) {
      setLoadingSuppliers(true)
      api
        .get<Supplier[]>("/onboarding/step4/suppliers?page=1&limit=10")
        .then((data) => setSuppliers(data))
        .catch(() => toast({ title: "Gagal memuat daftar pemasok", variant: "destructive" }))
        .finally(() => setLoadingSuppliers(false))
    }
  }, [activeStep, progress?.step3Done, suppliers.length, toast])

  // ---------------------------------------------------------------------------
  // Step handlers
  // ---------------------------------------------------------------------------

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await api.post<{ fileUrl: string; fileKey: string }>("/storage/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setLogoUrl(result.fileUrl)
      setLogoPreview(URL.createObjectURL(file))
      toast({ title: "Logo berhasil diunggah" })
    } catch {
      toast({ title: "Gagal mengunggah logo", variant: "destructive" })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleStep1Submit = async () => {
    if (!phone || !addressStreet || !addressCity || !addressProvince) {
      toast({ title: "Lengkapi semua field wajib", variant: "destructive" })
      return
    }
    setSavingStep1(true)
    try {
      await api.post("/onboarding/step1/profile", {
        phone,
        addressStreet,
        addressCity,
        addressProvince,
        ...(logoUrl ? { logoUrl } : {}),
      })
      await fetchProgress()
      setActiveStep(2)
      toast({ title: "Profil berhasil disimpan!" })
    } catch (err: any) {
      toast({ title: err?.message || "Gagal menyimpan profil", variant: "destructive" })
    } finally {
      setSavingStep1(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast({ title: "Email tidak boleh kosong", variant: "destructive" })
      return
    }
    setSendingInvite(true)
    try {
      await api.post("/onboarding/step2/team/invite", {
        email: inviteEmail,
        role: inviteRole,
        ...(invitePhone ? { phone: invitePhone } : {}),
      })
      setInviteEmail("")
      setInvitePhone("")
      await fetchTeam()
      toast({ title: `Undangan dikirim ke ${inviteEmail}` })
    } catch (err: any) {
      toast({ title: err?.message || "Gagal mengirim undangan", variant: "destructive" })
    } finally {
      setSendingInvite(false)
    }
  }

  const handleStep3Complete = async () => {
    if (!simulationChecked) return
    setCompletingSimulation(true)
    try {
      await api.post("/onboarding/step3/simulation/complete", {})
      await fetchProgress()
      setActiveStep(4)
      toast({ title: "Simulasi selesai! Lanjut ke langkah berikutnya." })
    } catch (err: any) {
      toast({ title: err?.message || "Gagal menyelesaikan simulasi", variant: "destructive" })
    } finally {
      setCompletingSimulation(false)
    }
  }

  const handleConnectSupplier = async (supplierId: string) => {
    setConnectingSupplier(supplierId)
    try {
      await api.post("/onboarding/step4/supplier/connect", { supplierId })
      toast({ title: "Pemasok berhasil dihubungkan!" })
      await fetchProgress()
      setActiveStep(5)
    } catch (err: any) {
      toast({ title: err?.message || "Gagal menghubungkan pemasok", variant: "destructive" })
    } finally {
      setConnectingSupplier(null)
    }
  }

  const handleCompleteOnboarding = async () => {
    setCompletingOnboarding(true)
    try {
      await api.post("/onboarding/complete", {})
      setCelebrating(true)
      await fetchProgress()
      setTimeout(() => {
        router.push("/portal/mission-control")
      }, 3000)
    } catch (err: any) {
      toast({ title: err?.message || "Gagal menyelesaikan onboarding", variant: "destructive" })
      setCompletingOnboarding(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const isStepLocked = (step: number): boolean => {
    if (!progress) return step > 1
    switch (step) {
      case 1: return false
      case 2: return !progress.step1Done
      case 3: return !progress.step2Done
      case 4: return !progress.step3Done
      case 5: return !progress.step4Done
      default: return true
    }
  }

  const isStepDone = (step: number): boolean => {
    if (!progress) return false
    switch (step) {
      case 1: return progress.step1Done
      case 2: return progress.step2Done
      case 3: return progress.step3Done
      case 4: return progress.step4Done
      case 5: return progress.step5Done
      default: return false
    }
  }

  const toggleStep = (step: number) => {
    if (isStepLocked(step)) return
    setActiveStep((prev) => (prev === step ? -1 : step))
  }

  const doneCount = progress ? countDone(progress) : 0
  const progressPercent = (doneCount / 5) * 100

  // ---------------------------------------------------------------------------
  // Full-screen completion
  // ---------------------------------------------------------------------------

  if (progress?.completedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-emerald-50 to-white">
        <div className="text-center max-w-md space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="size-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
            <ShieldCheck className="size-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Selamat!</h1>
          <p className="text-slate-600 font-medium leading-relaxed">
            Akun vendor Anda sudah aktif dan siap digunakan untuk program MBG.
          </p>
          <Button
            className="w-full rounded-2xl font-black h-12 shadow-lg shadow-primary/20"
            onClick={() => router.push("/portal/mission-control")}
          >
            Mulai di Mission Control →
          </Button>
        </div>
      </div>
    )
  }

  // Celebration overlay
  if (celebrating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-yellow-50 to-white animate-in fade-in duration-300">
        <div className="text-center max-w-md space-y-6">
          <div className="text-8xl animate-bounce">🎉</div>
          <h1 className="text-3xl font-black text-slate-900">Luar biasa!</h1>
          <p className="text-slate-600 font-medium">
            Onboarding selesai! Mengalihkan ke Mission Control...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <RefreshCw className="size-4 animate-spin" />
            Mohon tunggu sebentar...
          </div>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-64" />
        <div className="h-3 bg-slate-100 rounded-full w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Onboarding — Aktifkan Akun Vendor
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Selesaikan {5 - doneCount} langkah lagi untuk mulai beroperasi di program MBG.
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{doneCount} dari 5 langkah selesai</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2.5 rounded-full" />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {/* ------------------------------------------------------------------ */}
        {/* STEP 1 — Profil Usaha */}
        {/* ------------------------------------------------------------------ */}
        <StepCard
          stepNumber={1}
          title="Lengkapi Profil Usaha"
          done={isStepDone(1)}
          locked={isStepLocked(1)}
          expanded={activeStep === 1}
          onToggle={() => toggleStep(1)}
        >
          <div className="space-y-5">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Logo Usaha (Opsional)
              </Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="size-16 rounded-xl overflow-hidden border-2 border-border shadow-sm">
                    <img src={logoPreview} alt="Logo preview" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="size-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                    <Upload className="size-5 text-slate-300" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="rounded-xl font-bold text-xs"
                >
                  {uploadingLogo ? (
                    <>
                      <RefreshCw className="size-3 animate-spin mr-2" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Upload className="size-3 mr-2" />
                      Upload Logo
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Nomor HP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>

            {/* Address Street */}
            <div className="space-y-1.5">
              <Label htmlFor="street" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Alamat Lengkap (Jalan) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="street"
                placeholder="Jl. Mawar No. 12, RT 03/RW 04"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>

            {/* City & Province */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Kota/Kabupaten <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="Sleman"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="province" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Provinsi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="province"
                  placeholder="DI Yogyakarta"
                  value={addressProvince}
                  onChange={(e) => setAddressProvince(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <Button
              onClick={handleStep1Submit}
              disabled={savingStep1 || uploadingLogo}
              className="w-full rounded-xl font-black h-11 shadow-lg shadow-primary/15"
            >
              {savingStep1 ? (
                <>
                  <RefreshCw className="size-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan & Lanjutkan →"
              )}
            </Button>
          </div>
        </StepCard>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2 — Daftarkan Tim */}
        {/* ------------------------------------------------------------------ */}
        <StepCard
          stepNumber={2}
          title="Daftarkan Tim"
          done={isStepDone(2)}
          locked={isStepLocked(2)}
          expanded={activeStep === 2}
          onToggle={() => toggleStep(2)}
        >
          <div className="space-y-6">
            {/* Invite form */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-black text-slate-600 uppercase tracking-wide">Kirim Undangan Anggota Tim</p>

              <div className="space-y-1.5">
                <Label htmlFor="inviteEmail" className="text-xs font-bold text-slate-500">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="anggota@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="rounded-xl h-10 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inviteRole" className="text-xs font-bold text-slate-500">
                  Peran <span className="text-red-500">*</span>
                </Label>
                <select
                  id="inviteRole"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                  className="w-full h-10 rounded-xl border border-input bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="kepala_dapur">Kepala Dapur</option>
                  <option value="staf_masak">Staf Masak</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invitePhone" className="text-xs font-bold text-slate-500">
                  Nomor HP (Opsional)
                </Label>
                <Input
                  id="invitePhone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="rounded-xl h-10 bg-white"
                />
              </div>

              <Button
                onClick={handleSendInvite}
                disabled={sendingInvite}
                className="w-full rounded-xl font-black h-10 text-xs"
              >
                {sendingInvite ? (
                  <>
                    <RefreshCw className="size-3 animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-3 mr-2" />
                    Kirim Undangan
                  </>
                )}
              </Button>
            </div>

            {/* Team list */}
            {teamMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Anggota Tim</p>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                          {member.inviteEmail[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">
                            {member.inviteEmail}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {ROLE_LABELS[member.role] || member.role}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wide border",
                          member.status === "accepted"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-600 border-amber-200",
                        )}
                      >
                        {member.status === "accepted" ? "Diterima ✓" : "Menunggu..."}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Waiting notice */}
            {teamMembers.length > 0 && !progress?.step2Done && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <Clock className="size-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  Menunggu konfirmasi Kepala Dapur... Status diperbarui otomatis setiap 10 detik.
                </p>
              </div>
            )}

            {/* Continue button */}
            <Button
              onClick={() => setActiveStep(3)}
              disabled={!progress?.step2Done}
              variant={progress?.step2Done ? "default" : "outline"}
              className="w-full rounded-xl font-black h-11"
            >
              {progress?.step2Done
                ? "Lanjutkan ke Step 3 →"
                : "Menunggu konfirmasi tim..."}
            </Button>
          </div>
        </StepCard>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 3 — Simulasi Operasional */}
        {/* ------------------------------------------------------------------ */}
        <StepCard
          stepNumber={3}
          title="Simulasi Operasional"
          done={isStepDone(3)}
          locked={isStepLocked(3)}
          expanded={activeStep === 3}
          onToggle={() => toggleStep(3)}
        >
          <div className="space-y-5">
            {/* Info box */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-2">
              <p className="text-sm font-black text-blue-800">Selamat datang di program MBG!</p>
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                Tonton video panduan berikut sebelum memulai operasional. Pastikan Anda memahami alur
                penerimaan, produksi, dan distribusi makanan bergizi setiap hari sekolah.
              </p>
            </div>

            {/* Interactive step guide */}
            <OperationalGuide step={guideStep} onStepChange={setGuideStep} />

            {/* Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Checkbox
                id="sim-check"
                checked={simulationChecked}
                onCheckedChange={(v) => setSimulationChecked(!!v)}
                className="mt-0.5"
              />
              <Label
                htmlFor="sim-check"
                className="text-sm text-slate-700 leading-relaxed cursor-pointer font-medium"
              >
                Saya telah memahami alur operasional harian dan siap memulai sebagai vendor MBG
              </Label>
            </div>

            <Button
              onClick={handleStep3Complete}
              disabled={!simulationChecked || completingSimulation}
              className={cn(
                "w-full rounded-xl font-black h-11 shadow-lg",
                simulationChecked ? "shadow-primary/15" : "opacity-60",
              )}
            >
              {completingSimulation ? (
                <>
                  <RefreshCw className="size-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                "Selesaikan Simulasi →"
              )}
            </Button>
          </div>
        </StepCard>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 4 — Hubungkan Pemasok */}
        {/* ------------------------------------------------------------------ */}
        <StepCard
          stepNumber={4}
          title="Hubungkan Pemasok"
          done={isStepDone(4)}
          locked={isStepLocked(4)}
          expanded={activeStep === 4}
          onToggle={() => toggleStep(4)}
        >
          <div className="space-y-5">
            <div>
              <p className="text-sm font-black text-slate-700">Cari Pemasok Terverifikasi</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Pilih satu pemasok untuk mulai terhubung dan mendapatkan pasokan bahan baku.
              </p>
            </div>

            {loadingSuppliers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p className="text-sm font-medium">Tidak ada pemasok tersedia saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-slate-800 text-sm truncate">{supplier.businessName}</p>
                        {supplier.hasHalalCert && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase border shrink-0">
                            Halal ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{supplier.supplierType}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {supplier.addressCity}, {supplier.addressProvince}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleConnectSupplier(supplier.id)}
                      disabled={connectingSupplier === supplier.id}
                      className="rounded-xl font-black text-xs ml-3 shrink-0"
                    >
                      {connectingSupplier === supplier.id ? (
                        <RefreshCw className="size-3 animate-spin" />
                      ) : (
                        <>
                          <Link2 className="size-3 mr-1.5" />
                          Hubungkan
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </StepCard>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 5 — Selesai */}
        {/* ------------------------------------------------------------------ */}
        <StepCard
          stepNumber={5}
          title="Selesai 🎉"
          done={isStepDone(5)}
          locked={isStepLocked(5)}
          expanded={activeStep === 5}
          onToggle={() => toggleStep(5)}
        >
          <div className="space-y-6">
            {/* Celebration banner */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl text-center space-y-3">
              <div className="text-5xl">🎉</div>
              <p className="font-black text-emerald-800 text-lg">Hampir selesai!</p>
              <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                Semua langkah persiapan telah selesai. Tekan tombol di bawah untuk mengaktifkan akun
                vendor Anda dan mulai menerima jadwal distribusi MBG.
              </p>
            </div>

            {/* Starter kit card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <p className="text-xs font-black text-slate-600 uppercase tracking-wide">
                Starter Kit — Minggu Pertama
              </p>
              <div className="space-y-2">
                {[
                  { day: "Senin", desc: "Orientasi Tim & Pengecekan Peralatan Dapur" },
                  { day: "Selasa", desc: "Simulasi Resep Standar MBG (Gizi Seimbang)" },
                  { day: "Rabu", desc: "Uji Coba Alur Penerimaan Bahan dari Pemasok" },
                  { day: "Kamis", desc: "Dry-Run Distribusi ke 2 Sekolah Terdekat" },
                  { day: "Jumat", desc: "Review & Evaluasi Minggu Pertama" },
                ].map((item) => (
                  <div key={item.day} className="flex items-start gap-3">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-black w-16 text-center shrink-0 uppercase border-slate-200"
                    >
                      {item.day}
                    </Badge>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCompleteOnboarding}
              disabled={completingOnboarding}
              className="w-full rounded-xl font-black h-12 shadow-xl shadow-primary/20 text-sm"
            >
              {completingOnboarding ? (
                <>
                  <RefreshCw className="size-4 animate-spin mr-2" />
                  Mengaktifkan akun...
                </>
              ) : (
                <>
                  <PartyPopper className="size-4 mr-2" />
                  Mulai Operasional!
                </>
              )}
            </Button>
          </div>
        </StepCard>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OperationalGuide — replaces video placeholder with interactive walkthrough
// ---------------------------------------------------------------------------

const GUIDE_STEPS = [
  {
    icon: Package,
    color: "bg-blue-100 text-blue-600",
    ring: "ring-blue-200",
    time: "06:30 – 07:30",
    title: "Penerimaan Bahan Baku",
    steps: [
      "Terima kiriman bahan dari pemasok sesuai jadwal",
      "Periksa kualitas, berat, dan tanggal kedaluwarsa setiap item",
      "Foto bukti penerimaan dan upload ke aplikasi",
      "Laporkan ketidaksesuaian langsung ke pemasok",
    ],
    tip: "Penolakan bahan yang tidak sesuai standar TIDAK dikenakan penalti skor.",
  },
  {
    icon: ChefHat,
    color: "bg-orange-100 text-orange-600",
    ring: "ring-orange-200",
    time: "07:30 – 10:00",
    title: "Produksi Makanan",
    steps: [
      "Masak sesuai menu hari ini (lihat kalender menu di portal)",
      "Ikuti standar resep gizi seimbang yang telah disetujui BGN",
      "Jaga kebersihan dapur dan gunakan APD lengkap",
      "Foto hasil masakan siap kemas sebagai dokumentasi",
    ],
    tip: "Target porsi harian tertera di halaman Mission Control — pastikan jumlah sesuai.",
  },
  {
    icon: BoxSelect,
    color: "bg-purple-100 text-purple-600",
    ring: "ring-purple-200",
    time: "10:00 – 11:00",
    title: "Pengemasan & Pelabelan",
    steps: [
      "Kemas makanan dalam box berlabel sesuai sekolah tujuan",
      "Cetak/tempel label QR code per box (generate dari portal)",
      "Pisahkan box per sekolah, tandai dengan nama sekolah",
      "Cek kembali jumlah porsi sebelum loading ke kendaraan",
    ],
    tip: "QR code di box yang dipindai saat penerimaan sekolah adalah bukti distribusi yang sah.",
  },
  {
    icon: Truck,
    color: "bg-emerald-100 text-emerald-600",
    ring: "ring-emerald-200",
    time: "11:00 – 12:30",
    title: "Distribusi ke Sekolah",
    steps: [
      "Muat box ke kendaraan pengiriman, pastikan suhu terjaga",
      "Kirim ke sekolah sesuai urutan rute yang efisien",
      "Serahkan ke petugas penerima sekolah, minta tanda tangan",
      "Pindai QR konfirmasi di aplikasi sekolah atau scan manual",
    ],
    tip: "Keterlambatan lebih dari 30 menit dari jadwal akan memicu notifikasi penalti skor.",
  },
  {
    icon: ClipboardCheck,
    color: "bg-teal-100 text-teal-600",
    ring: "ring-teal-200",
    time: "12:30 – 13:00",
    title: "Checkpoint & Pelaporan",
    steps: [
      "Buka halaman Checkpoint di aplikasi (CP1–CP4)",
      "Upload foto bukti: penerimaan, produksi, pengemasan, distribusi",
      "Isi keterangan singkat jika ada kendala di lapangan",
      "Submit checkpoint sebelum pukul 13:00 untuk skor penuh",
    ],
    tip: "Skor harian dimulai dari 100 dan berkurang jika checkpoint tidak diselesaikan tepat waktu.",
  },
]

function OperationalGuide({ step, onStepChange }: { step: number; onStepChange: (s: number) => void }) {
  const current = GUIDE_STEPS[step]!
  const Icon = current.icon
  const total = GUIDE_STEPS.length

  return (
    <div className="w-full rounded-2xl border-2 border-slate-100 bg-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Panduan Operasional Harian MBG
        </p>
        <p className="text-[10px] font-bold text-slate-400">{step + 1} / {total}</p>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Step header */}
        <div className="flex items-center gap-4">
          <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 ring-2", current.color, current.ring)}>
            <Icon className="size-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{current.time}</p>
            <h3 className="text-base font-black text-slate-800 leading-tight">{current.title}</h3>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2.5">
          {current.steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="size-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-black text-slate-500">{i + 1}</span>
              </div>
              <p className="text-sm text-slate-700 font-medium leading-snug">{s}</p>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <span className="text-sm shrink-0">💡</span>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">{current.tip}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/60">
        <button
          onClick={() => onStepChange(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="size-4" />
          Sebelumnya
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {GUIDE_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => onStepChange(i)}
              className={cn(
                "rounded-full transition-all",
                i === step ? "size-2.5 bg-primary" : "size-2 bg-slate-200 hover:bg-slate-300",
              )}
            />
          ))}
        </div>

        <button
          onClick={() => onStepChange(Math.min(total - 1, step + 1))}
          disabled={step === total - 1}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Selanjutnya
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StepCard wrapper — keeps content in/out of DOM cleanly
// ---------------------------------------------------------------------------

interface StepCardProps {
  stepNumber: number
  title: string
  done: boolean
  locked: boolean
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function StepCard({ stepNumber, title, done, locked, expanded, onToggle, children }: StepCardProps) {
  const current = !done && !locked

  return (
    <Card
      className={cn(
        "rounded-2xl border transition-all duration-200 overflow-hidden",
        done && "border-emerald-200 bg-emerald-50/30",
        current && expanded && "border-blue-200 bg-blue-50/20 shadow-lg shadow-blue-100/50",
        current && !expanded && "border-blue-100",
        locked && "border-slate-100 bg-slate-50/50",
      )}
    >
      <StepHeader
        number={stepNumber}
        title={title}
        done={done}
        current={current}
        locked={locked}
        onClick={onToggle}
      />

      {/* Expandable content */}
      {expanded && !locked && (
        <CardContent className="px-4 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="border-t border-border/50 pt-5">{children}</div>
        </CardContent>
      )}
    </Card>
  )
}
