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
} from "react-icons/md";
import { ImAddressBook } from "react-icons/im";
import PurchaseTimelineChart from "../components/PurchaseTimelineChart";
import PurchaseDistributionChart from "../components/PurchaseDistributionChart";

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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    loadStats();
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

  const loadOrders = async () => {
    try {
      const response = await api.get("/admin/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <a
              href="/users"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.view_all_users")} →
            </a>
          </div>
        </div>

        {/* Chapitres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <a
              href="/chapters"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.manage_chapters")} →
            </a>
          </div>
        </div>

        {/* Commandes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <a
              href="/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.view_orders")} →
            </a>
          </div>
        </div>

        {/* Revenus */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <a
              href="/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.view_details")} →
            </a>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temporal Chart */}
        <PurchaseTimelineChart orders={orders} locale="fr" />

        {/* Distribution Chart */}
        <PurchaseDistributionChart orders={orders} locale="fr" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("dashboard.recent_activities")}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
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
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
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
          <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
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
                    }
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
