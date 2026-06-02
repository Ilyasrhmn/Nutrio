"use client";

import { Eye, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { useScrollReveal, revealClasses } from "./useScrollReveal";

export function Problem() {
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.2 });
  const [galleryRef, galleryVisible] = useScrollReveal({ threshold: 0.1 });
  const [featuresRef, featuresVisible] = useScrollReveal({ threshold: 0.2 });

  const galleryItems = [
    {
      title: "Rantai Pasok Mentah Segar",
      desc: "Supplier lokal mendistribusikan sayuran organik dan protein segar langsung dari kebun.",
      image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=600&q=80",
      tag: "Supplier"
    },
    {
      title: "Sterilisasi & Dapur Higienis",
      desc: "Standardisasi dapur catering UMKM yang terjaga kebersihannya di setiap proses memasak.",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
      tag: "Vendor"
    },
    {
      title: "Penyajian Bergizi di Sekolah",
      desc: "Siswa menikmati porsi makan siang dengan gizi seimbang yang terverifikasi kebersihannya.",
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80",
      tag: "Sekolah"
    },
    {
      title: "Kepatuhan SOP Berkala",
      desc: "Koki dan staf dapur melakukan pemeriksaan kesehatan harian dengan foto bukti real-time.",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
      tag: "Kepatuhan"
    }
  ];

  return (
    <section
      id="problem"
      className="bg-slate-900 text-white pt-20 sm:pt-24 pb-32 sm:pb-40 relative overflow-hidden"
    >
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div 
          ref={headerRef} 
          className={`max-w-3xl mx-auto text-center mb-16 flex flex-col items-center ${revealClasses(headerVisible, "up")}`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold text-xs mb-6 border border-slate-700/50">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Nilai Inti & Visi Kami
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Membangun Kepercayaan Melalui Keterbukaan Informasi
          </h2>

          <p className="text-lg text-slate-400 leading-[1.65]">
            Kami percaya makanan terbaik bermula dari kejujuran di setiap langkah. Nutrio hadir bukan untuk mengawasi dengan kaku, melainkan menjadi wadah kolaborasi transparan yang membanggakan bagi seluruh pihak yang terlibat.
          </p>
        </div>

        {/* Interactive Greyscale Hover Gallery */}
        <div 
          ref={galleryRef} 
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ${revealClasses(galleryVisible, "up", 100)}`}
        >
          {galleryItems.map((item, index) => (
            <div 
              key={index}
              className={`group relative bg-slate-800/40 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/30 transition-all duration-300 flex flex-col shadow-lg`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-950">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="h-full w-full object-cover filter grayscale hover:grayscale-0 scale-100 hover:scale-105 transition-all duration-500 ease-in-out cursor-pointer"
                />
                <span className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {item.tag}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Trust Elements */}
        <div 
          ref={featuresRef} 
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-slate-800/80 ${revealClasses(featuresVisible, "up", 200)}`}
        >
          <div className="flex gap-4">
            <div className="size-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Transparansi Mutlak</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Informasi higienitas, menu harian, dan asal bahan mentah tersaji terbuka untuk pihak sekolah dan publik.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="size-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Jaminan Higienitas SOP</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Standar baku kepatuhan harian yang diisi mandiri dengan foto bukti autentik, bukan sekadar tanda tangan kertas.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="size-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 shrink-0 border border-rose-500/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Keadilan & Dampak Sosial</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Pemberdayaan UMKM catering lokal dan koperasi tani daerah untuk pertumbuhan ekonomi sirkular yang inklusif.</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
