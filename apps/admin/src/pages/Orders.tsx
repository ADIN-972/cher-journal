import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import FloatingActionButton from "../components/FloatingActionButton";
import ContextMenu, { ContextMenuSection } from "../components/ContextMenu";
import {
  MdFilterList,
  MdCheckCircle,
  MdPerson,
  MdExpandMore,
  MdExpandLess,
  MdShoppingCart,
  MdAttachMoney,
  MdFilterAlt,
  MdSelectAll,
  MdVisibility,
  MdFileDownload,
} from "react-icons/md";

interface Order {
  id: string;
  userId: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
  provider?: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface CustomerGroup {
  user: User;
  orders: Order[];
  totalSpent: number;
  orderCount: number;
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">(
    "ALL"
  );
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(
    new Set()
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    userId?: string;
  } | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        api.get("/admin/orders"),
        api.get("/admin/users"),
      ]);
      setOrders(ordersResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      toast.error(t("messages.error.load_orders"));
    } finally {
      setLoading(false);
    }
  };

  // Group orders by customer
  const customerGroups: CustomerGroup[] = useMemo(() => {
    const userMap = new Map(users.map((u) => [u.id, u]));
    const groupMap = new Map<string, CustomerGroup>();

    orders.forEach((order) => {
      const user = userMap.get(order.userId);
      if (!user) return;

      if (!groupMap.has(order.userId)) {
        groupMap.set(order.userId, {
          user,
          orders: [],
          totalSpent: 0,
          orderCount: 0,
        });
      }

      const group = groupMap.get(order.userId)!;
      group.orders.push(order);
      if (order.status === "PAID") {
        group.totalSpent += order.amountTotal;
      }
      group.orderCount++;
    });

    // Convert to array and sort by total spent (descending)
    return Array.from(groupMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );
  }, [orders, users]);

  // Filter groups based on status filter
  const filteredGroups = useMemo(() => {
    if (statusFilter === "ALL") return customerGroups;

    return customerGroups
      .map((group) => ({
        ...group,
        orders: group.orders.filter((o) => o.status === statusFilter),
      }))
      .filter((group) => group.orders.length > 0);
  }, [customerGroups, statusFilter]);

  const toggleCustomer = (userId: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedCustomers(newExpanded);
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    userId?: string
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      userId,
    });
  };

  const getContextMenuSections = (): ContextMenuSection[] => {
    const sections: ContextMenuSection[] = [
      {
        title: "Filtrer par statut",
        items: [
          {
            label: "Toutes les commandes",
            icon: <MdSelectAll />,
            onClick: () => setStatusFilter("ALL"),
            selected: statusFilter === "ALL",
          },
          {
            label: "Commandes payées",
            icon: <MdCheckCircle />,
            onClick: () => setStatusFilter("PAID"),
            selected: statusFilter === "PAID",
          },
          {
            label: "En attente",
            icon: <MdFilterList />,
            onClick: () => setStatusFilter("PENDING"),
            selected: statusFilter === "PENDING",
          },
        ],
      },
    ];

    // If context menu was opened on a specific customer
    if (contextMenu?.userId) {
      sections.push({
        title: "Actions client",
        items: [
          {
            label: "Voir le profil",
            icon: <MdVisibility />,
            onClick: () => navigate(`/users/${contextMenu.userId}`),
          },
          {
            label: contextMenu.userId && expandedCustomers.has(contextMenu.userId)
              ? "Replier les commandes"
              : "Déplier les commandes",
            icon: contextMenu.userId && expandedCustomers.has(contextMenu.userId)
              ? <MdExpandLess />
              : <MdExpandMore />,
            onClick: () => {
              if (contextMenu.userId) {
                toggleCustomer(contextMenu.userId);
              }
            },
          },
        ],
      });
    }

    return sections;
  };

  const getTypeBadge = (type: string) => {
    const config = {
      CHAPTER: { label: "Chapitre", color: "bg-blue-100 text-blue-800" },
      BUNDLE: { label: "Bundle", color: "bg-green-100 text-green-800" },
      VERSION_PACK: {
        label: "Pack Perspectives",
        color: "bg-purple-100 text-purple-800",
      },
      COLORING: { label: "Coloriage", color: "bg-pink-100 text-pink-800" },
      PREORDER: {
        label: "Précommande",
        color: "bg-orange-100 text-orange-800",
      },
    };

    const typeConfig =
      config[type as keyof typeof config] || {
        label: type,
        color: "bg-gray-100 text-gray-800",
      };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${typeConfig.color}`}>
        {typeConfig.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PAID: { label: "Payé", color: "bg-green-100 text-green-800" },
      PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
      FAILED: { label: "Échoué", color: "bg-red-100 text-red-800" },
    };

    const statusConfig =
      config[status as keyof typeof config] || {
        label: status,
        color: "bg-gray-100 text-gray-800",
      };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded ${statusConfig.color}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.status === "PAID").length;
    const totalRevenue = orders
      .filter((o) => o.status === "PAID")
      .reduce((sum, order) => sum + order.amountTotal, 0);
    const uniqueCustomers = new Set(orders.map((o) => o.userId)).size;

    return { totalOrders, paidOrders, totalRevenue, uniqueCustomers };
  };

  const handleExportCSV = async () => {
    try {
      // Build query params based on current filters
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      // Download CSV data
      const blob = await api.download(
        `/admin/orders/export?${params.toString()}`,
        "text/csv"
      );
      const url = window.URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `commandes_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Export CSV réussi");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export CSV");
    }
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("messages.loading")}</div>
      </div>
    );
  }

  return (
    <div className="p-6" onContextMenu={(e) => handleContextMenu(e)}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("navigation.orders")}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Commandes</div>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MdShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Commandes Payées</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.paidOrders}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MdCheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Revenu Total</div>
              <div className="text-2xl font-bold">
                {(stats.totalRevenue / 100).toFixed(2)} €
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <MdAttachMoney className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Clients Uniques</div>
              <div className="text-2xl font-bold">{stats.uniqueCustomers}</div>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <MdPerson className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Groups */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Commandes par Client
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Cliquez sur un client pour voir le détail de ses commandes
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-[#4d252f]">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune commande trouvée
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isExpanded = expandedCustomers.has(group.user.id);
              const displayOrders =
                statusFilter === "ALL"
                  ? group.orders
                  : group.orders.filter((o) => o.status === statusFilter);

              return (
                <div key={group.user.id} className="hover:bg-gray-50">
                  {/* Customer Header */}
                  <div
                    className="px-6 py-4 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleCustomer(group.user.id)}
                    onContextMenu={(e) => handleContextMenu(e, group.user.id)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                        {group.user.email[0].toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            {group.user.firstName && group.user.lastName
                              ? `${group.user.firstName} ${group.user.lastName}`
                              : group.user.email}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${group.user.id}`);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Voir le profil →
                          </button>
                        </div>
                        {group.user.firstName && group.user.lastName && (
                          <p className="text-sm text-gray-500">
                            {group.user.email}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-6 mr-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Commandes
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {displayOrders.length}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Total dépensé
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {(group.totalSpent / 100).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {isExpanded ? (
                        <MdExpandLess size={24} className="text-gray-400" />
                      ) : (
                        <MdExpandMore size={24} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Orders List */}
                  {isExpanded && (
                    <div className="px-6 pb-4 bg-gray-50">
                      <div className="space-y-2">
                        {displayOrders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex flex-col gap-2">
                                  {getTypeBadge(order.type)}
                                  {getStatusBadge(order.status)}
                                </div>

                                <div className="flex-1">
                                  <div className="text-sm text-gray-600">
                                    Commande #{order.id.slice(0, 8)}...
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </div>
                                  {order.provider && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      via {order.provider}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">
                                    {(order.amountTotal / 100).toFixed(2)} €
                                  </div>
                                </div>
                                <button
                                  onClick={() => navigate(`/orders/${order.id}`)}
                                  className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                  <MdVisibility className="w-4 h-4" />
                                  Détails
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        sections={[
          {
            title: "Actions",
            actions: [
              {
                label: "Exporter en CSV",
                icon: <MdFileDownload />,
                onClick: handleExportCSV,
                variant: "secondary",
              },
            ],
          },
          {
            title: "Filtrer par statut",
            actions: [
              {
                label: "Toutes les commandes",
                icon: <MdFilterList />,
                onClick: () => setStatusFilter("ALL"),
                variant: statusFilter === "ALL" ? "primary" : "secondary",
                badge: orders.length,
              },
              {
                label: "Commandes payées",
                icon: <MdCheckCircle />,
                onClick: () => setStatusFilter("PAID"),
                variant: statusFilter === "PAID" ? "primary" : "secondary",
                badge: orders.filter((o) => o.status === "PAID").length,
              },
              {
                label: "En attente",
                icon: <MdFilterList />,
                onClick: () => setStatusFilter("PENDING"),
                variant: statusFilter === "PENDING" ? "primary" : "secondary",
                badge: orders.filter((o) => o.status === "PENDING").length,
              },
            ],
          },
        ]}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          sections={getContextMenuSections()}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
