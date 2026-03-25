import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface InsightsData {
  narrativePerformance: {
    topChapter: { title: string; protagonistName: string } | null;
    metrics: { label: string; value: number }[];
  };
  trendProjection: { day: string; sessions: number; seconds: number }[];
  readerFunnel: { label: string; count: number }[];
  peakHours: {
    heatmap: number[][];
    peakHour: string;
  };
}

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function DashboardInsights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard/insights")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e9c176]" />
      </div>
    );
  }

  if (!data) return null;

  const maxSessions = Math.max(...data.trendProjection.map((d) => d.sessions), 1);
  const maxFunnel = Math.max(...data.readerFunnel.map((f) => f.count), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl text-[#e9c176] italic">Operational Insights</h2>
          <p className="tracking-[0.2em] uppercase text-xs text-gray-400 mt-2">
            Real-time narrative & engagement metrics
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-white dark:bg-[#2b141e] rounded-full border border-[#e9c176]/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/70">
              Donnees en temps reel
            </span>
          </div>
        </div>
      </div>

      {/* ===== Narrative Performance ===== */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl italic text-gray-600">Narrative Performance</h3>
          <div className="h-px flex-grow bg-gradient-to-r from-[#e9c176]/20 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Atmospheric Resonance */}
          <div className="md:col-span-2 bg-white dark:bg-[#2b141e] rounded-2xl p-6 border-t border-[#e9c176]/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e9c176]/60 to-[#e9c176] opacity-30" />
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="uppercase tracking-widest text-[10px] text-gray-400 dark:text-white/40 mb-1">
                  Resonance Atmospherique
                </h4>
                {data.narrativePerformance.topChapter && (
                  <p className="text-xl italic text-[#e9c176]">
                    "{data.narrativePerformance.topChapter.title}"
                  </p>
                )}
              </div>
              <span className="material-symbols-outlined text-[#e9c176]">monitoring</span>
            </div>
            <div className="space-y-6">
              {data.narrativePerformance.metrics.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
                    <span className="text-gray-500 dark:text-white/60">{item.label}</span>
                    <span className="text-[#e9c176]">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-[#301822] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#e9c176]/60 to-[#e9c176] rounded-full transition-all"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Projection */}
          <div className="md:col-span-2 bg-white dark:bg-[#2b141e] rounded-2xl p-6 border-t border-[#e9c176]/10">
            <h4 className="uppercase tracking-widest text-[10px] text-gray-400 dark:text-white/40 mb-6">
              Projection 7 jours
            </h4>
            <div className="h-48 flex items-end gap-2 px-4">
              {data.trendProjection.map((d, i) => {
                const pct = Math.round((d.sessions / maxSessions) * 100);
                const isMax = d.sessions === maxSessions;
                return (
                  <div key={i} className="flex-grow flex flex-col items-center gap-1">
                    <span className="text-[9px] text-[#e9c176] font-semibold">{d.sessions}</span>
                    <div
                      className="w-full rounded-t-lg hover:brightness-125 transition-all"
                      style={{
                        height: `${Math.max(pct, 4)}%`,
                        background: isMax
                          ? "linear-gradient(to right, rgba(233,193,118,0.6), #e9c176)"
                          : `rgba(233,193,118,${pct / 300 + 0.05})`,
                        boxShadow: isMax ? "0 0 20px rgba(233,193,118,0.2)" : "none",
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[9px] uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 px-4">
              {data.trendProjection.map((d, i) => (
                <span key={i}>{d.day}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Reader Journey ===== */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl italic text-gray-600">Reader Journey</h3>
          <div className="h-px flex-grow bg-gradient-to-r from-[#e9c176]/20 to-transparent" />
        </div>
        <div className="bg-white dark:bg-[#2b141e] rounded-2xl p-8 border border-[#e9c176]/5">
          <div className="flex flex-col lg:flex-row items-center gap-4 overflow-x-auto pb-4">
            {data.readerFunnel.map((step, i, arr) => {
              const isLast = i === arr.length - 1;
              const heightPct = Math.round((step.count / maxFunnel) * 100);
              return (
                <div key={step.label} className="flex-1 min-w-[180px] flex flex-col items-center">
                  <div
                    className="w-full rounded-xl flex items-center justify-center p-4 relative"
                    style={{
                      height: `${Math.max(heightPct, 30)}px`,
                      background: isLast
                        ? "linear-gradient(to right, rgba(233,193,118,0.6), #e9c176)"
                        : `rgba(233,193,118,${heightPct / 250 + 0.05})`,
                    }}
                  >
                    <span className={`text-lg italic ${isLast ? "text-[#220c16]" : "text-[#e9c176]"}`}>
                      {step.label}
                    </span>
                    {i < arr.length - 1 && (
                      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                        <span className="material-symbols-outlined text-[#e9c176]/40">chevron_right</span>
                      </div>
                    )}
                  </div>
                  <p className={`mt-4 text-[10px] uppercase tracking-widest ${isLast ? "text-[#e9c176] font-bold" : "text-gray-400 dark:text-white/40"}`}>
                    {step.count.toLocaleString("fr-FR")} utilisateurs
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Peak Reading Times ===== */}
      <section className="pb-24">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl italic text-gray-600">Peak Reading Times</h3>
          <div className="h-px flex-grow bg-gradient-to-r from-[#e9c176]/20 to-transparent" />
        </div>
        <div className="bg-white dark:bg-[#2b141e] rounded-2xl p-8 border border-[#e9c176]/5">
          {/* Legend */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-[#301822]" />
                <span className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-white/30">Dormant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#e9c176]" />
                <span className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-white/30">Peak</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-[#e9c176]">
                Peak: {data.peakHours.peakHour}
              </span>
              <span className="material-symbols-outlined text-[#e9c176]">auto_mode</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {data.peakHours.heatmap.map((row, ri) => (
                <div key={ri} className="flex gap-1 mb-1">
                  <div className="w-8 text-[9px] text-gray-400 dark:text-white/30 flex items-center">
                    {DAY_LABELS[ri]}
                  </div>
                  <div className="flex-1 grid grid-cols-[repeat(24,1fr)] gap-1">
                    {row.map((v, ci) => (
                      <div
                        key={ci}
                        className="aspect-square rounded-sm hover:brightness-125 transition-all"
                        style={{
                          backgroundColor: v === 0
                            ? "var(--heatmap-empty, #f3f4f6)"
                            : `rgba(233, 193, 118, ${v / 100})`,
                          boxShadow: v === 100 ? "0 0 8px rgba(233,193,118,0.4)" : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Hour labels */}
              <div className="flex gap-1 mt-2 ml-9">
                <div className="flex-1 grid grid-cols-[repeat(24,1fr)] gap-1 text-[8px] text-gray-400 dark:text-white/30 text-center">
                  {Array.from({ length: 24 }, (_, i) => (
                    <span key={i}>{i % 3 === 0 ? i : ""}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .dark [style*="--heatmap-empty"] { --heatmap-empty: #301822; }
      `}</style>
    </div>
  );
}
