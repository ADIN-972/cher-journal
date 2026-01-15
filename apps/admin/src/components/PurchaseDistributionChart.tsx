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

  // Type colors (matching PurchaseTimelineChart)
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

  // Calculate distribution data for selected year
  const distributionData = useMemo(() => {
    const yearOrders = orders.filter((order) => {
      const orderYear = new Date(order.createdAt).getFullYear();
      return orderYear === selectedYear && order.status === "PAID";
    });

    console.log(`[PurchaseDistributionChart] Year ${selectedYear}: ${yearOrders.length} paid orders`);

    const dataByType: Record<
      string,
      { type: string; amount: number; count: number }
    > = {};

    yearOrders.forEach((order) => {
      const type = order.type;
      console.log(`[PurchaseDistributionChart] Order type: ${type}, amount: ${order.amountTotal}`);
      if (!dataByType[type]) {
        dataByType[type] = { type, amount: 0, count: 0 };
      }
      dataByType[type].amount += order.amountTotal / 100;
      dataByType[type].count += 1;
    });

    const total = Object.values(dataByType).reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const result = {
      items: Object.values(dataByType).map((item) => ({
        ...item,
        percentage: total > 0 ? (item.amount / total) * 100 : 0,
      })),
      total,
      totalCount: yearOrders.length,
    };

    console.log(`[PurchaseDistributionChart] Distribution data:`, result);
    return result;
  }, [orders, selectedYear]);

  // Calculate pie chart segments
  const pieSegments = useMemo(() => {
    let currentAngle = -90; // Start at top
    return distributionData.items.map((item) => {
      const sweepAngle = (item.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweepAngle;

      // Calculate SVG path for pie segment
      const radius = 80;
      const innerRadius = 50; // For donut chart
      const centerX = 100;
      const centerY = 100;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const ix1 = centerX + innerRadius * Math.cos(startRad);
      const iy1 = centerY + innerRadius * Math.sin(startRad);
      const ix2 = centerX + innerRadius * Math.cos(endRad);
      const iy2 = centerY + innerRadius * Math.sin(endRad);

      const largeArcFlag = sweepAngle > 180 ? 1 : 0;

      const path = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${ix2} ${iy2}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`,
        "Z",
      ].join(" ");

      // Calculate label position (middle of segment, outside ring)
      const midAngle = (startAngle + endAngle) / 2;
      const midRad = (midAngle * Math.PI) / 180;
      const labelRadius = 95;
      const labelX = centerX + labelRadius * Math.cos(midRad);
      const labelY = centerY + labelRadius * Math.sin(midRad);

      currentAngle = endAngle;

      return {
        ...item,
        path,
        labelX,
        labelY,
        color: typeColors[item.type] || "#94a3b8",
      };
    });
  }, [distributionData]);

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
            {distributionData.totalCount} achat
            {distributionData.totalCount > 1 ? "s" : ""} - Total:{" "}
            {distributionData.total.toFixed(2)}€
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

      {distributionData.items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun achat pour {selectedYear}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Donut Chart */}
          <div className="flex justify-center">
            <svg
              viewBox="0 0 200 200"
              className="w-full max-w-[300px] h-auto"
            >
              {/* Pie segments */}
              {pieSegments.map((segment, index) => (
                <g key={index} className="group">
                  <path
                    d={segment.path}
                    fill={segment.color}
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                  />
                  <title>
                    {typeLabels[segment.type]}: {segment.amount.toFixed(2)}€ (
                    {segment.percentage.toFixed(1)}%)
                  </title>
                </g>
              ))}

              {/* Center label */}
              <text
                x="100"
                y="95"
                textAnchor="middle"
                className="text-2xl font-bold fill-gray-900"
              >
                {distributionData.total.toFixed(0)}€
              </text>
              <text
                x="100"
                y="110"
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                Total {selectedYear}
              </text>
            </svg>
          </div>

          {/* Legend with details */}
          <div className="space-y-3">
            {pieSegments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {typeLabels[segment.type]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {segment.count} achat{segment.count > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {segment.amount.toFixed(2)}€
                  </div>
                  <div className="text-xs text-gray-500">
                    {segment.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
