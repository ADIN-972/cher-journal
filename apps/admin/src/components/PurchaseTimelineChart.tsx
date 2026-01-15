import { useState, useMemo } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
}

interface PurchaseTimelineChartProps {
  orders: Order[];
  locale?: string;
}

export default function PurchaseTimelineChart({
  orders,
  locale = "fr",
}: PurchaseTimelineChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Get available years from orders
  const availableYears = useMemo(() => {
    const years = new Set(
      orders.map((o) => new Date(o.createdAt).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  // Format data by month for the selected year
  const chartData = useMemo(() => {
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

    // Initialize data structure
    const dataByMonth: Record<
      number,
      {
        month: string;
        CHAPTER: number;
        VERSION_PACK: number;
        COLORING: number;
        BUNDLE: number;
        PREORDER: number;
        total: number;
      }
    > = {};

    for (let i = 0; i < 12; i++) {
      dataByMonth[i] = {
        month: monthNames[i],
        CHAPTER: 0,
        VERSION_PACK: 0,
        COLORING: 0,
        BUNDLE: 0,
        PREORDER: 0,
        total: 0,
      };
    }

    // Filter orders for selected year and aggregate by month/type
    const yearOrders = orders.filter((order) => {
      const orderYear = new Date(order.createdAt).getFullYear();
      return orderYear === selectedYear && order.status === "PAID";
    });

    console.log(`[PurchaseTimelineChart] Year ${selectedYear}: ${yearOrders.length} paid orders`);

    yearOrders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      const type = order.type as keyof typeof dataByMonth[0];

      // Log each order to debug
      console.log(`[PurchaseTimelineChart] Order: month=${month}, type=${type}, amount=${order.amountTotal}`);

      if (dataByMonth[month] && type in dataByMonth[month]) {
        dataByMonth[month][type] += order.amountTotal / 100; // Convert cents to euros
        dataByMonth[month].total += order.amountTotal / 100;
      } else {
        console.warn(`[PurchaseTimelineChart] Unknown type: ${type} for month ${month}`);
      }
    });

    const result = Object.values(dataByMonth);
    console.log(`[PurchaseTimelineChart] Chart data:`, result);
    return result;
  }, [orders, selectedYear]);

  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.total), 1);
    console.log(`[PurchaseTimelineChart] Max value: ${max}`);
    return max;
  }, [chartData]);

  // Type colors
  const typeColors: Record<string, string> = {
    CHAPTER: "#3b82f6", // blue
    VERSION_PACK: "#8b5cf6", // purple
    COLORING: "#ec4899", // pink
    BUNDLE: "#10b981", // green
    PREORDER: "#f97316", // orange
  };

  const typeLabels: Record<string, string> = {
    CHAPTER: "Chapitres",
    VERSION_PACK: "Perspectives",
    COLORING: "Coloriage",
    BUNDLE: "Bundles",
    PREORDER: "Précommandes",
  };

  // Calculate total for the year
  const yearTotal = useMemo(() => {
    return chartData.reduce((sum, month) => sum + month.total, 0);
  }, [chartData]);

  if (availableYears.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-center text-gray-500">
        Aucune donnée d'achat disponible
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Évolution des Achats
          </h3>
          <p className="text-sm text-gray-500">
            Total {selectedYear}: {yearTotal.toFixed(2)}€
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const currentIndex = availableYears.indexOf(selectedYear);
              if (currentIndex < availableYears.length - 1) {
                setSelectedYear(availableYears[currentIndex + 1]);
              }
            }}
            disabled={
              availableYears.indexOf(selectedYear) ===
              availableYears.length - 1
            }
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronLeft size={20} />
          </button>

          <span className="font-semibold text-gray-900 min-w-[60px] text-center">
            {selectedYear}
          </span>

          <button
            onClick={() => {
              const currentIndex = availableYears.indexOf(selectedYear);
              if (currentIndex > 0) {
                setSelectedYear(availableYears[currentIndex - 1]);
              }
            }}
            disabled={availableYears.indexOf(selectedYear) === 0}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500 text-right pr-2">
          <span>{maxValue.toFixed(0)}€</span>
          <span>{(maxValue * 0.75).toFixed(0)}€</span>
          <span>{(maxValue * 0.5).toFixed(0)}€</span>
          <span>{(maxValue * 0.25).toFixed(0)}€</span>
          <span>0€</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-12 right-0 top-0 bottom-8">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-100" />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {chartData.map((month, index) => {
              const barHeight = (month.total / maxValue) * 100;
              console.log(`[PurchaseTimelineChart] ${month.month}: total=${month.total}, maxValue=${maxValue}, barHeight=${barHeight}%`);

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col justify-end group relative"
                >
                  {/* Stacked bar */}
                  <div
                    className="w-full rounded-t-md overflow-hidden transition-all hover:opacity-90 cursor-pointer"
                    style={{ height: `${barHeight}%` }}
                  >
                    {(["CHAPTER", "VERSION_PACK", "COLORING", "BUNDLE", "PREORDER"] as const).map(
                      (type) => {
                        const typeValue = month[type];
                        const typeHeight = month.total > 0 ? (typeValue / month.total) * 100 : 0;

                        if (typeValue === 0) return null;

                        return (
                          <div
                            key={type}
                            style={{
                              height: `${typeHeight}%`,
                              backgroundColor: typeColors[type],
                            }}
                            title={`${typeLabels[type]}: ${typeValue.toFixed(2)}€`}
                          />
                        );
                      }
                    )}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="font-semibold mb-1">{month.month}</div>
                      <div className="space-y-1">
                        {(["CHAPTER", "VERSION_PACK", "COLORING", "BUNDLE", "PREORDER"] as const).map(
                          (type) => {
                            if (month[type] === 0) return null;
                            return (
                              <div key={type} className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: typeColors[type] }}
                                />
                                <span>
                                  {typeLabels[type]}: {month[type].toFixed(2)}€
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                      <div className="border-t border-gray-700 mt-1 pt-1 font-semibold">
                        Total: {month.total.toFixed(2)}€
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-12 right-0 bottom-0 h-8 flex items-center justify-between text-xs text-gray-500">
          {chartData.map((month, index) => (
            <span key={index} className="flex-1 text-center">
              {month.month}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
        {(Object.keys(typeLabels) as Array<keyof typeof typeLabels>).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: typeColors[type] }}
            />
            <span className="text-sm text-gray-600">{typeLabels[type]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
