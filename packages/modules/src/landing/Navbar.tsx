import { ShieldCheck } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Nutrio
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a
            href="#problem"
            className="hover:text-indigo-600 transition-colors"
          >
            Masalah
          </a>
          <a
            href="#features"
            className="hover:text-indigo-600 transition-colors"
          >
            Solusi
          </a>
          <a
            href="#dashboard"
            className="hover:text-indigo-600 transition-colors"
          >
            Dashboard
          </a>
          <Link
            href="/asisten"
            className="flex items-center gap-1.5 text-indigo-600 font-bold hover:text-indigo-700 transition-colors px-3 py-1 bg-indigo-50 rounded-full"
          >
            <ShieldCheck className="w-4 h-4 animate-pulse" />
            Tanya Juknis (AI)
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#cta"
            className="hidden sm:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Lihat Demo
          </a>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full hover:shadow-[0_4px_14px_0_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all text-sm h-9 px-4 sm:px-6 font-bold">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
