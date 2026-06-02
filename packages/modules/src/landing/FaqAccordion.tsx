"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useScrollReveal, revealClasses } from "./useScrollReveal";

export function FaqAccordion() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.2 });
  const [faqRef, faqVisible] = useScrollReveal({ threshold: 0.1 });

  const faqs = [
    {
      q: "Bagaimana Pihak Sekolah memantau kebersihan dapur catering?",
      a: "Setiap sekolah mitra memiliki akses langsung ke dashboard Sekolah mereka. Di sana, sekolah dapat melihat laporan kepatuhan harian yang diisi koki dapur catering, termasuk bukti foto real-time kebersihan koki (suhu tubuh, masker) dan sterilisasi peralatan sebelum makanan dikirim."
    },
    {
      q: "Apakah orang tua murid dapat melihat menu gizi dan kebersihan pangan anak?",
      a: "Sangat bisa! Nutrio menyediakan halaman transparansi publik yang dapat diakses bebas tanpa login. Pihak sekolah juga dapat mencetak QR Code unik untuk ditempel di kantin atau mading sekolah, memudahkan orang tua memindai menu dan status higienitas harian anak lewat smartphone."
    },
    {
      q: "Bagaimana cara supplier bahan baku pangan lokal mendaftar?",
      a: "Supplier sayur, buah, daging, dan susu lokal dapat mendaftar langsung lewat portal Supplier. Setelah verifikasi mutu dan lokasi, profil supplier akan terhubung ke daftar mitra dapur catering terdekat untuk menciptakan rantai distribusi logistik yang hemat bahan bakar dan tetap segar."
    },
    {
      q: "Apakah checklist gizi dan higienitas Nutrio sesuai juknis nasional?",
      a: "Ya. Seluruh template checklist higienitas dapur dan hitungan porsi gizi makro di Nutrio dirancang dengan mengikuti petunjuk teknis (juknis) resmi Badan Gizi Nasional (BGN), rekomendasi BPOM, serta standar kesehatan pangan Kementerian Kesehatan."
    },
    {
      q: "Bagaimana sistem transaksi pembayaran antara vendor dan supplier berjalan?",
      a: "Nutrio mendukung integrasi SNAP API (Standar Nasional API Pembayaran) Bank Indonesia. Invoice belanja bahan baku dari supplier ke dapur catering dapat dibayar secara elektronik, aman, instan, serta tercatat rapi di sistem laporan keuangan kedua belah pihak."
    }
  ];

  const handleToggle = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      id="faq"
      className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-24 overflow-hidden"
    >
      <div ref={headerRef} className={`text-center mb-16 flex flex-col items-center ${revealClasses(headerVisible, "up")}`}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs mb-6 shadow-sm">
          <HelpCircle className="w-3.5 h-3.5" />
          Pertanyaan Umum
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4">
          Tanya Jawab Juknis Kemitraan
        </h2>
        <p className="text-slate-500 text-sm max-w-xl">
          Temukan jawaban atas pertanyaan umum seputar integrasi sistem sekolah, katering koki, pasokan tani lokal, dan jaminan keamanan pangan.
        </p>
      </div>

      <div ref={faqRef} className={`space-y-4 ${revealClasses(faqVisible, "up", 100)}`}>
        {faqs.map((faq, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200/80 overflow-hidden transition-all duration-200"
            >
              {/* Question Trigger */}
              <button
                onClick={() => handleToggle(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4.5 h-4.5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isExpanded ? "transform rotate-180 text-indigo-600" : ""
                  }`}
                />
              </button>

              {/* Answer Content Container */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded ? "max-h-[300px] border-t border-slate-100" : "max-h-0"
                }`}
              >
                <div className="p-6 bg-slate-50/50 text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
