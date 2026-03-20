import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2, AlertTriangle, Search } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface AIResultCardProps {
  result: {
    status: string;
    score: number;
    confidence: number;
    notes: string;
    detectedItems: string[];
  };
}

export function AIResultCard({ result }: AIResultCardProps) {
  const isPass = result.status === "pass";

  return (
    <Card className={cn(
      "border-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4",
      isPass ? "border-green-100 bg-green-50/30" : "border-amber-100 bg-amber-50/30"
    )}>
      <CardContent className="p-5 space-y-4">
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
            <span className="text-2xl font-black text-slate-900">{result.score}</span>
            <span className="text-xs text-slate-500 font-medium ml-1">/100</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed italic">
          "{result.notes}"
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Search className="h-3.5 w-3.5" />
            Terdeteksi
          </div>
          <div className="flex flex-wrap gap-2">
            {result.detectedItems.map((item) => (
              <Badge key={item} variant="secondary" className="bg-white border-slate-200 text-slate-700 capitalize">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
