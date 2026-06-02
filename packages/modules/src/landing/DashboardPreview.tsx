"use client";

import React, { useState } from "react";
import { 
  CheckCircle, 
  LayoutDashboard, 
  Apple, 
  Sparkles, 
  ScanLine, 
  RefreshCw, 
  ShieldCheck
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useScrollReveal, revealClasses } from "./useScrollReveal";

export function DashboardPreview() {
  const [selectedDay, setSelectedDay] = useState<string>("senin");
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<boolean>(false);

  const [textRef, textVisible] = useScrollReveal({ threshold: 0.2 });
  const [dashboardRef, dashboardVisible] = useScrollReveal({ threshold: 0.2 });

  const menus: Record<string, {
    dish: string;
    calories: string;
    carbs: string;
    protein: string;
    fat: string;
    kitchen: string;
    supplier: string;
    photo: string;
  }> = {
    senin: {
      dish: "Ayam Fillet Teriyaki, Capcay Wortel & Buncis, Nasi Putih, Pisang Cavendish, Susu UHT",
      calories: "620 kkal",
      carbs: "78g",
      protein: "28g",
      fat: "14g",
      kitchen: "Catering Berkah Jaya",
      supplier: "Koperasi Tani Subur Makmur",
      photo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"
    },
    selasa: {
      dish: "Daging Sapi Semur, Sup Bakso Sayuran, Nasi Merah, Jeruk Medan, Susu UHT",
      calories: "645 kkal",
      carbs: "82g",
      protein: "32g",
      fat: "16g",
      kitchen: "Dapur Makmur Sejahtera",
      supplier: "Koperasi Peternak Sapi Lembang",
      photo: "https://images.unsplash.com/photo-1574484284002-982da32231b5?auto=format&fit=crop&w=300&q=80"
    },
    rabu: {
      dish: "Telur Puyuh Balado, Orek Tempe Manis, Sayur Asem, Nasi Putih, Pepaya, Susu UHT",
      calories: "590 kkal",
      carbs: "72g",
      protein: "24g",
      fat: "12g",
      kitchen: "Dapur Selera Rasa",
      supplier: "Distributor Tempe Koperasi UMKM",
      photo: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=300&q=80"
    },
    kamis: {
      dish: "Ikan Kembung Goreng Ketumbar, Tumis Kacang Panjang, Nasi Putih, Apel Merah, Susu UHT",
      calories: "610 kkal",
      carbs: "75g",
      protein: "30g",
      fat: "13g",
      kitchen: "Catering Berkah Jaya",
      supplier: "Koperasi Nelayan Pantai Utara",
      photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80"
    },
    jumat: {
      dish: "Ayam Bakar Madu, Sup Makaroni Jagung, Nasi Merah, Semangka, Susu UHT",
      calories: "630 kkal",
      carbs: "80g",
      protein: "29g",
      fat: "15g",
      kitchen: "Dapur Makmur Sejahtera",
      supplier: "Koperasi Unggas Priangan",
      photo: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=300&q=80"
    }
  };

  const handleAiInspection = () => {
    setAiAnalyzing(true);
    setAiResult(false);
    setTimeout(() => {
      setAiAnalyzing(false);
      setAiResult(true);
    }, 1500);
  };

  return (
    <section
      id="dashboard"
      className="bg-[oklch(95.1%_0.026_236.824)] relative overflow-hidden pt-20 sm:pt-24 pb-32 sm:pb-40"
    >
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          
          {/* Teks Keterangan di Kiri */}
          <div ref={textRef} className={`lg:col-span-2 order-2 lg:order-1 ${revealClasses(textVisible, "right")}`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Portal Informasi Publik
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Transparansi Penuh untuk Seluruh Komunitas
            </h2>
            <p className="text-slate-500 text-sm leading-[1.65] mb-8">
              Nutrio menyediakan ringkasan informasi yang dapat diakses oleh **siapa saja secara terbuka tanpa perlu login**. Orang tua siswa, komite sekolah, dan publik dapat melihat menu gizi hari ini, laporan kelayakan higiene dapur catering, hingga bukti pengiriman bahan mentah segar.
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Kalender Gizi Mingguan</h4>
                  <p className="text-[11px] text-slate-400">Jadwal menu bergizi lengkap dengan kalori dan protein.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Keterlacakan Asal Bahan Baku</h4>
                  <p className="text-[11px] text-slate-400">Asal-usul sayur dan protein dari koperasi petani lokal tepercaya.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Laporan Higienitas Mandiri Real-Time</h4>
                  <p className="text-[11px] text-slate-400">Bukti kebersihan dapur yang diperbarui koki katering setiap pagi.</p>
                </div>
              </li>
            </ul>

            <a href="#cta">
              <Button className="bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors h-11 px-6 text-xs font-bold">
                Gabung Ekosistem Mitra →
              </Button>
            </a>
          </div>

          {/* Dashboard Interaktif di Kanan */}
          <div ref={dashboardRef} className={`lg:col-span-3 order-1 lg:order-2 ${revealClasses(dashboardVisible, "left", 100)}`}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
              
              {/* Mockup Topbar */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center">
                    <LayoutDashboard className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs block leading-none">
                      Portal Transparansi Nutrio
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Update Pagi Ini: 07:30 WIB
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
              </div>

              {/* Mockup Content */}
              <div className="p-6 bg-slate-50/50 flex-1 flex flex-col gap-6">
                
                {/* 1. Pengendali Hari (Menu Selector Tabs) */}
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Jadwal Gizi Sekolah (Klik Hari)
                  </span>
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {Object.keys(menus).map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-lg transition-all ${
                          selectedDay === day
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Detail Gizi & Menu Hari Terpilih */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-[9px] text-indigo-600 font-bold uppercase mb-1">
                      <Apple className="w-3.5 h-3.5" />
                      Komposisi Gizi & Menu
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mb-3 leading-relaxed">
                      {menus[selectedDay]?.dish}
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-slate-50 py-1.5 rounded border border-slate-100">
                        <span className="text-[9px] font-medium text-slate-400 block">Kalori</span>
                        <span className="text-[10px] font-bold text-slate-700">{menus[selectedDay]?.calories}</span>
                      </div>
                      <div className="bg-slate-50 py-1.5 rounded border border-slate-100">
                        <span className="text-[9px] font-medium text-slate-400 block">Karbo</span>
                        <span className="text-[10px] font-bold text-slate-700">{menus[selectedDay]?.carbs}</span>
                      </div>
                      <div className="bg-slate-50 py-1.5 rounded border border-slate-100">
                        <span className="text-[9px] font-medium text-slate-400 block">Protein</span>
                        <span className="text-[10px] font-bold text-emerald-600">{menus[selectedDay]?.protein}</span>
                      </div>
                      <div className="bg-slate-50 py-1.5 rounded border border-slate-100">
                        <span className="text-[9px] font-medium text-slate-400 block">Lemak</span>
                        <span className="text-[10px] font-bold text-slate-700">{menus[selectedDay]?.fat}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:w-32 flex flex-col gap-2 pt-2 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-4 justify-between">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Mitra Katering</span>
                      <p className="text-[10px] font-bold text-slate-700 truncate">{menus[selectedDay]?.kitchen}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Supplier Lokal</span>
                      <p className="text-[10px] font-semibold text-slate-500 truncate">{menus[selectedDay]?.supplier}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Grid: Checklist Higienitas vs AI Food Inspection (Interaktif) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Kiri: Live SOP Checklist */}
                  <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                      Bukti Higienitas Pagi Ini
                    </span>
                    <div className="space-y-2 flex-1 justify-center flex flex-col">
                      <div className="flex items-center justify-between text-[10px] border-b border-slate-50 pb-1.5">
                        <span className="text-slate-600">Disinfeksi Area Masak</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[8px]">SELESAI 05:00</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] border-b border-slate-50 pb-1.5">
                        <span className="text-slate-600">Suhu Koki & Cuci Tangan</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[8px]">SELESAI 05:30</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] border-b border-slate-50 pb-1.5">
                        <span className="text-slate-600">Masker & Sarung Tangan</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[8px]">SELESAI 05:45</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-600">Sampel Makanan Disimpan</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[8px]">SELESAI 06:15</span>
                      </div>
                    </div>
                  </div>

                  {/* Kanan: AI Food Inspection Widget (Interaktif!) */}
                  <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between items-center text-center">
                    <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Analisis Foto Gizi AI (Demo)
                      </span>
                      <ScanLine className="w-3.5 h-3.5 text-indigo-600" />
                    </div>

                    {!aiAnalyzing && !aiResult && (
                      <div className="py-4 flex flex-col items-center">
                        <p className="text-[10px] text-slate-500 mb-3 max-w-[180px]">
                          Simulasikan teknologi pemindaian porsi makanan kami
                        </p>
                        <button 
                          onClick={handleAiInspection}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg shadow transition-colors flex items-center gap-1.5"
                        >
                          <ScanLine className="w-3 h-3" /> Pindai Porsi Pangan
                        </button>
                      </div>
                    )}

                    {aiAnalyzing && (
                      <div className="py-4 flex flex-col items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider animate-pulse">
                          Menganalisis Gizi Tray...
                        </span>
                      </div>
                    )}

                    {aiResult && (
                      <div className="w-full text-left bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-1.5 text-[9px] text-indigo-700 font-extrabold leading-none mb-0.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          ANALISIS AI SELESAI
                        </div>
                        <p className="text-[9px] text-slate-600 leading-none">
                          <strong className="text-slate-800">Menu Terdeteksi:</strong> Capcay (32%), Teriyaki (33%), Nasi (35%)
                        </p>
                        <p className="text-[9px] text-slate-600 leading-none">
                          <strong className="text-slate-800">Skor Higienitas:</strong> 99% (Sangat Layak)
                        </p>
                        <button 
                          onClick={() => setAiResult(false)} 
                          className="text-[8px] font-black text-indigo-600 hover:text-indigo-700 mt-1 uppercase tracking-wider text-right self-end"
                        >
                          Ulangi Tes
                        </button>
                      </div>
                    )}
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
