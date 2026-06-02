"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/65 backdrop-blur-xl border-b border-slate-200/40 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg shadow-sm transition-colors duration-300 ${
              scrolled
                ? "bg-indigo-600 text-white"
                : "bg-white/10 backdrop-blur-md text-white border border-white/10"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span
            className={`font-bold text-xl tracking-tight transition-colors duration-300 ${
              scrolled ? "text-slate-900" : "text-white"
            }`}
          >
            Nutrio
          </span>
        </div>

        <div
          className={`hidden md:flex items-center gap-8 text-sm font-medium transition-colors duration-300 ${
            scrolled ? "text-slate-600" : "text-white/80"
          }`}
        >
          <a
            href="#problem"
            className={`transition-colors ${
              scrolled ? "hover:text-indigo-600" : "hover:text-white"
            }`}
          >
            Visi
          </a>
          <a
            href="#features"
            className={`transition-colors ${
              scrolled ? "hover:text-indigo-600" : "hover:text-white"
            }`}
          >
            Solusi
          </a>
          <a
            href="#dashboard"
            className={`transition-colors ${
              scrolled ? "hover:text-indigo-600" : "hover:text-white"
            }`}
          >
            Dashboard
          </a>
          <Link
            href="/asisten"
            className={`flex items-center gap-1.5 font-bold transition-colors px-3 py-1 rounded-full ${
              scrolled
                ? "text-indigo-600 hover:text-indigo-700 bg-indigo-50"
                : "text-white hover:text-white bg-white/10 backdrop-blur-md border border-white/10"
            }`}
          >
            <ShieldCheck className="w-4 h-4 animate-pulse" />
            Tanya Juknis (AI)
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/demo-accounts"
            className={`hidden sm:block text-sm font-medium transition-colors ${
              scrolled
                ? "text-slate-600 hover:text-indigo-600"
                : "text-white/80 hover:text-white"
            }`}
          >
            Lihat Demo
          </Link>
          <Link href="/login">
            <Button
              className={`rounded-full hover:-translate-y-0.5 transition-all text-sm h-9 px-4 sm:px-6 font-bold ${
                scrolled
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:shadow-btn"
                  : "bg-white text-slate-900 hover:bg-white/90 shadow-lg"
              }`}
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
