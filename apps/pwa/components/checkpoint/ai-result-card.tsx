import { Card, CardContent } from "@workspace/ui/components/card";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface AIResultCardProps {
  result: {
    status: "pass" | "warning" | "pending";
    confidence: number;
    notes: string;
    scoreDelta?: number;
  };
}

export function AIResultCard({ result }: AIResultCardProps) {
  if (result.status === "pending") {
    return (
      <Card className="border-2 border-slate-100 bg-slate-50/50 animate-in fade-in slide-in-from-bottom-4">
        <CardContent className="p-5 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-slate-400 animate-spin shrink-0" />
          <p className="text-sm text-slate-500">Menunggu hasil validasi AI...</p>
        </CardContent>
      </Card>
    );
  }

  const isPass = result.status === "pass";

  return (
    <Card className={cn(
      "border-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4",
      isPass ? "border-green-100 bg-green-50/30" : "border-amber-100 bg-amber-50/30"
    )}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPass ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            )}
            <span className={cn(
              "font-bold text-lg",
              isPass ? "text-green-700" : "text-amber-700"
            )}>
              AI: {isPass ? "Layak" : "Perlu Review"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-slate-900">{Math.round(result.confidence * 100)}%</span>
            <p className="text-[10px] text-slate-500 font-medium">keyakinan</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed italic">
          "{result.notes}"
        </p>

        {typeof result.scoreDelta === "number" && result.scoreDelta !== 0 && (
          <div className={cn(
            "text-xs font-bold px-3 py-1.5 rounded-lg w-fit",
            result.scoreDelta < 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
          )}>
            {result.scoreDelta > 0 ? "+" : ""}{result.scoreDelta} poin skor kepatuhan
          </div>
        )}
      </CardContent>
    </Card>
  );
}
