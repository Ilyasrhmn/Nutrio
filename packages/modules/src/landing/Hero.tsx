"use client";

import Link from "next/link";
import { ArrowRight, School, Truck, ClipboardCheck } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useScrollReveal, revealClasses } from "./useScrollReveal";

export function Hero() {
  const [badgeRef, badgeVisible] = useScrollReveal({ threshold: 0.3 });
  const [headingRef, headingVisible] = useScrollReveal({ threshold: 0.2 });
  const [subtitleRef, subtitleVisible] = useScrollReveal({ threshold: 0.2 });
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.2 });
  const [metricsRef, metricsVisible] = useScrollReveal({ threshold: 0.3 });

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Video/Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
          alt="Nutritious school meals"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
        >
          <source
            src="/assets/MBG+Nutrio.webm"
            type="video/webm"
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 text-center pt-24 sm:pt-28 pb-32">
        {/* Badge */}
        <div ref={badgeRef} className={revealClasses(badgeVisible, "fade")}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 font-semibold text-xs mb-6 shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ekosistem Transparansi Pangan Sekolah · MBG 2026
          </div>
        </div>

        {/* Heading */}
        <div ref={headingRef} className={revealClasses(headingVisible, "up", 100)}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-4 text-white">
            Jaga Nutrisi Siswa,
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-indigo-100 bg-clip-text text-transparent">
              Bangun Kepercayaan Bersama.
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className={revealClasses(subtitleVisible, "up", 200)}>
          <p className="text-base sm:text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-[1.7]">
            Nutrio menghubungkan Sekolah, Dapur Catering (Vendor), dan Supplier
            Bahan Baku secara real-time. Memastikan setiap porsi Makan Bergizi
            Gratis (MBG) higienis, bergizi seimbang, dan terpantau.
          </p>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className={revealClasses(ctaVisible, "up", 300)}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <a href="#dashboard" className="w-full sm:w-auto">
              <Button className="bg-white text-slate-900 rounded-full hover:-translate-y-0.5 shadow-xl hover:shadow-2xl transition-all duration-300 group h-13 px-10 font-bold text-sm w-full">
                Dashboard Publik
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <Link href="/demo-accounts" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="rounded-full h-13 px-10 font-bold border-white/20 text-white bg-white/5 backdrop-blur-md hover:bg-white/15 transition-all duration-300 w-full"
              >
                Coba Demo Kemitraan
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Metrics */}
        <div ref={metricsRef} className={revealClasses(metricsVisible, "up", 400)}>
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-semibold text-white/90 flex items-center gap-2 shadow-lg">
              <School className="w-4 h-4 text-indigo-300" />
              120+ Sekolah Mitra
            </div>
            <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-semibold text-white/90 flex items-center gap-2 shadow-lg">
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              96.8% Higienitas Terjamin
            </div>
            <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-semibold text-white/90 flex items-center gap-2 shadow-lg">
              <Truck className="w-4 h-4 text-amber-400" />
              45+ Supplier Lokal
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/40 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
