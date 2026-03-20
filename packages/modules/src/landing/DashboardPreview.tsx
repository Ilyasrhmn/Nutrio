import { CheckCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function DashboardPreview() {
  return (
    <section
      id="dashboard"
      className="bg-slate-50 border-t border-slate-100 overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs mb-6">
              Skala Nasional
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Satu dashboard untuk pantau seluruh Indonesia
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-[1.65]">
              BGN Command Center memberikan visibilitas penuh terhadap 19.000+
              vendor MBG. Identifikasi masalah sejak dini dan ambil tindakan
              secara cepat, tepat, dan terukur.
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0" />
                <span className="text-slate-700">
                  Peta sebaran 19.000+ vendor dengan filter risiko
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0" />
                <span className="text-slate-700">
                  Alert real-time — sertifikat kedaluwarsa, SOP terlewat
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0" />
                <span className="text-slate-700">
                  Export laporan PDF untuk rapat koordinasi BGN
                </span>
              </li>
            </ul>

            <Button className="bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors h-12 px-8 font-medium">
              Lihat Dashboard →
            </Button>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
              {/* Mockup Topbar */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center">
                    <LayoutDashboard className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-slate-900 text-sm">
                    Nutrio Command Center
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
              </div>

              {/* Mockup Content */}
              <div className="p-6 bg-slate-50/50 flex-1 flex flex-col gap-6">
                {/* Metric Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-xs text-slate-500 font-medium mb-1">
                      Total Vendor
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      19.412
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-xs text-slate-500 font-medium mb-1">
                      Terverifikasi
                    </span>
                    <span className="text-xl font-bold text-emerald-600">
                      87%
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-xs text-slate-500 font-medium mb-1">
                      Pending
                    </span>
                    <span className="text-xl font-bold text-amber-600">
                      1.203
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col ring-1 ring-red-100">
                    <span className="text-xs text-slate-500 font-medium mb-1">
                      Risiko Tinggi
                    </span>
                    <span className="text-xl font-bold text-red-600">48</span>
                  </div>
                </div>

                {/* Map Mockup */}
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl h-32 md:h-48 border border-indigo-100 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent bg-[length:20px_20px]"></div>
                  {/* Dots */}
                  <div className="absolute top-[30%] left-[25%] w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="absolute top-[40%] left-[45%] w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="absolute top-[60%] left-[35%] w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <div className="absolute top-[50%] left-[65%] w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-bounce"></div>
                  <div className="absolute top-[20%] left-[55%] w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="absolute top-[70%] left-[75%] w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-indigo-800/50 z-10">
                    Peta Sebaran Nasional
                  </span>
                </div>

                {/* Table Mockup */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden text-sm">
                  <div className="grid grid-cols-12 gap-4 p-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                    <div className="col-span-5">Vendor</div>
                    <div className="col-span-4">Lokasi</div>
                    <div className="col-span-3">Status</div>
                  </div>
                  <div className="flex flex-col">
                    {[
                      {
                        name: "Catering Ibu Budi",
                        loc: "Jakarta Selatan",
                        status: "Aman",
                        sc: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
                      },
                      {
                        name: "Dapur Nusantara",
                        loc: "Bandung",
                        status: "Aman",
                        sc: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
                      },
                      {
                        name: "CV Pangan Makmur",
                        loc: "Surabaya",
                        status: "Perhatian",
                        sc: "text-amber-700 bg-amber-50 ring-amber-600/20",
                      },
                      {
                        name: "Warung Berkah",
                        loc: "Semarang",
                        status: "Risiko Tinggi",
                        sc: "text-red-700 bg-red-50 ring-red-600/20",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-4 p-3 border-b border-slate-50 last:border-0 items-center"
                      >
                        <div className="col-span-5 font-medium text-slate-700 truncate">
                          {item.name}
                        </div>
                        <div className="col-span-4 text-slate-500 text-xs">
                          {item.loc}
                        </div>
                        <div className="col-span-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ring-1 ring-inset ${item.sc}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
