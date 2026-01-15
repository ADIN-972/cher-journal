import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import FloatingActionButton from "../components/FloatingActionButton";
import SmartTableGrid, { SmartTableColumn } from "../components/SmartTableGrid";
import {
  MdFilterList,
  MdCheckCircle,
  MdAccessTime,
  MdFileDownload,
} from "react-icons/md";

interface Order {
  id: string;
  userId: string;
  chapterId: string;
  amount: number;
  volumeFrom: number;
  volumeTo: number;
  accessType: string;
  status: string;
  stripeSessionId: string | null;
  createdAt: string;
  user?: {
    email: string;
  };
  chapter?: {
    title: string;
  };
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "COMPLETED" | "PENDING"
  >("ALL");
  const { t } = useI18n();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get("/admin/orders");
      setOrders(response.data);
    } catch (error) {
      toast.error(t("messages.error.load_orders"));
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "ALL") return true;
    return order.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      COMPLETED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      FAILED: "bg-red-100 text-red-800",
    };
    const labels = {
      COMPLETED: t("orders.completed"),
      PENDING: t("orders.pending"),
      FAILED: t("orders.failed"),
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded ${colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getAccessTypeBadge = (type: string) => {
    return type === "ALL" ? (
      <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
        {t("orders.all_perspectives")}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
        {t("orders.narrator_only")}
      </span>
    );
  };

  const columns: SmartTableColumn<Order>[] = useMemo(
    () => [
      {
        id: "user",
        header: t("orders.column_user"),
        render: (order) => order.user?.email || "N/A",
        defaultVisible: true,
      },
      {
        id: "chapter",
        header: t("orders.column_chapter"),
        render: (order) => order.chapter?.title || "N/A",
        defaultVisible: true,
      },
      {
        id: "volumes",
        header: t("orders.column_volumes"),
        render: (order) =>
          order.volumeFrom === order.volumeTo
            ? `Vol. ${order.volumeFrom}`
            : `Vol. ${order.volumeFrom}-${order.volumeTo}`,
        defaultVisible: true,
      },
      {
        id: "access",
        header: t("orders.column_access"),
        render: (order) => getAccessTypeBadge(order.accessType),
        align: "center",
        defaultVisible: true,
      },
      {
        id: "amount",
        header: t("orders.column_amount"),
        render: (order) => (
          <span className="font-medium">
            {(order.amount / 100).toFixed(2)} €
          </span>
        ),
        align: "right",
        defaultVisible: true,
      },
      {
        id: "status",
        header: t("orders.column_status"),
        render: (order) => getStatusBadge(order.status),
        align: "center",
        defaultVisible: true,
      },
      {
        id: "date",
        header: t("orders.column_date"),
        render: (order) =>
          new Date(order.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        defaultVisible: true,
      },
    ],
    [t]
  );

  const calculateTotal = () => {
    return filteredOrders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, order) => sum + order.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("messages.loading")}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("navigation.orders")}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">
            {t("orders.total_orders")}
          </div>
          <div className="text-2xl font-bold">{orders.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">
            {t("orders.completed_orders")}
          </div>
          <div className="text-2xl font-bold text-green-600">
            {orders.filter((o) => o.status === "COMPLETED").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">
            {t("orders.total_revenue")}
          </div>
          <div className="text-2xl font-bold">
            {(calculateTotal() / 100).toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <SmartTableGrid
        listName="orders"
        data={filteredOrders}
        columns={columns}
        getItemId={(order) => order.id}
        loading={loading}
        emptyMessage={t("orders.no_orders_found")}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        sections={[
          {
            title: t("orders.fab.filter_title"),
            actions: [
              {
                label: t("orders.fab.all_orders"),
                icon: <MdFilterList />,
                onClick: () => setStatusFilter("ALL"),
                variant: statusFilter === "ALL" ? "primary" : "secondary",
                badge: orders.length,
              },
              {
                label: t("orders.fab.completed_orders"),
                icon: <MdCheckCircle />,
                onClick: () => setStatusFilter("COMPLETED"),
                variant: statusFilter === "COMPLETED" ? "primary" : "secondary",
                badge: orders.filter((o) => o.status === "COMPLETED").length,
              },
              {
                label: t("orders.fab.pending_orders"),
                icon: <MdAccessTime />,
                onClick: () => setStatusFilter("PENDING"),
                variant: statusFilter === "PENDING" ? "primary" : "secondary",
                badge: orders.filter((o) => o.status === "PENDING").length,
              },
            ],
          },
          {
            title: t("orders.fab.actions_title"),
            actions: [
              {
                label: t("orders.fab.export_csv"),
                icon: <MdFileDownload />,
                onClick: () => toast.info(t("orders.fab.coming_soon")),
                variant: "secondary",
              },
            ],
          },
        ]}
      />
    </div>
  );
}
