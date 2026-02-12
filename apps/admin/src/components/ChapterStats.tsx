import React from "react";

interface ChapterStatsProps {
  stats: {
    total: number;
    published: number;
    draft: number;
    inProgress: number;
    publishedPercentage: number;
    draftPercentage: number;
    inProgressPercentage: number;
  } | null;
}

export default function ChapterStats({ stats }: ChapterStatsProps) {
  return (
    <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border-border-light dark:bg-[#2d161c] border dark:border-[#4d252f] shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-[#c992a0] text-sm font-semibold uppercase tracking-wider">
            Total Contes
          </p>
          <span className="material-symbols-outlined text-red-600/60">
            library_books
          </span>
        </div>
        <p className="text-charcoal dark:text-white text-3xl font-bold leading-tight">
          {stats?.total ?? 0}
        </p>
        <div className="w-full bg-light-plum dark:bg-black/20 h-1.5 rounded-full mt-2">
          <div
            className="bg-red-600 h-full rounded-full"
            style={{ width: "100%" }}></div>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border-border-light dark:bg-[#2d161c] border dark:border-[#4d252f] shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-[#c992a0] text-sm font-semibold uppercase tracking-wider">
            Publiés
          </p>
          <span className="material-symbols-outlined text-emerald-500/60">
            check_circle
          </span>
        </div>
        <p className="text-charcoal dark:text-white text-3xl font-bold leading-tight">
          {stats?.published ?? 0}
        </p>
        <div className="w-full bg-light-plum dark:bg-black/20 h-1.5 rounded-full mt-2">
          <div
            className="bg-emerald-500 h-full rounded-full"
            style={{ width: `${stats?.publishedPercentage ?? 0}%` }}></div>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border-border-light dark:bg-[#2d161c] border dark:border-[#4d252f] shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-[#c992a0] text-sm font-semibold uppercase tracking-wider">
            Brouillons
          </p>
          <span className="material-symbols-outlined text-amber-500/60">
            edit_note
          </span>
        </div>
        <p className="text-charcoal dark:text-white text-3xl font-bold leading-tight">
          {stats?.draft ?? 0}
        </p>
        <div className="w-full bg-light-plum dark:bg-black/20 h-1.5 rounded-full mt-2">
          <div
            className="bg-amber-500 h-full rounded-full"
            style={{ width: `${stats?.draftPercentage ?? 0}%` }}></div>
        </div>
      </div>
    </div>
  );
}
