import { useState, useMemo } from "react";
import { MdShowChart } from "react-icons/md";
import { storage, STORAGE_KEYS } from "../lib/storage";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
}

export type Period = "7days" | "30days" | "3months" | "6months" | "year";

interface RevenueEvolutionChartProps {
  orders: Order[];
  locale?: string;
  selectedPeriod?: Period;
  onPeriodChange?: (period: Period) => void;
}

export default function RevenueEvolutionChart({
  orders,
  locale = "fr",
  selectedPeriod: externalPeriod,
  onPeriodChange,
}: RevenueEvolutionChartProps) {
  // Load period from localStorage or default to "30days" (only if not controlled)
  const [internalPeriod, setInternalPeriod] = useState<Period>(() => {
    return storage.getString(STORAGE_KEYS.REVENUE_PERIOD, "30days") as Period;
  });

  // Use external period if provided, otherwise use internal state
  const selectedPeriod =
    externalPeriod !== undefined ? externalPeriod : internalPeriod;

  // Save period to localStorage when it changes
  const handlePeriodChange = (period: Period) => {
    if (onPeriodChange) {
      onPeriodChange(period);
    } else {
      setInternalPeriod(period);
      storage.set(STORAGE_KEYS.REVENUE_PERIOD, period);
    }
  };

  const periodLabels: Record<Period, string> = {
    "7days": "7 derniers jours",
    "30days": "30 derniers jours",
    "3months": "3 derniers mois",
    "6months": "6 derniers mois",
    year: "12 derniers mois",
  };

  // Calculate date range based on period
  const getDateRange = (period: Period): Date => {
    const now = new Date();
    switch (period) {
      case "7days":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30days":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "3months":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case "6months":
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case "year":
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
  };

  // Map order types to French labels (same as SalesDistributionChart)
  const typeMapping: Record<string, string> = {
    VOLUME: "Volumes",
    CHAPTER: "Chapitres",
    POV_CHAPTER: "POV Chapitre",
    POV_VOLUME: "POV Volume",
    EPILOGUE: "Épilogue",
    COLORING: "Coloriage",
    BUNDLE: "Bundles",
    SUBSCRIPTION: "Abonnement",
    PREORDER: "Volumes", // Preorders are volumes
  };

  // Scope colors (same as SalesDistributionChart)
  const scopeColors: Record<string, string> = {
    Volumes: "#3b82f6", // blue
    Chapitres: "#8b5cf6", // purple
    Épilogue: "#ec4899", // pink
    "Points de vue": "#f97316", // orange
    Coloriage: "#06b6d4", // cyan
    Bundles: "#10b981", // green
    Abonnement: "#eab308", // yellow
  };

  // Define all possible types to always show all categories
  // This ensures all categories appear in the chart even if they have no sales
  const allTypes = useMemo(() => {
    // Get all unique values from typeMapping to ensure we show all defined categories
    const predefinedTypes = new Set(Object.values(typeMapping));

    // Also check for any orders with unmapped types (will be shown as "Autres")
    orders
      .filter((o) => o.status === "PAID")
      .forEach((order) => {
        if (!typeMapping[order.type]) {
          predefinedTypes.add("Autres");
        }
      });

    return predefinedTypes;
  }, [orders]);

  // Format data by day/month based on period with breakdown by type
  const chartData = useMemo(() => {
    const startDate = getDateRange(selectedPeriod);
    const now = new Date();
    const filteredOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startDate && o.status === "PAID"
    );

    // Group by day or month depending on period
    const useMonthly = ["6months", "year"].includes(selectedPeriod);
    const groupedData = new Map<
      string,
      { total: number; byType: Record<string, number> }
    >();

    // Create all time slots from start to now with 0 values for ALL types
    const allTimeSlots = new Set<string>();
    let currentDate = new Date(startDate);

    while (currentDate <= now) {
      let key: string;
      if (useMonthly) {
        key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      } else {
        key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
      }
      allTimeSlots.add(key);

      // Initialize with 0 values for ALL types
      if (!groupedData.has(key)) {
        const byType: Record<string, number> = {};
        allTypes.forEach((type) => {
          byType[type] = 0;
        });
        groupedData.set(key, { total: 0, byType });
      }

      // Increment date
      if (useMonthly) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Add actual order data
    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      let key: string;

      if (useMonthly) {
        // Group by month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // Group by day
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }

      const label = typeMapping[order.type] || "Autres";
      const current = groupedData.get(key);
      if (current) {
        current.total += order.amountTotal;
        current.byType[label] =
          (current.byType[label] || 0) + order.amountTotal;
      }
    });

    // Convert to array and sort
    const sortedData = Array.from(groupedData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        let label: string;
        if (useMonthly) {
          const [year, month] = key.split("-");
          const monthNames = [
            "Jan",
            "Fév",
            "Mar",
            "Avr",
            "Mai",
            "Juin",
            "Juil",
            "Août",
            "Sep",
            "Oct",
            "Nov",
            "Déc",
          ];
          label = `${monthNames[parseInt(month) - 1]} ${year}`;
        } else {
          const [, month, day] = key.split("-");
          label = `${day}/${month}`;
        }

        // Convert all values from cents to euros
        const result: any = {
          date: key,
          label,
          total: data.total / 100,
        };

        // Add each type's revenue (all types will have a value, even if 0)
        allTypes.forEach((type) => {
          result[type] = (data.byType[type] || 0) / 100;
        });

        return result;
      });

    return sortedData;
  }, [orders, selectedPeriod, allTypes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  // Calculate total revenue for selected period
  const totalRevenue = chartData.reduce((sum, item) => sum + item.total, 0);
  const averageRevenue =
    chartData.length > 0 ? totalRevenue / chartData.length : 0;

  // Convert Set to Array for rendering and sort consistently
  const availableTypes = Array.from(allTypes).sort();

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    // Separate total from other types
    const totalItem = payload.find((p: any) => p.dataKey === "total");
    const typeItems = payload
      .filter((p: any) => p.dataKey !== "total")
      .sort((a: any, b: any) => a.dataKey.localeCompare(b.dataKey));

    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          padding: "12px",
        }}>
        <p style={{ marginBottom: "8px", fontWeight: "600", color: "#111827" }}>
          {label}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {typeItems.map((item: any, index: number) => {
            // Use our defined colors instead of Recharts automatic colors
            const itemColor = scopeColors[item.dataKey] || "#94a3b8";
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: itemColor,
                    borderRadius: "2px",
                  }}></div>
                <span style={{ color: "#6b7280" }}>{item.dataKey}:</span>
                <span
                  style={{
                    fontWeight: "500",
                    color: "#111827",
                    marginLeft: "auto",
                  }}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            );
          })}
          {totalItem && (
            <>
              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  margin: "4px 0",
                }}></div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#6366f1",
                    borderRadius: "2px",
                  }}></div>
                <span style={{ color: "#111827" }}>Total:</span>
                <span style={{ color: "#111827", marginLeft: "auto" }}>
                  {formatCurrency(totalItem.value)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="h-[130px] px-6 py-4 border-b border-gray-200 dark:border-[#4d252f]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <MdShowChart className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Évolution du chiffre d'affaires
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Total: {formatCurrency(totalRevenue)} | Moyenne:{" "}
                {formatCurrency(averageRevenue)}
              </p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            {(Object.keys(periodLabels) as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedPeriod === period
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-full p-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-gray-500">
            <div className="text-center">
              <MdShowChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucune donnée disponible</p>
              <p className="text-sm mt-2">
                Il n'y a pas de commandes pour cette période
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="80%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {/* Gradient for total */}
                <linearGradient
                  id="colorTotal"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1">
                  <stop
                    offset="5%"
                    stopColor="#f16363"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="#f16363"
                    stopOpacity={0}
                  />
                </linearGradient>
                {/* Gradients for each type */}
                {availableTypes.map((type) => (
                  <linearGradient
                    key={`gradient-${type}`}
                    id={`color-${type.replace(/\s+/g, "-")}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <stop
                      offset="5%"
                      stopColor={scopeColors[type] || "#94a3b8"}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={scopeColors[type] || "#94a3b8"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
              />
              {/* Individual type curves (thinner, semi-transparent) */}
              {availableTypes.map((type, index) => {
                const typeColor = scopeColors[type] || "#94a3b8";
                return (
                  <Area
                    key={type}
                    type="monotone"
                    dataKey={type}
                    stroke={typeColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#color-${type.replace(/\s+/g, "-")})`}
                    name={type}
                    stackId={index + 1}
                    color={typeColor}
                  />
                );
              })}
              {/* Total curve (thicker, prominent) */}
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={4}
                fillOpacity={0.1}
                //     fill={`url(#color-${type.replace(/\s+/g, "-")})`}
                fill={"#6366f1"}
                name="Total"
                strokeDasharray="5 5"
                color="#3206366f1755"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
