import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import {
  MdPeople,
  MdBook,
  MdShoppingCart,
  MdAttachMoney,
  MdBarChart,
  MdShowChart,
  MdPersonAdd,
  MdCheckCircle,
  MdMenuBook,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";
import { ImAddressBook } from "react-icons/im";
import PurchaseTimelineChart from "../components/PurchaseTimelineChart";
import SalesDistributionChart from "../components/SalesDistributionChart";
import RevenueEvolutionChart, { Period } from "../components/RevenueEvolutionChart";

interface Stats {
  totalUsers: number;
  totalChapters: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
}

interface KPIRevenuePeriod {
  amount: number;
  count: number;
  change: number;
}

interface KPIData {
  revenue: {
    today: KPIRevenuePeriod;
    week: KPIRevenuePeriod;
    month: KPIRevenuePeriod;
    year: KPIRevenuePeriod;
  };
  topChapters: Array<{
    refId: string;
    count: number;
    revenue: number;
    chapter?: { id: string; title: string; protagonistName: string };
  }>;
  topVolumes: Array<{
    refId: string;
    count: number;
    revenue: number;
    chapter?: { id: string; title: string; protagonistName: string };
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useI18n();
  const locale = language === "en" ? "en-US" : "fr-FR";

  // Shared period state for revenue evolution and sales distribution
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(() => {
    const saved = localStorage.getItem("revenueEvolutionPeriod");
    return (saved as Period) || "30days";
  });

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
    localStorage.setItem("revenueEvolutionPeriod", period);
  };

  useEffect(() => {
    loadStats();
    loadKPIs();
    loadOrders();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast.error(t("messages.error.load_stats"));
    } finally {
      setLoading(false);
    }
  };

  const loadKPIs = async () => {
    try {
      const response = await api.get("/admin/dashboard/kpis");
      setKpis(response.data);
    } catch (error) {
      console.error("Failed to load KPIs:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await api.get("/admin/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Utilisateurs */}
        <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("dashboard.stats_users")}
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </h3>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdPeople className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-2">
                {t("dashboard.last_month")}
              </span>
            </div>
          </div>
          <div className="bg-gray-50  dark:bg-black/30 dark:border-[#4d252f] px-6 py-3 border-t border-gray-200">
            <a
              href="/users"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.view_all_users")} →
            </a>
          </div>
        </div>

        {/* Chapitres */}
        <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("dashboard.stats_chapters")}
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.totalChapters || 0}
                </h3>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                <ImAddressBook className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">
                {t("dashboard.chapters_new", undefined, { count: 3 })}
              </span>
              <span className="text-gray-500 ml-2">
                {t("dashboard.this_month")}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] px-6 py-3 border-t border-gray-200">
            <a
              href="/chapters"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.manage_chapters")} →
            </a>
          </div>
        </div>

        {/* Commandes */}
        <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("dashboard.stats_orders")}
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.totalOrders || 0}
                </h3>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                <MdShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+18.2%</span>
              <span className="text-gray-500 ml-2">
                {t("dashboard.last_month")}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] px-6 py-3 border-t border-gray-200">
            <a
              href="/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.view_orders")} →
            </a>
          </div>
        </div>

        {/* Revenus */}
        <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("dashboard.stats_revenue")}
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {((stats?.totalRevenue || 0) / 100).toFixed(2)}€
                </h3>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MdAttachMoney className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+33.1%</span>
              <span className="text-gray-500 ml-2">
                {t("dashboard.last_month")}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] px-6 py-3 border-t border-gray-200">
            <a
              href="/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.view_details")} →
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards - Real-time Revenue */}
      {kpis && (
        <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <MdShowChart className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Revenus en temps réel
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Aujourd'hui
                </span>
                {kpis.revenue.today.change !== 0 && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      kpis.revenue.today.change > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {kpis.revenue.today.change > 0 ? (
                      <MdTrendingUp className="w-3 h-3" />
                    ) : (
                      <MdTrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(kpis.revenue.today.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {formatPrice(kpis.revenue.today.amount)}
              </div>
              <div className="text-xs text-blue-700">
                {kpis.revenue.today.count} commande(s)
              </div>
            </div>

            {/* Week */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">
                  Cette semaine
                </span>
                {kpis.revenue.week.change !== 0 && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      kpis.revenue.week.change > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {kpis.revenue.week.change > 0 ? (
                      <MdTrendingUp className="w-3 h-3" />
                    ) : (
                      <MdTrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(kpis.revenue.week.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-purple-900 mb-1">
                {formatPrice(kpis.revenue.week.amount)}
              </div>
              <div className="text-xs text-purple-700">
                {kpis.revenue.week.count} commande(s)
              </div>
            </div>

            {/* Month */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">
                  Ce mois
                </span>
                {kpis.revenue.month.change !== 0 && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      kpis.revenue.month.change > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {kpis.revenue.month.change > 0 ? (
                      <MdTrendingUp className="w-3 h-3" />
                    ) : (
                      <MdTrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(kpis.revenue.month.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-green-900 mb-1">
                {formatPrice(kpis.revenue.month.amount)}
              </div>
              <div className="text-xs text-green-700">
                {kpis.revenue.month.count} commande(s)
              </div>
            </div>

            {/* Year */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-900">
                  Cette année
                </span>
                {kpis.revenue.year.change !== 0 && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      kpis.revenue.year.change > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    {kpis.revenue.year.change > 0 ? (
                      <MdTrendingUp className="w-3 h-3" />
                    ) : (
                      <MdTrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(kpis.revenue.year.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-orange-900 mb-1">
                {formatPrice(kpis.revenue.year.amount)}
              </div>
              <div className="text-xs text-orange-700">
                {kpis.revenue.year.count} commande(s)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Content */}
      {kpis && (kpis.topChapters.length > 0 || kpis.topVolumes.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Chapters */}
          {kpis.topChapters.length > 0 && (
            <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdBarChart className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Top 5 Chapitres
                </h3>
              </div>
              <div className="space-y-3">
                {kpis.topChapters.map((item, index) => (
                  <div
                    key={item.refId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.chapter?.title || "Chapitre inconnu"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.count} achat(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Volumes */}
          {kpis.topVolumes.length > 0 && (
            <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdBarChart className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Top 5 Volumes
                </h3>
              </div>
              <div className="space-y-3">
                {kpis.topVolumes.map((item, index) => (
                  <div
                    key={item.refId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.chapter?.title || "Volume inconnu"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.count} achat(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Combined Revenue Evolution & Sales Distribution Chart */}
      <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Revenue Evolution Chart - Left side (2/3 width) */}
          <div className="lg:col-span-2 border-r border-gray-200  dark:border-[#4d252f]">
            <RevenueEvolutionChart
              orders={orders}
              locale={locale}
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />
          </div>

          {/* Sales Distribution Chart - Right side (1/3 width) */}
          <div className="lg:col-span-1">
            <SalesDistributionChart
              orders={orders}
              locale={locale}
              selectedPeriod={selectedPeriod}
            />
          </div>
        </div>
      </div>

      {/* Temporal Chart - Full Width */}
      {/* <PurchaseTimelineChart orders={orders} locale="fr" /> */}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#4d252f]">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("dashboard.recent_activities")}
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-[#4d252f]">
          <div className="px-6 py-4 hover:bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MdPersonAdd className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {t("dashboard.activity.user_registered.title")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("dashboard.activity.user_registered.subtitle", undefined, {
                    email: "user@example.com",
                  })}
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {t("dashboard.activity.user_registered.time")}
              </span>
            </div>
          </div>
          <div className="px-6 py-4 hover:bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MdCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {t("dashboard.activity.order_completed.title")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("dashboard.activity.order_completed.subtitle", undefined, {
                    id: "1234",
                    amount: "19.99€",
                  })}
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {t("dashboard.activity.order_completed.time")}
              </span>
            </div>
          </div>
          <div className="px-6 py-4 hover:bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MdMenuBook className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {t("dashboard.activity.chapter_published.title")}
                </p>
                <p className="text-sm text-gray-500">
                  {t(
                    "dashboard.activity.chapter_published.subtitle",
                    undefined,
                    {
                      title: "Le Mystère",
                    },
                  )}
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {t("dashboard.activity.chapter_published.time")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
