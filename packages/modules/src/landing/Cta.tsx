"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Heart,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useScrollReveal, revealClasses } from "./useScrollReveal";
import SplitText from "./SplitText";

export function Cta() {
  const [ctaRef, ctaVisible] = useScrollReveal({ threshold: 0.2 });
  const [footerRef, footerVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <div className="overflow-hidden">
      {/* 1. CTA Section — BRIGHT / Light background for clear contrast before footer */}
      <section
        id="cta"
        className="relative py-24 sm:py-32 bg-white text-center"
      >
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-60" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60" />

        <div
          ref={ctaRef}
          className={`relative z-10 max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col items-center ${revealClasses(ctaVisible, "scale")}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs mb-8 border border-indigo-100 shadow-sm">
            <span className="size-2 rounded-full bg-indigo-500 animate-pulse" />
            Bergabung Sekarang
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Mari Ciptakan Standar Baru{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
              Transparansi Pangan
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mb-10 max-w-2xl leading-relaxed">
            Bergabunglah dengan ratusan sekolah, vendor UMKM catering mandiri,
            dan supplier lokal tepercaya yang telah membangun ekosistem Makan
            Bergizi Gratis (MBG) sehat, higienis, dan tepercaya bersama Nutrio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full justify-center">
            <Button className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:shadow-btn hover:-translate-y-0.5 transition-all h-13 px-10 font-bold text-sm w-full sm:w-auto group">
              Daftar Sebagai Mitra
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href="/demo-accounts" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="rounded-full border-slate-300 text-slate-700 hover:bg-slate-50 transition-all h-13 px-10 font-bold text-sm w-full"
              >
                Coba Akun Demo
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>SNAP API Compatible</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>BPOM Sanitation Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Kemenkes Hygiene Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>WhatsApp Notification</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Giant Typography Footer — Full Screen */}
      <footer className="bg-slate-950 text-slate-400 flex flex-col relative">
        {/* Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-px bg-slate-800" />

        <div
          ref={footerRef}
          className={`max-w-screen-2xl mx-auto w-full px-6 sm:px-10 lg:px-16 pt-16 sm:pt-20 pb-6 sm:pb-8 ${revealClasses(footerVisible, "up")}`}
        >
          {/* Footer layout — Logo left, Nav columns right */}
          <div className="flex flex-col md:flex-row md:justify-between gap-12">
            {/* Logo & Deskripsi */}
            <div className="flex flex-col justify-center max-w-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-600 p-2.5 rounded-xl text-white">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <span className="font-extrabold text-3xl tracking-tight text-white">
                  Nutrio
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
                Ekosistem digital transparansi pangan sekolah untuk program
                Makan Bergizi Gratis (MBG) yang aman, sehat, higienis, dan
                terpercaya.
              </p>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-500 font-medium">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                <span>Mendukung Kedaulatan Pangan Lokal</span>
              </div>
            </div>

            {/* Navigasi & Layanan — pushed to the right */}
            <div className="flex flex-col sm:flex-row gap-12 lg:gap-16 shrink-0">
              {/* Navigasi */}
              <div className="flex flex-col">
                <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-widest mb-6">
                  Navigasi
                </h4>
                <ul className="space-y-4 text-sm sm:text-base text-slate-400 font-medium">
                  <li>
                    <a
                      href="#hero"
                      className="hover:text-white transition-colors"
                    >
                      Utama
                    </a>
                  </li>
                  <li>
                    <a
                      href="#problem"
                      className="hover:text-white transition-colors"
                    >
                      Visi & Galeri
                    </a>
                  </li>
                  <li>
                    <a
                      href="#features"
                      className="hover:text-white transition-colors"
                    >
                      Tiga Pilar
                    </a>
                  </li>
                  <li>
                    <a
                      href="#dashboard"
                      className="hover:text-white transition-colors"
                    >
                      Dashboard Publik
                    </a>
                  </li>
                </ul>
              </div>

              {/* Layanan */}
              <div className="flex flex-col">
                <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-widest mb-6">
                  Layanan
                </h4>
                <ul className="space-y-4 text-sm sm:text-base text-slate-400 font-medium">
                  <li>
                    <Link
                      href="/asisten"
                      className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      AI Asisten Juknis
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Syarat Layanan
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Kebijakan Privasi
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Hubungi Kami
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* GIANT NUTRIO TEXT — Hidden on mobile, fills remaining space on tablet/desktop */}
        <div className="hidden md:flex items-end relative overflow-hidden select-none w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Subtle separator line fading at the edges */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500/90 to-transparent z-20 pointer-events-none" />

          {/* Top fade gradient */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none" />

          <div className="pb-0 w-full flex justify-between items-end">
            <SplitText
              text="NUTRIO."
              tag="div"
              className="font-black text-white leading-none uppercase pointer-events-none w-full !flex justify-between items-center"
              style={{ fontWeight: 950, fontSize: "clamp(60px, 22vw, 400px)" }}
              delay={90}
              duration={2.8}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.15}
              rootMargin="-50px"
              resetOnLeave
            />
          </div>
        </div>

        {/* Mobile footer bottom — shown only on mobile since NUTRIO text is hidden */}
        <div className="md:hidden flex-1 flex items-end">
          <div className="border-t border-slate-800/50 px-6 py-8 sm:py-10 w-full">
            <p className="text-[10px] text-slate-600 text-center">
              © 2026 Nutrio. Hak cipta dilindungi undang-undang.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
