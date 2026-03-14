export function Problem() {
  return (
    <section
      id="problem"
      className="bg-slate-900 text-white py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-medium text-xs mb-8">
          Masalah yang Belum Terpecahkan
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Portal perizinan sudah ada. Tapi siapa yang mengawasi setelah vendor
          disetujui?
        </h2>

        <p className="text-lg text-slate-400 mb-16 leading-[1.65]">
          Izin usaha hanyalah langkah pertama. Keracunan masal tidak terjadi
          karena perizinan yang salah, melainkan karena kelalaian harian di
          dapur yang tidak terpantau.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
          <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
              25.000+
            </span>
            <span className="text-sm font-medium text-slate-300 text-center">
              korban keracunan 2025
            </span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
              80%
            </span>
            <span className="text-sm font-medium text-slate-300 text-center">
              kasus karena SOP, bukan perizinan
            </span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
              19.188
            </span>
            <span className="text-sm font-medium text-slate-300 text-center">
              SPPG tanpa monitoring real-time
            </span>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
              45+
            </span>
            <span className="text-sm font-medium text-slate-300 text-center">
              dapur ditutup reaktif setelah ada korban
            </span>
          </div>
        </div>

        <p className="italic text-slate-400 text-lg font-medium">
          &quot;BGN menutup dapur setelah korban jatuh — bukan
          sebelumnya.&quot;
        </p>
      </div>
    </section>
  );
}
