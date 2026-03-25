import { useState } from "react";
import DashboardAnalytics from "../components/DashboardAnalytics";
import DashboardInsights from "../components/DashboardInsights";

type Tab = "analytics" | "insights" | "reports";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "analytics", label: "Analytics", icon: "bar_chart" },
  { id: "insights", label: "Insights", icon: "lightbulb" },
  { id: "reports", label: "Reports", icon: "description" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("analytics");

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "analytics" && <DashboardAnalytics />}
      {activeTab === "insights" && <DashboardInsights />}
      {activeTab === "reports" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">description</span>
          <h2 className="text-2xl italic text-gray-400 mb-2">Reports</h2>
          <p className="text-sm text-gray-400">Coming soon — exportable reports and scheduled analytics.</p>
        </div>
      )}
    </div>
  );
}
