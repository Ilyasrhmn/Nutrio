"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StepIndicator } from "@/components/checkpoint/step-indicator";
import { CameraCapture } from "@/components/checkpoint/camera-capture";
import { AIResultCard } from "@/components/checkpoint/ai-result-card";
import { Button } from "@workspace/ui/components/button";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const CHECKPOINT_DEFS = [
  { id: "CP1", label: "Bahan Mentah", instruction: "Foto semua bahan yang diterima hari ini" },
  { id: "CP2", label: "Proses Masak", instruction: "Foto kondisi dapur dan proses memasak" },
  { id: "CP3", label: "Makanan Siap", instruction: "Foto makanan yang siap dikemas" },
  { id: "CP4", label: "Serah Terima", instruction: "Foto saat menyerahkan makanan ke sekolah" },
];

interface AiResult {
  status: "pass" | "warning" | "pending";
  confidence: number;
  notes: string;
  scoreDelta?: number;
}

interface CheckpointEvent {
  id: string;
  cpType: string;
  cpStatus: string;
  scoreDelta: number;
  aiValidation: { pass: boolean; reason: string; confidence: number } | null;
}

function base64ToBlob(base64: string): Blob {
  const [header, data] = base64.split(",");
  const mime = header?.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(data ?? "");
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollForAiResult(cpType: string, attempts = 6, delayMs = 2000): Promise<AiResult> {
  for (let i = 0; i < attempts; i++) {
    await sleep(delayMs);
    try {
      const res = await apiClient.get<CheckpointEvent[]>("/checkpoints/today");
      const match = res.data.find((cp) => cp.cpType === cpType);
      if (match?.aiValidation) {
        return {
          status: match.aiValidation.pass ? "pass" : "warning",
          confidence: match.aiValidation.confidence,
          notes: match.aiValidation.reason,
          scoreDelta: match.scoreDelta,
        };
      }
    } catch {
      // keep polling; final iteration falls through to pending result below
    }
  }
  return {
    status: "pending",
    confidence: 0,
    notes: "Foto tersimpan, validasi AI masih diproses di server. Anda tetap bisa lanjut ke tahap berikutnya.",
  };
}

export default function LiveCheckpointPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDef = CHECKPOINT_DEFS[currentStep]!;

  const handleCapture = async (image: string) => {
    setCapturedImage(image);
    setIsAnalyzing(true);
    setError(null);

    try {
      const blob = base64ToBlob(image);
      const form = new FormData();
      form.append("photo", blob, `${currentDef.id}.jpg`);

      await apiClient.post(`/checkpoints/${currentDef.id}/submit`, form);
      setIsAnalyzing(false);
      setIsPolling(true);

      // AI validation runs async server-side; poll for the real result
      // instead of fabricating one immediately.
      const result = await pollForAiResult(currentDef.id);
      setAiResult(result);
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? err?.message ?? "Gagal mengirim foto";
      setError(msg);
      setIsAnalyzing(false);
    } finally {
      setIsPolling(false);
    }
  };

  const nextStep = () => {
    if (currentStep < CHECKPOINT_DEFS.length - 1) {
      setCurrentStep(currentStep + 1);
      setCapturedImage(null);
      setAiResult(null);
      setError(null);
    } else {
      setIsCompleted(true);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <PageHeader title="Selesai" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 animate-bounce">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Checkpoint Selesai!</h2>
            <p className="text-slate-500">Semua tahapan operasional hari ini telah diverifikasi.</p>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700 h-12 font-bold" asChild>
            <a href="/">Kembali ke Dashboard</a>
          </Button>
          <Button variant="ghost" className="w-full font-bold text-slate-500" asChild>
            <a href="/operasional/progress">Lihat Progress Checkpoint</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Live Checkpoint" />

      <div className="bg-white border-b border-slate-200 py-6">
        <StepIndicator
          currentStep={currentStep}
          totalSteps={CHECKPOINT_DEFS.length}
          steps={CHECKPOINT_DEFS.map((d) => ({ id: d.id, label: d.label }))}
        />
      </div>

      <div className="p-4 space-y-6 flex-1 flex flex-col">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">{currentDef.label}</h2>
          <p className="text-sm text-slate-500">{currentDef.instruction}</p>
        </div>

        <CameraCapture
          onCapture={handleCapture}
          onReset={() => { setCapturedImage(null); setAiResult(null); setError(null); }}
          imageSrc={capturedImage}
        />

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            <div className="text-center">
              <p className="font-bold text-slate-900">Mengirim foto...</p>
              <p className="text-xs text-slate-500">Mengunggah ke server</p>
            </div>
          </div>
        )}

        {isPolling && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            <div className="text-center">
              <p className="font-bold text-slate-900">Menunggu hasil AI...</p>
              <p className="text-xs text-slate-500">Foto sedang diverifikasi server</p>
            </div>
          </div>
        )}

        {error && !aiResult && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {aiResult && (
          <>
            <AIResultCard result={aiResult} />
            <div className="mt-auto pt-4 pb-8">
              <Button
                className="w-full bg-primary hover:bg-primary/90 h-14 text-lg font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                onClick={nextStep}
                disabled={!!error}
              >
                {currentStep < CHECKPOINT_DEFS.length - 1 ? (
                  <>
                    Lanjut ke {CHECKPOINT_DEFS[currentStep + 1]?.label}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  "Selesaikan Checkpoint"
                )}
              </Button>
              {error && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Perbaiki error di atas sebelum melanjutkan
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
