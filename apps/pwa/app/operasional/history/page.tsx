import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2, AlertTriangle, ChevronRight, Calendar } from "lucide-react";

export default function CheckpointHistoryPage() {
  const historyData = [
    { date: "19 Mar 2026", score: 92, status: "Lengkap", cps: [1, 1, 1, 1] },
    { date: "18 Mar 2026", score: 88, status: "Lengkap", cps: [1, 1, 1, 1] },
    { date: "17 Mar 2026", score: 75, status: "Review", cps: [1, 1, 0, 1] },
    { date: "16 Mar 2026", score: 94, status: "Lengkap", cps: [1, 1, 1, 1] },
    { date: "15 Mar 2026", score: 91, status: "Lengkap", cps: [1, 1, 1, 1] },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Riwayat Checkpoint" />
      
      <div className="p-4 space-y-4">
        <section className="bg-green-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-xs font-bold text-green-100 uppercase tracking-widest">Rata-rata Minggu Ini</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-4xl font-black">88.4</h3>
            <span className="text-lg font-bold text-green-100 mb-1">/ 100</span>
          </div>
          <div className="mt-4 h-2 w-full bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-white w-[88.4%]"></div>
          </div>
        </section>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" /> 7 Hari Terakhir
          </h3>
          
          <div className="space-y-3">
            {historyData.map((item, i) => (
              <Card key={i} className="border-none shadow-sm active:scale-[0.98] transition-transform">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{item.date}</p>
                      <div className="flex gap-1">
                        {item.cps.map((completed, idx) => (
                          <div 
                            key={idx} 
                            className={`h-1.5 w-6 rounded-full ${completed ? 'bg-green-500' : 'bg-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 leading-none">{item.score}</p>
                        <p className={`text-[10px] font-bold ${item.status === 'Lengkap' ? 'text-green-600' : 'text-amber-600'}`}>
                          {item.status}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400 font-medium italic">
            "Menampilkan data audit harian yang tersimpan di sistem."
          </p>
        </div>
      </div>
    </div>
  );
}
