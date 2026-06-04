"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { api } from "../../../../../lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Loader2, TrendingUp, AlertCircle, Lightbulb, Wallet, Hash, CheckCircle2 } from "lucide-react"

interface DebriefData {
  id: string
  scoreFinal: number
  narrativeGood: string
  narrativeImprove: string
  recommendations: string[]
  fundEstimate: number
  auditHash: string
  generatedAt: string
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"
  const bg = score >= 80 ? "bg-green-50" : score >= 60 ? "bg-yellow-50" : "bg-red-50"
  return (
    <div className={`${bg} rounded-3xl p-8 text-center`}>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Skor Akhir Hari Ini</p>
      <p className={`text-7xl font-black ${color}`}>{score}</p>
      <p className="text-slate-500 text-sm mt-1">/ 100</p>
      <Badge className={`mt-3 font-bold ${score >= 80 ? "bg-green-100 text-green-700" : score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"} border-none`}>
        {score >= 80 ? "EXCELLENT" : score >= 60 ? "CUKUP" : "PERLU PERBAIKAN"}
      </Badge>
    </div>
  )
}

export default function DailyDebriefPage() {
  const params = useParams()
  const date = params?.date as string
  const [data, setData] = React.useState<DebriefData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    api.get<DebriefData>(`/debrief/${date}`)
      .then(d => setData(d))
      .catch(e => setError(e?.message ?? "Gagal memuat debrief"))
      .finally(() => setLoading(false))
  }, [date])

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>

  if (error || !data) return (
    <div className="p-8 text-center">
      <AlertCircle className="size-10 text-red-500 mx-auto mb-3" />
      <p className="text-slate-500">{error || "Data tidak tersedia"}</p>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily Debrief</p>
        <h1 className="text-2xl font-black mt-1">{new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h1>
      </div>

      <ScoreRing score={data.scoreFinal} />

      {/* Estimasi Cair Dana */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="pt-5 flex items-center gap-4">
          <Wallet className="size-8 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Estimasi Pencairan Dana</p>
            <p className="text-2xl font-black text-emerald-700">Rp {data.fundEstimate.toLocaleString("id-ID")}</p>
            <p className="text-xs text-slate-500 mt-0.5">Berdasarkan skor × target porsi × tarif dasar</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="size-4 text-green-600" />
            Yang Berjalan Baik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{data.narrativeGood}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="size-4 text-yellow-600" />
            Perlu Diperbaiki
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{data.narrativeImprove}</p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            Rekomendasi untuk Besok
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Audit Hash */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <Hash className="size-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Audit Hash</p>
              <p className="text-xs font-mono text-slate-600 break-all">{data.auditHash}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Verifikasi: <code className="bg-slate-100 px-1 rounded">/api/public/verify/{data.auditHash.slice(0, 8)}...</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
