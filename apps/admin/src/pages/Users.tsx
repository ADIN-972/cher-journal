import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { storage, STORAGE_KEYS } from "../lib/storage";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import type { User } from "@cher-journal/types";
import ConnectionStatsChart from "../components/ConnectionStatsChart";
import FloatingActionButton from "../components/FloatingActionButton";
import SmartTableGrid, { SmartTableColumn } from "../components/SmartTableGrid";
import { TableAction } from "../components/TableGrid";
import ToggleButton from "../components/ToggleButton";
import UserCard from "../components/UserCard";
import ContextMenu from "../components/ContextMenu";
import { useContextMenu } from "../hooks/useContextMenu";
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
import UserFilters, { UserFilterCriteria } from "../components/UserFilters";

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
}

type UserWithSub = User & {
  subscription?: { status: string } | null;
  _count?: { orders: number; entitlements: number };
  chaptersCount?: number;
  lastActivity?: string | null;
};

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithSub[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilterCriteria>({
    role: "ALL",
    status: "ALL",
  });
  const [viewMode, setViewMode] = useState<"list" | "card" | "calendar">(() => {
    return storage.getString(STORAGE_KEYS.USER_VIEW_MODE, "card") as "list" | "card" | "calendar";
  });
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<{
    type: "suspend" | "activate" | "promote" | "demote";
    label: string;
  } | null>(null);

  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

  const { t } = useI18n();

  useEffect(() => {
    loadUsers();
    loadOrders();
  }, [filters]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.USER_VIEW_MODE, viewMode);
  }, [viewMode]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.role && filters.role !== "ALL") params.append("role", filters.role);
      if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
      if (filters.registeredAfter) params.append("registeredAfter", filters.registeredAfter);
      if (filters.registeredBefore) params.append("registeredBefore", filters.registeredBefore);
      if (filters.minTotalSpent !== undefined) params.append("minTotalSpent", filters.minTotalSpent.toString());
      if (filters.maxTotalSpent !== undefined) params.append("maxTotalSpent", filters.maxTotalSpent.toString());
      if (filters.minOrderCount !== undefined) params.append("minOrderCount", filters.minOrderCount.toString());
      if (filters.maxOrderCount !== undefined) params.append("maxOrderCount", filters.maxOrderCount.toString());
      if (filters.searchQuery) params.append("searchQuery", filters.searchQuery);

      const response = await api.get(`/admin/users?${params.toString()}`);
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

  const handleToggleSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map((u) => u.id)));
    }
  };

  const handleBulkAction = (type: "suspend" | "activate" | "promote" | "demote") => {
    const labels = {
      suspend: "Suspendre les utilisateurs sélectionnés",
      activate: "Activer les utilisateurs sélectionnés",
      promote: "Promouvoir en Admin",
      demote: "Rétrograder en User",
    };
    setBulkAction({ type, label: labels[type] });
    setShowBulkConfirm(true);
  };

  const executeBulkAction = async () => {
    if (!bulkAction) return;

    try {
      const userIds = Array.from(selectedUserIds);
      const payload = { userIds };

      switch (bulkAction.type) {
        case "suspend":
          await api.post("/admin/users/bulk/suspend", payload);
          toast.success(`${userIds.length} utilisateur(s) suspendu(s)`);
          break;
        case "activate":
          await api.post("/admin/users/bulk/activate", payload);
          toast.success(`${userIds.length} utilisateur(s) activé(s)`);
          break;
        case "promote":
          await api.post("/admin/users/bulk/promote", payload);
          toast.success(`${userIds.length} utilisateur(s) promu(s)`);
          break;
        case "demote":
          await api.post("/admin/users/bulk/demote", payload);
          toast.success(`${userIds.length} utilisateur(s) rétrogradé(s)`);
          break;
      }

      setSelectedUserIds(new Set());
      setShowBulkConfirm(false);
      setBulkAction(null);
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'action groupée");
    }
  };

  const getUserContextSections = (user: UserWithSub) => [
    {
      title: `${user.firstName || user.email.split("@")[0]}`,
      items: [
        {
          label: "Voir le profil",
          icon: <span className="material-symbols-outlined text-sm">visibility</span>,
          onClick: () => navigate(`/users/${user.id}`),
        },
        {
          label: selectedUserIds.has(user.id) ? "Desélectionner" : "Sélectionner",
          icon: <span className="material-symbols-outlined text-sm">{selectedUserIds.has(user.id) ? "check_box" : "check_box_outline_blank"}</span>,
          onClick: () => handleToggleSelection(user.id),
        },
        { label: "", onClick: () => {}, divider: true },
        {
          label: user.status === "ACTIVE" ? "Suspendre" : "Activer",
          icon: <span className="material-symbols-outlined text-sm">{user.status === "ACTIVE" ? "block" : "check_circle"}</span>,
          onClick: () => handleToggleStatus(user.id, user.status),
          danger: user.status === "ACTIVE",
        },
        {
          label: user.role === "ADMIN" ? "Rétrograder (User)" : "Promouvoir (Admin)",
          icon: <span className="material-symbols-outlined text-sm">{user.role === "ADMIN" ? "arrow_downward" : "arrow_upward"}</span>,
          onClick: () => handleBulkAction(user.role === "ADMIN" ? "demote" : "promote"),
        },
      ],
    },
  ];

  const getGlobalContextSections = () => [
    {
      title: "Actions globales",
      items: [
        {
          label: selectedUserIds.size === users.length ? "Tout désélectionner" : "Tout sélectionner",
          icon: <span className="material-symbols-outlined text-sm">{selectedUserIds.size === users.length ? "deselect" : "select_all"}</span>,
          onClick: handleSelectAll,
        },
        ...(selectedUserIds.size > 0
          ? [
              { label: "", onClick: () => {}, divider: true as const },
              {
                label: `Activer (${selectedUserIds.size})`,
                icon: <span className="material-symbols-outlined text-sm">check_circle</span>,
                onClick: () => handleBulkAction("activate"),
              },
              {
                label: `Suspendre (${selectedUserIds.size})`,
                icon: <span className="material-symbols-outlined text-sm">block</span>,
                onClick: () => handleBulkAction("suspend"),
                danger: true as const,
              },
              {
                label: `Promouvoir (${selectedUserIds.size})`,
                icon: <span className="material-symbols-outlined text-sm">arrow_upward</span>,
                onClick: () => handleBulkAction("promote"),
              },
              {
                label: `Rétrograder (${selectedUserIds.size})`,
                icon: <span className="material-symbols-outlined text-sm">arrow_downward</span>,
                onClick: () => handleBulkAction("demote"),
              },
            ]
          : []),
      ],
    },
  ];

  const handleCardContextMenu = (e: React.MouseEvent, user: UserWithSub) => {
    openContextMenu(e, getUserContextSections(user));
  };

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    // Only trigger on the container itself, not on cards
    if ((e.target as HTMLElement).closest('[data-user-card]')) return;
    openContextMenu(e, getGlobalContextSections());
  };

  const handleClearFilters = () => {
    setFilters({
      role: "ALL",
      status: "ALL",
    });
  };

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

  const columns: SmartTableColumn<UserWithSub>[] = useMemo(
    () => [
      {
        id: "email",
        header: "Utilisateur",
        render: (user) => (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
              {(user.firstName?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName}
                {user.username && <span className="text-xs text-gray-400 ml-1">@{user.username}</span>}
              </div>
              <div className="text-xs text-gray-500">{user.email}</div>
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
        id: "club",
        header: "Club",
        render: (user: UserWithSub) =>
          user.subscription?.status === "ACTIVE" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
              <span className="material-symbols-outlined text-sm">workspace_premium</span>
              Membre Club
            </span>
          ) : null,
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

  const actions: TableAction<UserWithSub>[] = useMemo(
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

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const clubCount = users.filter((u) => u.subscription?.status === "ACTIVE").length;

  return (
    <div className="p-6">

      {/* Header */}
      <header className="mb-10 flex items-end justify-between">
        <div>
          <p className="uppercase tracking-widest text-[10px] text-[#e9c176] font-bold mb-2">Workspace / Management</p>
          <h2 className="text-5xl italic text-[#2A1720]">Lecteurs & Membres</h2>
        </div>
        <div className="flex gap-4 mb-1">
          <div className="bg-[#F2EDE9] rounded-2xl p-4 flex flex-col items-center min-w-[120px] shadow-sm border border-[#e9c176]/10">
            <span className="text-[#e9c176] text-2xl font-bold">{activeCount}</span>
            <span className="uppercase text-[9px] tracking-tight text-[#2A1720]/60 font-bold">Lecteurs actifs</span>
          </div>
          <div className="bg-[#F2EDE9] rounded-2xl p-4 flex flex-col items-center min-w-[120px] shadow-sm border border-[#e9c176]/10">
            <span className="text-[#7a5763] text-2xl font-bold">{clubCount}</span>
            <span className="uppercase text-[9px] tracking-tight text-[#2A1720]/60 font-bold">Club Prive</span>
          </div>
        </div>
      </header>

      <div className="flex justify-between items-center mb-6">
       <div className=""></div>
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

      {/* User Filters */}
      <div className="mb-6">
        <UserFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedUserIds.size > 0 && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <MdCheckBox className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-indigo-900">
                {selectedUserIds.size} utilisateur(s) sélectionné(s)
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleBulkAction("activate")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                Activer
              </button>
              <button
                onClick={() => handleBulkAction("suspend")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                Suspendre
              </button>
              <button
                onClick={() => handleBulkAction("promote")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                Promouvoir (Admin)
              </button>
              <button
                onClick={() => handleBulkAction("demote")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                Rétrograder (User)
              </button>
              <button
                onClick={() => setSelectedUserIds(new Set())}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Annuler la sélection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Confirmation Modal */}
      {showBulkConfirm && bulkAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirmer l'action
            </h3>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir <strong>{bulkAction.label}</strong> ?
              <br />
              <span className="text-sm text-gray-500">
                Cette action concernera {selectedUserIds.size} utilisateur(s).
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkConfirm(false);
                  setBulkAction(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Annuler
              </button>
              <button
                onClick={executeBulkAction}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <SmartTableGrid
          listName="users"
          data={users}
          columns={columns}
          actions={actions}
          getItemId={(user) => user.id}
          loading={loading}
          emptyMessage="Aucun utilisateur trouvé"
          selectedIds={selectedUserIds}
          onToggleSelection={handleToggleSelection}
          onToggleSelectAll={handleSelectAll}
        />
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          onContextMenu={handleGlobalContextMenu}
        >
          {users.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              Aucun utilisateur trouvé
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} data-user-card>
                <UserCard
                  user={user}
                  selected={selectedUserIds.has(user.id)}
                  onClick={() => navigate(`/users/${user.id}`)}
                  onSelect={() => handleToggleSelection(user.id)}
                  onContextMenu={(e) => handleCardContextMenu(e, user)}
                />
              </div>
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

      {/* Connection Stats Chart */}
      <div className="mt-8">
        <ConnectionStatsChart />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        sections={[
          {
            title: "Actions",
            actions: [
              {
                label: selectedUserIds.size === users.length ? "Tout desélectionner" : "Tout sélectionner",
                icon: <span className="material-symbols-outlined text-lg">{selectedUserIds.size === users.length ? "deselect" : "select_all"}</span>,
                onClick: handleSelectAll,
                variant: "secondary",
              },
              ...(selectedUserIds.size > 0
                ? [
                    {
                      label: `Activer (${selectedUserIds.size})`,
                      icon: <span className="material-symbols-outlined text-lg">check_circle</span>,
                      onClick: () => handleBulkAction("activate"),
                      variant: "primary" as const,
                    },
                    {
                      label: `Suspendre (${selectedUserIds.size})`,
                      icon: <span className="material-symbols-outlined text-lg">block</span>,
                      onClick: () => handleBulkAction("suspend"),
                      variant: "danger" as const,
                    },
                    {
                      label: `Promouvoir Admin (${selectedUserIds.size})`,
                      icon: <span className="material-symbols-outlined text-lg">arrow_upward</span>,
                      onClick: () => handleBulkAction("promote"),
                      variant: "secondary" as const,
                    },
                    {
                      label: `Rétrograder User (${selectedUserIds.size})`,
                      icon: <span className="material-symbols-outlined text-lg">arrow_downward</span>,
                      onClick: () => handleBulkAction("demote"),
                      variant: "secondary" as const,
                    },
                    {
                      label: "Annuler la sélection",
                      icon: <span className="material-symbols-outlined text-lg">close</span>,
                      onClick: () => setSelectedUserIds(new Set()),
                      variant: "secondary" as const,
                    },
                  ]
                : []),
            ],
          },
        ]}
      />

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          sections={contextMenu.sections}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
