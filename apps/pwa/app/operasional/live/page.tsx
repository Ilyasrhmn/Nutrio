"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StepIndicator } from "@/components/checkpoint/step-indicator";
import { CameraCapture } from "@/components/checkpoint/camera-capture";
import { AIResultCard } from "@/components/checkpoint/ai-result-card";
import {
  checkpointDefinitions,
  mockAIResults,
} from "@/lib/mock-data/checkpoints";
import { Button } from "@workspace/ui/components/button";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LiveCheckpointPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentDef = checkpointDefinitions[currentStep]!;

  const handleCapture = (image: string) => {
    setCapturedImage(image);
    setIsAnalyzing(true);

    // Simulate AI Analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiResult(mockAIResults[currentStep % mockAIResults.length]);
    }, 2000);
  };

  const nextStep = () => {
    if (currentStep < checkpointDefinitions.length - 1) {
      setCurrentStep(currentStep + 1);
      setCapturedImage(null);
      setAiResult(null);
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
            <h2 className="text-2xl font-bold text-slate-900">
              Checkpoint Selesai!
            </h2>
            <p className="text-slate-500">
              Semua tahapan operasional hari ini telah diverifikasi oleh AI.
            </p>
          </div>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 h-12 font-bold"
            asChild
          >
            <a href="/">Kembali ke Dashboard</a>
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
          totalSteps={checkpointDefinitions.length}
          steps={checkpointDefinitions.map((d) => ({
            id: d.id,
            label: d.label,
          }))}
        />
      </div>

      <div className="p-4 space-y-6 flex-1 flex flex-col">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            {currentDef?.label}
          </h2>
          <p className="text-sm text-slate-500">{currentDef?.instruction}</p>
        </div>

        <CameraCapture
          onCapture={handleCapture}
          onReset={() => {
            setCapturedImage(null);
            setAiResult(null);
          }}
          imageSrc={capturedImage}
        />

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            <div className="text-center">
              <p className="font-bold text-slate-900">
                AI sedang menganalisa...
              </p>
              <p className="text-xs text-slate-500">
                Memverifikasi kebersihan dan standar gizi
              </p>
            </div>
          </div>
        )}

        {aiResult && (
          <>
            <AIResultCard result={aiResult} />
            <div className="mt-auto pt-4 pb-8">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-lg shadow-green-200 active:scale-95 transition-transform"
                onClick={nextStep}
              >
                {currentStep < checkpointDefinitions.length - 1 ? (
                  <>
                    <>Lanjut ke {checkpointDefinitions[currentStep + 1]?.label} <ArrowRight className="ml-2 h-5 w-5" /></>
                  </>
                ) : (
                  "Selesaikan Checkpoint"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
