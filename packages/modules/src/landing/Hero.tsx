import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
    >
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-600/20 blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/4" />

      <div className="grid lg:grid-cols-2 gap-16 items-center z-10 w-full">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-sm mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Program Prioritas Nasional · MBG 2026
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Pengawasan Vendor MBG <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Proaktif, Bukan Reaktif.
            </span>
          </h1>

          <p className="text-lg text-slate-500 mb-8 max-w-xl leading-[1.65]">
            Portal Mitra BGN menyelesaikan onboarding. Nutrio
            menyelesaikan apa yang terjadi SETELAH vendor disetujui. Pastikan
            kepatuhan SOP dapur berjalan setiap hari.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full hover:-translate-y-0.5 shadow-[0_4px_14px_0_rgba(79,70,229,0.3)] transition-all duration-200 group h-12 px-8 font-medium">
              Mulai Gratis
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full h-12 px-8 font-medium border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200"
            >
              Lihat Demo
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
              25.000+ korban keracunan
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
              19.188 SPPG aktif
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
              80% karena SOP
            </div>
          </div>
        </div>

        <div className="perspective-[2000px] w-full hidden lg:block">
          <div className="relative w-full aspect-4/3 transform rotate-x-[5deg] rotate-y-[-12deg] transition-transform duration-500 hover:rotate-x-[2deg] hover:rotate-y-[-8deg] shadow-[0_4px_20px_-2px_rgba(79,70,229,0.12)] rounded-xl bg-white border border-slate-200 overflow-hidden flex flex-col">
            <div className="absolute -left-6 top-1/4 animate-bounce duration-[3000ms] bg-white border border-red-100 shadow-lg rounded-lg p-3 flex items-center gap-3 z-20">
              <span className="text-lg">🔴</span>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Sertifikat expired
                </p>
                <p className="text-[10px] text-slate-500">Dapur Ibu Sari</p>
              </div>
            </div>

            <div className="border-b border-slate-100 p-4 bg-slate-50 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto bg-white px-24 py-1.5 rounded-md text-xs font-medium text-slate-400 border border-slate-100 shadow-sm">
                Nutrio Dashboard
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6 bg-slate-50/50">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">Total Vendor</p>
                  <p className="font-semibold text-slate-900">19.412</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">Kepatuhan</p>
                  <p className="font-semibold text-emerald-600">87%</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm ring-1 ring-red-100">
                  <p className="text-xs text-slate-500 mb-1">Risiko Tinggi</p>
                  <p className="font-semibold text-red-600">48</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-100 shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-5">Nama Dapur</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-4">Skor Kepatuhan</div>
                </div>
                <div className="flex-1 flex flex-col">
                  {[
                    {
                      name: "Dapur Makmur Sejahtera",
                      status: "Aman",
                      color:
                        "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
                      score: "94%",
                      bar: "w-[94%] bg-emerald-500",
                    },
                    {
                      name: "Catering Berkah Jaya",
                      status: "Perhatian",
                      color: "text-amber-700 bg-amber-50 ring-amber-600/20",
                      score: "72%",
                      bar: "w-[72%] bg-amber-500",
                    },
                    {
                      name: "Dapur Ibu Sari",
                      status: "Risiko Tinggi",
                      color: "text-red-700 bg-red-50 ring-red-600/20",
                      score: "45%",
                      bar: "w-[45%] bg-red-500",
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-50 items-center"
                    >
                      <div className="col-span-5 text-xs font-medium text-slate-700 truncate">
                        {row.name}
                      </div>
                      <div className="col-span-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ring-1 ring-inset ${row.color}`}
                        >
                          {row.status}
                        </span>
                      </div>
                      <div className="col-span-4 flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700 w-8">
                          {row.score}
                        </span>
                        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.bar}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
