import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import type { User } from "@cher-journal/types";
import FloatingActionButton from "../components/FloatingActionButton";
import SmartTableGrid, { SmartTableColumn } from "../components/SmartTableGrid";
import { TableAction } from "../components/TableGrid";
import ToggleButton from "../components/ToggleButton";
import UserCard from "../components/UserCard";
import PurchaseTimelineChart from "../components/PurchaseTimelineChart";
import PurchaseDistributionChart from "../components/PurchaseDistributionChart";
import {
  MdPeople,
  MdAdminPanelSettings,
  MdFilterList,
  MdVisibility,
  MdViewList,
  MdViewModule,
  MdCalendarMonth,
  MdAdd,
  MdEdit,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdTune,
  MdArrowBack,
} from "react-icons/md";

import ActionButton from "../components/ActionButton";

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
}

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [viewMode, setViewMode] = useState<"list" | "card" | "calendar">(() => {
    const saved = localStorage.getItem("userViewMode");
    return (saved as "list" | "card" | "calendar") || "card";
  });

  const { t } = useI18n();

  useEffect(() => {
    loadUsers();
    loadOrders();
  }, []);

  useEffect(() => {
    localStorage.setItem("userViewMode", viewMode);
  }, [viewMode]);

  const loadUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      toast.error(t("messages.error.load_users"));
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

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      await api.patch(`/admin/users/${userId}`, { status: newStatus });
      const message =
        newStatus === "ACTIVE"
          ? t("users.user_activated")
          : t("users.user_suspended");
      toast.success(message);
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || t("messages.error.load_users"));
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "ALL") return true;
    return user.role === filter;
  });

  const getStatusBadge = (status: string) => {
    return status === "ACTIVE" ? (
      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
        {t("users.status_active")}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
        {t("users.status_suspended")}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    return role === "ADMIN" ? (
      <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
        {t("users.role_admin")}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
        {t("users.role_user")}
      </span>
    );
  };

  const columns: SmartTableColumn<User>[] = useMemo(
    () => [
      {
        id: "email",
        header: "Email",
        render: (user) => (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{user.email}</div>
              <div className="text-xs text-gray-500">{user.id}</div>
            </div>
          </div>
        ),
        defaultVisible: true,
      },
      {
        id: "role",
        header: "Rôle",
        render: (user) => getRoleBadge(user.role),
        align: "center",
        defaultVisible: true,
      },
      {
        id: "status",
        header: "Statut",
        render: (user) => getStatusBadge(user.status),
        align: "center",
        defaultVisible: true,
      },
      {
        id: "createdAt",
        header: "Date d'inscription",
        render: (user) => new Date(user.createdAt).toLocaleDateString("fr-FR"),
        defaultVisible: true,
      },
    ],
    [t]
  );

  const actions: TableAction<User>[] = useMemo(
    () => [
      {
        onClick: (user) => navigate(`/users/${user.id}`),
        render: (user) => (
          <ActionButton
            icon={<MdVisibility />}
            onClick={() => navigate(`/users/${user.id}`)}
            ariaLabel={t("users.details") || "Détails"}
            variant="indigo"
          />
        ),
      },
      {
        onClick: (user) => handleToggleStatus(user.id, user.status),
        render: (user) => {
          const isActive = user.status === "ACTIVE";
          return (
            <ToggleButton
              checked={isActive}
              onChange={() => handleToggleStatus(user.id, user.status)}
              ariaLabel={
                isActive
                  ? t("users.status_active")
                  : t("users.status_suspended")
              }
              variant="green"
              uncheckedColor="red"
            />
          );
        },
      },
    ],
    [navigate]
  );

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
        <h1 className="text-3xl font-bold">{t("navigation.users")}</h1>
        <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded transition-colors ${viewMode === "card" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            title={t("chapters_page.tooltip.view_card")}>
            <MdViewModule className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            title={t("chapters_page.tooltip.view_list")}>
            <MdViewList className="w-5 h-5" />
          </button>
          {/* <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded transition-colors ${viewMode === "calendar" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            title={t("chapters_page.tooltip.view_calendar")}>
            <MdCalendarMonth className="w-5 h-5" />
          </button> */}
        </div>
      </div>

      {viewMode === "list" ? (
        <SmartTableGrid
          listName="users"
          data={filteredUsers}
          columns={columns}
          actions={actions}
          getItemId={(user) => user.id}
          loading={loading}
          emptyMessage="Aucun utilisateur trouvé"
        
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              Aucun utilisateur trouvé
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => navigate(`/users/${user.id}`)}
              />
            ))
          )}
        </div>
      )}

      {/* Analytics Section - Charts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Analyse Globale des Achats
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PurchaseTimelineChart orders={orders} locale="fr" />
          <PurchaseDistributionChart orders={orders} locale="fr" />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        sections={[
          {
            title: "Filtrer",
            actions: [
              {
                label: "Tous les utilisateurs",
                icon: <MdPeople />,
                onClick: () => setFilter("ALL"),
                variant: filter === "ALL" ? "primary" : "secondary",
                badge: users.length,
              },
              {
                label: "Administrateurs",
                icon: <MdAdminPanelSettings />,
                onClick: () => setFilter("ADMIN"),
                variant: filter === "ADMIN" ? "primary" : "secondary",
                badge: users.filter((u) => u.role === "ADMIN").length,
              },
              {
                label: "Utilisateurs",
                icon: <MdPeople />,
                onClick: () => setFilter("USER"),
                variant: filter === "USER" ? "primary" : "secondary",
                badge: users.filter((u) => u.role === "USER").length,
              },
            ],
          },
        ]}
      />
    </div>
  );
}
