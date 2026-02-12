import { useState, useMemo } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
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
    const dataByMonth: Array<{
      month: string;
      Chapitres: number;
      Perspectives: number;
      Coloriage: number;
      Bundles: number;
      Précommandes: number;
    }> = [];

    for (let i = 0; i < 12; i++) {
      dataByMonth.push({
        month: monthNames[i],
        Chapitres: 0,
        Perspectives: 0,
        Coloriage: 0,
        Bundles: 0,
        Précommandes: 0,
      });
    }

    // Filter orders for selected year and aggregate by month/type
    const yearOrders = orders.filter((order) => {
      const orderYear = new Date(order.createdAt).getFullYear();
      return orderYear === selectedYear && order.status === "PAID";
    });

    yearOrders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      const amount = order.amountTotal / 100;

      switch (order.type) {
        case "CHAPTER":
          dataByMonth[month].Chapitres += amount;
          break;
        case "VERSION_PACK":
          dataByMonth[month].Perspectives += amount;
          break;
        case "COLORING":
          dataByMonth[month].Coloriage += amount;
          break;
        case "BUNDLE":
          dataByMonth[month].Bundles += amount;
          break;
        case "PREORDER":
          dataByMonth[month].Précommandes += amount;
          break;
      }
    });

    // Round to 2 decimals
    return dataByMonth.map((month) => ({
      month: month.month,
      Chapitres: parseFloat(month.Chapitres.toFixed(2)),
      Perspectives: parseFloat(month.Perspectives.toFixed(2)),
      Coloriage: parseFloat(month.Coloriage.toFixed(2)),
      Bundles: parseFloat(month.Bundles.toFixed(2)),
      Précommandes: parseFloat(month.Précommandes.toFixed(2)),
    }));
  }, [orders, selectedYear]);

  // Calculate total for the year
  const yearTotal = useMemo(() => {
    return chartData.reduce(
      (sum, month) =>
        sum +
        month.Chapitres +
        month.Perspectives +
        month.Coloriage +
        month.Bundles +
        month.Précommandes,
      0
    );
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
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              className="text-xs font-medium"
              tick={{ fill: "#6b7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs font-medium"
              tick={{ fill: "#6b7280" }}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              labelStyle={{
                fontWeight: "700",
                fontSize: "15px",
                marginBottom: "8px",
                padding: "6px 8px",
                backgroundColor: "#e5e7eb",
                borderRadius: "4px",
                display: "block"
              }}
              formatter={(value: number, name: string) => [
                <span key={name}>
                  <strong>{name} :</strong> {value.toFixed(2)}€
                </span>,
                ""
              ]}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
              }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="Chapitres"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Perspectives"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Coloriage"
              stroke="#ec4899"
              strokeWidth={2}
              dot={{ fill: "#ec4899", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Bundles"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Précommandes"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: "#f97316", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
