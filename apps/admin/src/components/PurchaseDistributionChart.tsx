import { useState, useMemo } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
}

interface PurchaseDistributionChartProps {
  orders: Order[];
  locale?: string;
}

export default function PurchaseDistributionChart({
  orders,
  locale = "fr",
}: PurchaseDistributionChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Get available years from orders
  const availableYears = useMemo(() => {
    const years = new Set(
      orders.map((o) => new Date(o.createdAt).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  // Type colors
  const typeColors: Record<string, string> = {
    Chapitres: "#3b82f6", // blue
    Perspectives: "#8b5cf6", // purple
    Coloriage: "#ec4899", // pink
    Bundles: "#10b981", // green
    Précommandes: "#f97316", // orange
  };

  const typeMapping: Record<string, string> = {
    CHAPTER: "Chapitres",
    VERSION_PACK: "Perspectives",
    COLORING: "Coloriage",
    BUNDLE: "Bundles",
    PREORDER: "Précommandes",
  };

  // Calculate distribution data for selected year
  const chartData = useMemo(() => {
    const yearOrders = orders.filter((order) => {
      const orderYear = new Date(order.createdAt).getFullYear();
      return orderYear === selectedYear && order.status === "PAID";
    });

    const dataByType: Record<string, { name: string; value: number; count: number }> = {};

    yearOrders.forEach((order) => {
      const typeName = typeMapping[order.type] || order.type;
      if (!dataByType[typeName]) {
        dataByType[typeName] = { name: typeName, value: 0, count: 0 };
      }
      dataByType[typeName].value += order.amountTotal / 100;
      dataByType[typeName].count += 1;
    });

    return Object.values(dataByType).map((item) => ({
      name: item.name,
      value: parseFloat(item.value.toFixed(2)),
      count: item.count,
    }));
  }, [orders, selectedYear]);

  // Calculate total
  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const totalCount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.count, 0);
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
            Répartition des Achats
          </h3>
          <p className="text-sm text-gray-500">
            {totalCount} achat{totalCount > 1 ? "s" : ""} - Total:{" "}
            {totalAmount.toFixed(2)}€
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

      {chartData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun achat pour {selectedYear}
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={typeColors[entry.name] || "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(2)}€ (${props.payload.count} achat${
                    props.payload.count > 1 ? "s" : ""
                  })`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "20px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
