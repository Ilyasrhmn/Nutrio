import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function Cta() {
  return (
    <section
      id="cta"
      className="relative py-20 lg:py-24 bg-gradient-to-br from-indigo-900 to-indigo-950 overflow-hidden text-center"
    >
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          Hentikan keracunan{" "}
          <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
            berikutnya
          </span>
        </h2>
        <p className="text-lg text-indigo-200 mb-10 max-w-2xl">
          Sistem reaktif menunggu korban jatuh. Sistem proaktif mencegahnya.
          Bergabunglah membangun ekosistem MBG yang aman, transparan, dan
          dapat diandalkan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full justify-center">
          <Button className="bg-white text-indigo-900 rounded-full hover:bg-slate-50 transition-colors h-14 px-8 font-semibold text-base w-full sm:w-auto">
            Daftar Sekarang — Gratis
          </Button>
          <Link href="/demo-accounts" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="rounded-full border-white/20 text-white bg-white/5 hover:bg-white/10 transition-colors h-14 px-8 font-semibold text-base w-full"
            >
              Mulai Demo
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-indigo-100/80">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Terintegrasi BI SNAP API</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Terkoneksi BPOM</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Kompatibel data.go.id</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>WhatsApp Business</span>
          </div>
        </div>
      </div>
    </section>
  );
}
