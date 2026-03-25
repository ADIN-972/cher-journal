import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { storage, STORAGE_KEYS } from "../lib/storage";
import { api } from "../lib/api";
import {
  MdPeople,
  MdBook,
  MdAttachMoney,
  MdShowChart,
  MdBarChart,
  MdPersonAdd,
  MdCheckCircle,
  MdMenuBook,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";
import SalesDistributionChart from "./SalesDistributionChart";
import RevenueEvolutionChart, { Period } from "./RevenueEvolutionChart";

interface Stats {
  totalUsers: number;
  totalChapters: number;
  totalOrders: number;
  totalRevenue: number;
  subscriptions?: {
    active: number;
    newThisMonth: number;
    change: number;
  };
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

export default function DashboardAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useI18n();
  const locale = language === "en" ? "en-US" : "fr-FR";

  const [selectedPeriod, setSelectedPeriod] = useState<Period>(() => {
    return storage.getString(STORAGE_KEYS.REVENUE_PERIOD, "30days") as Period;
  });

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
    storage.set(STORAGE_KEYS.REVENUE_PERIOD, period);
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
    <div className="space-y-6">
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
          <div className="bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] px-6 py-3 border-t border-gray-200">
            <a href="/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
                <MdBook className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+5.3%</span>
              <span className="text-gray-500 ml-2">
                {t("dashboard.last_month")}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] px-6 py-3 border-t border-gray-200">
            <a href="/chapters" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.manage_chapters")} →
            </a>
          </div>
        </div>

        {/* Souscriptions */}
        <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("dashboard.stats_subscriptions")}
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.subscriptions?.newThisMonth || 0}
                </h3>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-purple-600">card_membership</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {(stats?.subscriptions?.change ?? 0) >= 0 ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <MdTrendingUp className="w-4 h-4" />+{stats?.subscriptions?.change || 0}%
                </span>
              ) : (
                <span className="text-red-500 font-medium flex items-center gap-1">
                  <MdTrendingDown className="w-4 h-4" />{stats?.subscriptions?.change}%
                </span>
              )}
              <span className="text-gray-500 ml-2">{t("dashboard.last_month")}</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] px-6 py-3 border-t border-gray-200">
            <a href="/users" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Voir les membres →
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
              <span className="text-gray-500 ml-2">{t("dashboard.last_month")}</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-black/30 dark:border-[#4d252f] px-6 py-3 border-t border-gray-200">
            <a href="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.view_details")} →
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <MdShowChart className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Revenus en temps reel</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { key: "today" as const, label: "Aujourd'hui", from: "blue" },
              { key: "week" as const, label: "Cette semaine", from: "purple" },
              { key: "month" as const, label: "Ce mois", from: "green" },
              { key: "year" as const, label: "Cette annee", from: "amber" },
            ]).map(({ key, label, from }) => (
              <div key={key} className={`bg-gradient-to-br from-${from}-50 to-${from}-100 rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium text-${from}-900`}>{label}</span>
                  {kpis.revenue[key].change !== 0 && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      kpis.revenue[key].change > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {kpis.revenue[key].change > 0 ? <MdTrendingUp className="w-3 h-3" /> : <MdTrendingDown className="w-3 h-3" />}
                      {Math.abs(kpis.revenue[key].change).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className={`text-2xl font-bold text-${from}-900 mb-1`}>{formatPrice(kpis.revenue[key].amount)}</div>
                <div className={`text-xs text-${from}-700`}>{kpis.revenue[key].count} commande(s)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Content */}
      {kpis && (kpis.topChapters.length > 0 || kpis.topVolumes.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {kpis.topChapters.length > 0 && (
            <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdBarChart className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Top 5 Chapitres</h3>
              </div>
              <div className="space-y-3">
                {kpis.topChapters.map((item, index) => (
                  <div key={item.refId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/30 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">{index + 1}</div>
                      <div>
                        <p className="font-medium text-gray-900">{item.chapter?.title || "Chapitre inconnu"}</p>
                        <p className="text-xs text-gray-500">{item.count} achat(s)</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">{formatPrice(item.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {kpis.topVolumes.length > 0 && (
            <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdBarChart className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Top 5 Volumes</h3>
              </div>
              <div className="space-y-3">
                {kpis.topVolumes.map((item, index) => (
                  <div key={item.refId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/30 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">{index + 1}</div>
                      <div>
                        <p className="font-medium text-gray-900">{item.chapter?.title || "Volume inconnu"}</p>
                        <p className="text-xs text-gray-500">{item.count} achat(s)</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">{formatPrice(item.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="lg:col-span-2 border-r border-gray-200 dark:border-[#4d252f]">
            <RevenueEvolutionChart orders={orders} locale={locale} selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />
          </div>
          <div className="lg:col-span-1">
            <SalesDistributionChart orders={orders} locale={locale} selectedPeriod={selectedPeriod} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-card-dark dark:border-[#4d252f] rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#4d252f]">
          <h3 className="text-lg font-semibold text-gray-900">{t("dashboard.recent_activities")}</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-[#4d252f]">
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MdPersonAdd className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t("dashboard.activity.user_registered.title")}</p>
                <p className="text-sm text-gray-500">{t("dashboard.activity.user_registered.subtitle", undefined, { email: "user@example.com" })}</p>
              </div>
              <span className="text-sm text-gray-400">{t("dashboard.activity.user_registered.time")}</span>
            </div>
          </div>
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MdCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t("dashboard.activity.order_completed.title")}</p>
                <p className="text-sm text-gray-500">{t("dashboard.activity.order_completed.subtitle", undefined, { id: "1234", amount: "19.99€" })}</p>
              </div>
              <span className="text-sm text-gray-400">{t("dashboard.activity.order_completed.time")}</span>
            </div>
          </div>
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MdMenuBook className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t("dashboard.activity.chapter_published.title")}</p>
                <p className="text-sm text-gray-500">{t("dashboard.activity.chapter_published.subtitle", undefined, { title: "Le Mystere" })}</p>
              </div>
              <span className="text-sm text-gray-400">{t("dashboard.activity.chapter_published.time")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
