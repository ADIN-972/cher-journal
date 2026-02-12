import { useMemo } from "react";
import { MdPieChart } from "react-icons/md";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { Period } from "./RevenueEvolutionChart";

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
}

interface SalesDistributionChartProps {
  orders: Order[];
  locale?: string;
  selectedPeriod?: Period;
}

export default function SalesDistributionChart({
  orders,
  locale = "fr",
  selectedPeriod,
}: SalesDistributionChartProps) {
  // Scope colors
  const scopeColors: Record<string, string> = {
    Volumes: "#3b82f6", // blue
    Chapitres: "#8b5cf6", // purple
    Épilogue: "#ec4899", // pink
    "Points de vue": "#f97316", // orange
    Coloriage: "#06b6d4", // cyan
    Bundles: "#10b981", // green
    Abonnement: "#eab308", // yellow
  };

  // Map order types to French labels
  const typeMapping: Record<string, string> = {
    VOLUME: "Volumes",
    CHAPTER: "Chapitres",
    POV: "Points de vue",
    EPILOGUE: "Épilogue",
    COLORING: "Coloriage",
    BUNDLE: "Bundles",
    SUBSCRIPTION: "Abonnement",
    PREORDER: "Volumes", // Preorders are volumes
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

  // Calculate distribution data
  const chartData = useMemo(() => {
    // Filter paid orders only
    let paidOrders = orders.filter((o) => o.status === "PAID");

    // Apply period filter if provided
    if (selectedPeriod) {
      const startDate = getDateRange(selectedPeriod);
      paidOrders = paidOrders.filter((o) => new Date(o.createdAt) >= startDate);
    }

    // Group by type
    const distribution = new Map<string, { count: number; revenue: number }>();

    paidOrders.forEach((order) => {
      const label = typeMapping[order.type] || "Autres";
      const current = distribution.get(label) || { count: 0, revenue: 0 };
      distribution.set(label, {
        count: current.count + 1,
        revenue: current.revenue + order.amountTotal,
      });
    });

    // Convert to array for chart
    return Array.from(distribution.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: data.revenue / 100, // Convert cents to euros
        percentage:
          paidOrders.length > 0
            ? ((data.count / paidOrders.length) * 100).toFixed(1)
            : "0",
      }))
      .sort((a, b) => b.revenue - a.revenue); // Sort by revenue
  }, [orders, selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="h-[130px] px-6 py-4 border-b border-gray-200 dark:border-[#4d252f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MdPieChart className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Répartition des ventes
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {totalOrders} commande(s) | {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Legend */}
      <div className="p-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-gray-500">
            <div className="text-center">
              <MdPieChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucune donnée disponible</p>
              <p className="text-sm mt-2">Il n'y a pas encore de commandes</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {/* Pie Chart */}
            <div>
              <ResponsiveContainer
                width="100%"
                height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="count">
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={scopeColors[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} commande(s) | ${formatCurrency(props.payload.revenue)}`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend with Details */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {chartData.map((item) => (
                <div
                  key={item.name}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: scopeColors[item.name] || "#94a3b8",
                      }}></div>
                    <p className="font-medium text-sm text-gray-900">
                      {item.name}
                    </p>
                  </div>
                  <div className="ml-5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>{item.count} commande(s)</span>
                      <span className="font-semibold">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span>{item.percentage}% des ventes</span>
                      <span>
                        {((item.revenue / totalRevenue) * 100).toFixed(1)}% du
                        CA
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
