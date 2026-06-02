"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  School,
  Store,
  Truck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useScrollReveal, revealClasses } from "./useScrollReveal";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";

export function Features() {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.2 });

  const pillars = [
    {
      id: "school",
      title: "Pihak Sekolah & Komite",
      subtitle: "Menjamin Keamanan Konsumsi Siswa",
      icon: School,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50/50",
      textColor: "text-indigo-600",
      accentLight: "bg-indigo-50",
      accentRing: "ring-indigo-500/10",
      accentBorder: "border-indigo-500",
      pillBg: "bg-indigo-50",
      pillText: "text-indigo-700",
      pillIcon: "text-indigo-500",
      summary:
        "Sekolah memantau menu harian, melihat verifikasi kebersihan dapur katering secara real-time, dan memberikan umpan balik langsung.",
      details: [
        "Jadwal & Kalender Gizi Harian: Akses visual kalender makanan dengan persentase kecukupan gizi makro.",
        "Pantau Laporan Higienitas Dapur: Foto bukti kebersihan dapur vendor dikirim setiap pagi sebelum proses memasak dimulai.",
        "Umpan Balik Instan: Siswa/guru dapat mengirim rating & feedback rasa serta porsi makanan secara anonim demi peningkatan kualitas.",
        "Integrasi Data Orang Tua: Cetak QR code transparansi untuk dipasang di majalah dinding kantin agar orang tua bisa memindai kapan saja.",
      ],
    },
    {
      id: "vendor",
      title: "Dapur Catering (Vendor)",
      subtitle: "Buktikan Integritas & Kualitas Harian",
      icon: Store,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50/50",
      textColor: "text-emerald-600",
      accentLight: "bg-emerald-50",
      accentRing: "ring-emerald-500/10",
      accentBorder: "border-emerald-500",
      pillBg: "bg-emerald-50",
      pillText: "text-emerald-700",
      pillIcon: "text-emerald-500",
      summary:
        "UMKM catering menyusun checklist SOP bersertifikasi foto real-time, membuktikan kebersihan, dan memperluas kontrak sekolah secara adil.",
      details: [
        "Pelacak SOP Compliance Harian: Checklist PWA mobile ramah koki dengan verifikasi foto cuci tangan, sterilisasi alat, dan kebersihan dapur.",
        "Portofolio Kredibilitas Digital: Menampilkan riwayat kelulusan inspeksi higienitas, sertifikat halal, dan BPOM di profil publik.",
        "Pemberitahuan Order Otomatis: Sinkronisasi pemesanan porsi makan sesuai jumlah siswa yang hadir di sekolah secara real-time.",
        "Belanja Bahan Baku Instan: Hubungkan kebutuhan resep langsung ke supplier bahan mentah lokal dalam satu klik.",
      ],
    },
    {
      id: "supplier",
      title: "Supplier Pangan Lokal",
      subtitle: "Keterlacakan Distribusi Bahan Segar",
      icon: Truck,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50/50",
      textColor: "text-amber-600",
      accentLight: "bg-amber-50",
      accentRing: "ring-amber-500/10",
      accentBorder: "border-amber-500",
      pillBg: "bg-amber-50",
      pillText: "text-amber-700",
      pillIcon: "text-amber-500",
      summary:
        "Petani lokal dan supplier mendistribusikan bahan berkualitas dengan jaminan rantai dingin dan transparansi transaksi logistik.",
      details: [
        "Manajemen Pasokan Segar: Update ketersediaan sayur, daging halal, telur, dan susu lokal langsung dari genggaman.",
        "Keterlacakan Logistik (Traceability): Dapur catering dapat melihat tanggal panen sayuran dan asal peternakan daging yang mereka olah.",
        "Transaksi SNAP API Aman: Pembayaran invoice bahan pangan tercatat otomatis, aman, dan transparan antara vendor dan supplier.",
        "Efisiensi Rute Distribusi: Pengelompokan pengiriman terjadwal untuk menghemat biaya bahan bakar dan menjaga kesegaran bahan baku.",
      ],
    },
  ];

  const toggleExpand = (id: string) => {
    if (expandedPillar === id) {
      setExpandedPillar(null);
    } else {
      setExpandedPillar(id);
    }
  };

  return (
    <section
      id="features"
      className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 pb-16 sm:pb-20 relative overflow-hidden"
    >
      {/* Section Header */}
      <div
        ref={headerRef}
        className={`text-center mb-16 flex flex-col items-center relative z-10 ${revealClasses(headerVisible, "up")}`}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Kemitraan Kolaboratif
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4">
          Ekosistem Tiga Pilar Nutrio
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl">
          Menyatukan seluruh pemangku kepentingan dalam satu platform yang
          mengutamakan keterbukaan, kenyamanan, dan kualitas pangan anak.
        </p>
      </div>

      {/* ScrollStack Cards */}
      <ScrollStack
        itemDistance={60}
        itemScale={0.035}
        itemStackDistance={40}
        stackPosition="25%"
        scaleEndPosition="15%"
        baseScale={0.9}
        blurAmount={1.5}
      >
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isExpanded = expandedPillar === pillar.id;

          return (
            <ScrollStackItem
              key={pillar.id}
              itemClassName="!mt-0 !mb-5 !rounded-2xl !shadow-none !p-0"
            >
              {/* Card — white background, light theme */}
              <div
                className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
                  isExpanded
                    ? `${pillar.accentBorder} ring-2 ${pillar.accentRing} shadow-lg`
                    : "border-slate-200/80 hover:border-indigo-200 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Header Card */}
                <div
                  className={`p-7 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 ${isExpanded ? "border-b border-slate-100" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white bg-gradient-to-br ${pillar.color} shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        {pillar.subtitle}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleExpand(pillar.id)}
                      className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full border transition-all ${
                        isExpanded
                          ? "bg-slate-900 text-white border-slate-950"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {isExpanded ? "Tutup Detail" : "Lihat Integrasi"}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Summary (collapsed) */}
                {!isExpanded && (
                  <div className="px-7 sm:px-8 pb-7 sm:pb-8 flex-1 flex flex-col justify-between">
                    <p className="text-slate-500 text-xs leading-[1.65] mb-5">
                      {pillar.summary}
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {pillar.details.slice(0, 3).map((detail, idx) => {
                        const title = detail.split(": ")[0];
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${pillar.pillText} ${pillar.pillBg} rounded-full px-3 py-1.5`}
                          >
                            <CheckCircle2
                              className={`h-3 w-3 ${pillar.pillIcon}`}
                            />
                            {title}
                          </span>
                        );
                      })}
                      {pillar.details.length > 3 && (
                        <span className="inline-flex items-center text-[10px] font-semibold text-slate-400 px-2 py-1.5">
                          +{pillar.details.length - 3} lainnya
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleExpand(pillar.id)}
                      className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 group mt-auto self-start"
                    >
                      Pelajari proses kerja
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Expanded Detail Content */}
                {isExpanded && (
                  <div className="p-7 sm:p-8 bg-slate-50/50 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                    <div className="flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        Bagaimana Nutrio Membantu?
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6">
                        {pillar.summary} Setiap langkah dalam integrasi ini
                        didesain sesederhana mungkin bagi pelaku lapangan
                        melalui antarmuka seluler yang cepat, responsif, dan
                        hemat kuota data.
                      </p>
                      <div className="flex gap-4">
                        <Link href="/demo-accounts">
                          <button className="bg-indigo-600 text-white text-xs font-bold py-2.5 px-5 rounded-full hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/10">
                            Eksplorasi Fitur Ini
                          </button>
                        </Link>
                        <button
                          onClick={() => toggleExpand(pillar.id)}
                          className="text-slate-500 hover:text-slate-800 text-xs font-semibold py-2.5 px-4"
                        >
                          Kembali
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">
                        Alur Kerja & Fitur Kunci
                      </h4>
                      <div className="space-y-4">
                        {pillar.details.map((detail, idx) => {
                          const [title, desc] = detail.split(": ");
                          return (
                            <div
                              key={idx}
                              className="flex gap-3 items-start"
                            >
                              <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-[11px] font-bold text-slate-800 leading-none mb-1">
                                  {title}
                                </h5>
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                  {desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollStackItem>
          );
        })}
      </ScrollStack>
    </section>
  );
}
