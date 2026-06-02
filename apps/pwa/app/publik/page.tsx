"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { mockPublicStats, mockSchools, mockSPPGs, mockTraceabilityData } from "@/lib/mock-data/public-stats";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { 
  Search, School, Building2, ChevronRight, 
  Calendar, CheckCircle2, MapPin, Database,
  TrendingUp, Info, Filter, ArrowLeft
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

export default function PublicDashboardPage() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"daily" | "weekly">("daily");
  const [filterType, setFilterType] = useState<"school" | "sppg">("school");

  const filteredSchools = mockSchools.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSPPGs = mockSPPGs.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelect = (id: string) => {
    setSelectedEntity(id);
    setSearchQuery("");
  };

  const currentData = selectedEntity ? mockTraceabilityData[selectedEntity] || mockTraceabilityData["sch-001"] : null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PageHeader title="Transparansi MBG" showNotifications={false} />
      
      {!selectedEntity ? (
        <div className="p-4 space-y-6">
          <section className="space-y-4">
            <div className="text-center space-y-2 py-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Traceability MBG</h2>
              <p className="text-sm text-slate-500 font-medium">Lacak perjalanan makanan bergizi di daerah Anda.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-green-600 outline-none transition-all"
                placeholder={`Cari ${filterType === 'school' ? 'Sekolah' : 'Vendor/SPPG'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="school" onValueChange={(v) => setFilterType(v as "school" | "sppg")}>
              <TabsList className="w-full bg-slate-200/50 p-1 h-11 rounded-xl">
                <TabsTrigger value="school" className="flex-1 rounded-lg font-bold text-xs">Sekolah</TabsTrigger>
                <TabsTrigger value="sppg" className="flex-1 rounded-lg font-bold text-xs">Vendor (SPPG)</TabsTrigger>
              </TabsList>
            </Tabs>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              {filterType === 'school' ? 'Daftar Sekolah' : 'Daftar Vendor'}
            </h3>
            <div className="space-y-2">
              {(filterType === 'school' ? filteredSchools : filteredSPPGs).map((item) => (
                <Card 
                  key={item.id} 
                  className="border-none shadow-sm rounded-2xl active:scale-[0.98] transition-all cursor-pointer"
                  onClick={() => handleSelect(item.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${filterType === 'school' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                        {filterType === 'school' ? <School className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{(item as any).address || (item as any).location}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="pt-4 border-t border-slate-200">
             <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-green-400">
                   <TrendingUp className="h-5 w-5" />
                   <p className="text-xs font-black uppercase tracking-widest">National Stats</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Siswa Terlayani</p>
                      <p className="text-xl font-black">{mockPublicStats.totalPenerima.toLocaleString()}</p>
                   </div>
                   <div className="space-y-1 text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Compliance</p>
                      <p className="text-xl font-black">{mockPublicStats.complianceRate}%</p>
                   </div>
                </div>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none rounded-xl text-xs font-bold" variant="outline">
                   Lihat Laporan Lengkap Nasional
                </Button>
             </div>
          </section>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="bg-white border-b border-slate-200 p-4 space-y-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="-ml-2 text-slate-500 font-bold h-8"
                onClick={() => setSelectedEntity(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Pencarian
              </Button>
              
              <div className="flex items-start gap-4">
                 <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${filterType === 'school' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {filterType === 'school' ? <School className="h-8 w-8" /> : <Building2 className="h-8 w-8" />}
                 </div>
                 <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 leading-tight">{currentData?.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">Trace ID: {selectedEntity}</p>
                 </div>
              </div>

              <Tabs defaultValue="daily" onValueChange={(v) => setViewType(v as "daily" | "weekly")}>
                <TabsList className="w-full bg-slate-100 p-1 h-11 rounded-xl">
                  <TabsTrigger value="daily" className="flex-1 rounded-lg font-bold text-xs">Data Harian</TabsTrigger>
                  <TabsTrigger value="weekly" className="flex-1 rounded-lg font-bold text-xs">Mingguan</TabsTrigger>
                </TabsList>
              </Tabs>
           </div>

           <div className="p-4 space-y-6">
              {viewType === "daily" ? (
                 <section className="space-y-4">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-slate-900">Status Hari Ini</h3>
                       <Badge className="bg-green-100 text-green-700 border-none font-bold">{currentData?.daily.date}</Badge>
                    </div>

                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                       <CardContent className="p-0">
                          <div className="p-5 flex justify-between items-center bg-slate-900 text-white">
                             <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</p>
                                <p className="text-lg font-black">{currentData?.daily.status}</p>
                             </div>
                             <div className="h-12 w-12 rounded-full border-4 border-green-500/30 flex items-center justify-center">
                                <span className="text-xs font-bold text-green-400">{currentData?.daily.compliance}%</span>
                             </div>
                          </div>
                          <div className="p-5 space-y-4">
                             <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase">Menu</p>
                                   <p className="text-sm font-bold text-slate-900">{currentData?.daily.menu}</p>
                                </div>
                             </div>
                             {filterType === 'school' ? (
                                <div className="flex items-start gap-3">
                                   <Building2 className="h-4 w-4 text-slate-400 mt-0.5" />
                                   <div>
                                      <p className="text-[10px] text-slate-500 font-bold uppercase">Vendor / SPPG</p>
                                      <p className="text-sm font-bold text-slate-900">{currentData?.daily.vendor}</p>
                                   </div>
                                </div>
                             ) : (
                                <div className="flex items-start gap-3">
                                   <School className="h-4 w-4 text-slate-400 mt-0.5" />
                                   <div>
                                      <p className="text-[10px] text-slate-500 font-bold uppercase">Sekolah Terlayani</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                         {currentData?.daily.schools.map((s: string) => (
                                            <Badge key={s} variant="secondary" className="text-[10px] font-bold">{s}</Badge>
                                         ))}
                                      </div>
                                   </div>
                                </div>
                             )}
                             <div className="flex items-start gap-3">
                                <Database className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase">Blockchain Proof</p>
                                   <p className="text-[10px] font-mono text-blue-600 truncate max-w-[200px]">0x72a...{selectedEntity.slice(-4)}</p>
                                </div>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </section>
              ) : (
                 <section className="space-y-4">
                    <h3 className="font-bold text-slate-900">Riwayat 7 Hari Terakhir</h3>
                    <div className="space-y-2">
                       {currentData?.weekly.map((item: any, i: number) => (
                          <Card key={i} className="border-none shadow-sm rounded-2xl">
                             <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-slate-100 ${item.score >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                                      <CheckCircle2 className="h-5 w-5" />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-slate-900">{item.date}</p>
                                      <p className="text-[10px] text-slate-500 font-medium">{item.status}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-lg font-black text-slate-900">{item.score}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase">Compliance</p>
                                </div>
                             </CardContent>
                          </Card>
                       ))}
                    </div>
                 </section>
              )}

              <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                 <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                 <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                    Data yang ditampilkan telah divalidasi oleh sistem AI dan tercatat secara permanen di ledger blockchain untuk menjamin transparansi publik.
                 </p>
              </section>
           </div>
        </div>
      )}
    </div>
  );
}
