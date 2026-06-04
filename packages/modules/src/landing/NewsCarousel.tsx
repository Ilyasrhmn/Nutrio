"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, ArrowUpRight, Newspaper } from "lucide-react";
import { useScrollReveal, revealClasses } from "./useScrollReveal";

export function NewsCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const [textRef, textVisible] = useScrollReveal({ threshold: 0.2 });
  const [carouselRef, carouselVisible] = useScrollReveal({ threshold: 0.2 });

  const newsItems = [
    {
      title: "Pemberdayaan Koperasi Tani Lokal Subur Makmur oleh Mitra Catering",
      desc: "Lebih dari 15 keluarga petani lokal kini memasok 100% sayuran organik segar untuk program Makan Bergizi Gratis di wilayah Bogor Barat.",
      date: "24 Mei 2026",
      source: "Kemitraan Petani",
      image: "/assets/picture/PemberdayaanPetaniLokal.jpg"
    },
    {
      title: "SDN 01 Menteng Raih Penghargaan Pelopor Transparansi Higiene Pangan",
      desc: "Dengan memasang QR Code Nutrio di mading sekolah, SDN 01 Menteng terpilih sebagai percontohan nasional keterbukaan informasi gizi bagi orang tua murid.",
      date: "20 Mei 2026",
      source: "Penghargaan Sekolah",
      image: "/assets/picture/PenghargaanSD.webp"
    },
    {
      title: "Uji Coba AI Gizi Sukses Memverifikasi 15.400 Porsi Makan Sehat",
      desc: "Implementasi teknologi pemindaian piring Nutrio AI terbukti menghemat waktu inspeksi gizi harian hingga 80% dengan akurasi menu 99%.",
      date: "15 Mei 2026",
      source: "Teknologi AI",
      image: "/assets/picture/AI.jpg"
    }
  ];

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % newsItems.length);
    }, 4000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % newsItems.length);
    startAutoplay();
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + newsItems.length) % newsItems.length);
    startAutoplay();
  };

  const handleDotClick = (idx: number) => {
    setActiveSlide(idx);
    startAutoplay();
  };

  return (
    <section
      id="news"
      className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-24 overflow-hidden"
    >
      <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
        
        {/* Kolom Teks Kiri */}
        <div ref={textRef} className={`lg:col-span-2 ${revealClasses(textVisible, "right")}`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs mb-6 shadow-sm">
            <Newspaper className="w-3.5 h-3.5" />
            Kabar & Informasi
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Berita & Cerita Dampak Nutrio
          </h2>
          <p className="text-slate-500 text-sm leading-[1.65] mb-8">
            Dapatkan berita terbaru mengenai kesuksesan program Makan Bergizi Gratis, kisah inspiratif petani lokal, sertifikasi dapur catering, dan pengembangan teknologi pangan terbaru dari ekosistem Nutrio.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-600 shadow-sm"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-600 shadow-sm"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Kolom Karusel Kanan */}
        <div 
          ref={carouselRef}
          className={`lg:col-span-3 relative group ${revealClasses(carouselVisible, "left", 100)}`}
          onMouseEnter={stopAutoplay}
          onMouseLeave={startAutoplay}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg bg-white relative aspect-[16/10] sm:aspect-[16/9]">
            {newsItems.map((item, index) => {
              const isActive = index === activeSlide;

              return (
                <div
                  key={index}
                  className={`absolute inset-0 flex flex-col md:flex-row transition-opacity duration-700 ${
                    isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  {/* Foto Berita */}
                  <div className="w-full md:w-[45%] h-48 md:h-full relative overflow-hidden bg-slate-950">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-950/20" />
                  </div>

                  {/* Konten Berita */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {item.source}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <a 
                      href="#" 
                      className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 gap-1 mt-6 self-start group/link"
                    >
                      Baca Selengkapnya 
                      <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {newsItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeSlide ? "w-6 bg-indigo-600" : "w-2 bg-slate-350"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
