export default function DashboardInsights() {
  return (
    <div className="space-y-12">
      {/* Hero Title */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e9c176]/10 pb-8">
        <div>
          <h1 className="text-5xl italic text-[#2A1720] leading-tight">Operational Insights</h1>
          <p className="text-[#e9c176] italic text-lg mt-2">Curating the rhythm of digital romance</p>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-1.5 rounded-full bg-gray-100 text-xs text-gray-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Traffic
          </span>
          <span className="px-4 py-1.5 rounded-full bg-gray-100 text-xs text-gray-500">Last 24 Hours</span>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Narrative Performance */}
        <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#e9c176]/20" />
          <div className="flex justify-between items-start mb-10">
            <h3 className="text-2xl italic">Narrative Performance</h3>
            <span className="material-symbols-outlined text-[#e9c176]">auto_awesome</span>
          </div>
          <div className="space-y-8">
            {[
              { label: "Desire", value: 88 },
              { label: "Tension", value: 74 },
              { label: "Mystery", value: 92 },
              { label: "Romance", value: 81 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs uppercase tracking-widest">{item.label}</span>
                  <span className="text-xs">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#e9c176]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#e9c176]/60 to-[#e9c176] rounded-full"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Projection */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-2xl italic">Trend Projection</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-tight text-gray-400">
                <span className="w-2 h-2 rounded-sm bg-[#e9c176]" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-tight text-gray-400">
                <span className="w-2 h-2 rounded-sm bg-[#e9c176]/30" /> Engagement
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-2 px-2">
            {[
              { day: "Lun", h: 16, mid: 12, top: 6 },
              { day: "Mar", h: 24, mid: 18, top: 8 },
              { day: "Mer", h: 32, mid: 24, top: 14 },
              { day: "Jeu", h: 40, mid: 32, top: 20 },
              { day: "Ven", h: 44, mid: 36, top: 28 },
              { day: "Sam", h: 36, mid: 28, top: 16 },
              { day: "Dim", h: 28, mid: 20, top: 10 },
            ].map((bar) => (
              <div key={bar.day} className="flex-1 space-y-2">
                <div className="w-full bg-[#e9c176]/10 rounded-t-lg relative" style={{ height: `${bar.h * 4}px` }}>
                  <div className="absolute bottom-0 w-full bg-[#e9c176]/30 rounded-t-lg" style={{ height: `${bar.mid * 4}px` }} />
                  <div className="absolute bottom-0 w-full bg-[#e9c176] rounded-t-lg" style={{ height: `${bar.top * 4}px` }} />
                </div>
                <span className="block text-center text-[10px] uppercase text-gray-400">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reader Journey Funnel */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl italic">Reader Journey Funnel</h3>
            <span className="text-[#e9c176] text-sm uppercase tracking-widest font-semibold">+12% Conversion</span>
          </div>
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50">
              <span className="text-[#e9c176] mb-2 font-bold text-lg">12.4k</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Chapitre 1</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-[#e9c176]/20">
              <span className="text-[#e9c176] mb-2 font-bold text-lg">8.2k</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">L'Accroche</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-[#e9c176]/20">
              <span className="text-[#e9c176] mb-2 font-bold text-lg">3.1k</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Chapitre 5</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-primary text-white">
              <span className="text-white/80 mb-2 font-bold text-lg">1.4k</span>
              <span className="text-[10px] uppercase tracking-widest opacity-80">Achat</span>
            </div>
          </div>
        </div>

        {/* Peak Hours Heatmap */}
        <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-8 border border-[#e9c176]/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl italic">Peak Hours</h3>
            <span className="material-symbols-outlined text-[#e9c176]/60">info</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            <div className="col-span-7 flex justify-between mb-2">
              <span className="text-[9px] uppercase tracking-tight opacity-40">00h</span>
              <span className="text-[9px] uppercase tracking-tight opacity-40">12h</span>
              <span className="text-[9px] uppercase tracking-tight opacity-40">23h</span>
            </div>
            {[
              [5, 10, 40, 80, 90, 30, 5],
              [10, 20, 60, 100, 70, 20, 10],
              [5, 30, 80, 60, 30, 10, 5],
              [0, 5, 20, 40, 10, 5, 0],
            ].map((row, ri) =>
              row.map((v, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: `rgba(233, 193, 118, ${v / 100})` }}
                />
              ))
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-[#e9c176]/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl italic">22:00</span>
              <span className="text-[10px] uppercase text-gray-400 leading-tight">Fenetre de publication optimale</span>
            </div>
            <span className="material-symbols-outlined text-[#e9c176]">auto_mode</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-12 border-t border-[#e9c176]/10 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <h4 className="text-xl italic">Narrative Integrity</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Maintaining the emotional equilibrium between reader curiosity and narrative payoff.
            Our current mystery index is at an all-time high.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-xl italic">Global Reach</h4>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e9c176]/5 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#e9c176]">public</span>
            </div>
            <div>
              <span className="block text-lg font-bold">142</span>
              <span className="text-xs uppercase tracking-widest opacity-60">Active Regions</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xl italic">Operational Health</h4>
          <div className="p-4 bg-gray-100 rounded-xl flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest">System Latency</span>
            <span className="text-[#e9c176] font-bold">42ms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
