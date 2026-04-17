import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface DayStat {
  date: string;
  count: number;
  label: string;
}

interface ConnectionStats {
  days: DayStat[];
  average: number;
  total: number;
}

interface ConnectionStatsChartProps {
  days?: number;
  title?: string;
  subtitle?: string;
}

export default function ConnectionStatsChart({
  days = 15,
  title = "Connexions journalieres",
  subtitle = "Utilisateurs uniques actifs par jour",
}: ConnectionStatsChartProps) {
  const [stats, setStats] = useState<ConnectionStats | null>(null);

  useEffect(() => {
    api
      .get(`/admin/users/connection-stats?days=${days}`)
      .then((res: any) => setStats(res.data))
      .catch(() => {});
  }, [days]);

  if (!stats || !stats.days) return null;

  const maxCount = Math.max(...stats.days.map((d) => d.count), 1);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">
            {subtitle} ({days} derniers jours)
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-amber-600">
            {stats.average}
          </span>
          <span className="text-sm text-gray-400 ml-1">moy/jour</span>
        </div>
      </div>

      <div
        className="flex items-end gap-1.5"
        style={{ height: 200 }}>
        {stats.days.map((day) => {
          const heightPct = (day.count / maxCount) * 100;
          const isToday = day.date === today;

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1 h-full mt-auto">
              <div className="flex h-full"></div>
              <span className="text-[10px] text-gray-400 font-medium">
                {day.count || ""}
              </span>
              <div
                className={`w-full rounded-t-md transition-all ${
                  isToday
                    ? "bg-gradient-to-t from-amber-500 to-amber-400"
                    : day.count > 0
                      ? "bg-gradient-to-t from-amber-200 to-amber-100"
                      : "bg-gray-100"
                }`}
                style={{
                  height: `${Math.max(heightPct, 4)}%`,
                  minHeight: 3,
                }}
                title={`${day.label}: ${day.count} utilisateur(s) actif(s)`}
              />
              <span
                className={`text-[9px] ${isToday ? "text-amber-600 font-bold" : "text-gray-300"}`}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
