import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import PurchaseTimeline from "../components/PurchaseTimeline";
import ChapterAccessSummary from "../components/ChapterAccessSummary";
import PurchaseStatistics from "../components/PurchaseStatistics";
import PurchaseTimelineChart from "../components/PurchaseTimelineChart";
import PurchaseDistributionChart from "../components/PurchaseDistributionChart";
import AddEntitlementModal from "../components/AddEntitlementModal";
import AssignPromoModal from "../components/AssignPromoModal";
import {
  MdArrowBack,
  MdEmail,
  MdShoppingCart,
  MdEdit,
  MdSend,
  MdBarChart,
  MdPhone,
  MdBook,
  MdTimeline,
  MdBarChart as MdStats,
  MdLocalOffer,
  MdCardGiftcard,
  MdChevronRight,
  MdChevronLeft,
} from "react-icons/md";

interface Promotion {
  id: string;
  name: string;
  description?: string;
  scope: string;
  type: string;
  value?: number;
  code?: string;
  targetType: string;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  maxUses?: number | null;
  perUserLimit?: number | null;
  _count?: { orders: number };
}

interface AssignedPromotion {
  id: string;
  appliedAt: string;
  promotion: Promotion;
}

interface UserDetail {
  id: string;
  publicId: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
  orders: Order[];
  entitlements: Entitlement[];
  reads: VolumeRead[];
  sessions: Session[];
  applicablePromotions?: Promotion[];
  appliedPromotions?: AssignedPromotion[];
}

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
  appliedPromotionId?: string | null;
  provider?: string;
  chapter?: {
    id: string;
    title: string;
  } | null;
  volumeFrom?: number;
  volumeTo?: number;
  appliedPromotion?: {
    id: string;
    name: string;
    description?: string;
    type: string;
    value?: number;
    scope: string;
  } | null;
}

interface Entitlement {
  id: string;
  chapterId: string;
  volumeFrom: number;
  volumeTo: number;
  scopes: string[];
  source: string;
  grantedAt: string;
  chapter: {
    id: string;
    title: string;
    status: string;
  };
}

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
}

interface VolumeRead {
  id: string;
  chapterId: string;
  volumeNumber: number;
  perspective: "NARRATOR" | "PROTAGONIST";
  progress: number;
  firstOpenedAt: string;
  completedAt: string | null;
  chapter: {
    id: string;
    title: string;
    protagonistName: string;
  };
}

type TabType = "overview" | "purchases" | "access" | "promotions";

export default function UserDetailImproved() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const locale =
    typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : "fr";

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showAddEntitlementModal, setShowAddEntitlementModal] = useState(false);
  const [showAssignPromoModal, setShowAssignPromoModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Auto-detect mobile screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowMobileSidebar(false); // Close modal on desktop
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize from localStorage, default to false (expanded)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem('userDetailSidebarCollapsed');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  // Load user data
  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}`);
      setUser(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement de l'utilisateur");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, [id]);

  // Persist collapsed state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('userDetailSidebarCollapsed', JSON.stringify(sidebarCollapsed));
    } catch {
      // Silently fail if localStorage unavailable
    }
  }, [sidebarCollapsed]);

  // Handle Escape key to toggle sidebar (but not when modals are open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't toggle sidebar if any modal is open
      if (showAddEntitlementModal || showAssignPromoModal) {
        return; // Let modal handle Escape
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setSidebarCollapsed((prev: boolean) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddEntitlementModal, showAssignPromoModal]);

  // Handle status toggle (stub)
  const handleToggleStatus = () => {
    toast("Édition du statut à implémenter");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    {
      id: "overview" as TabType,
      label: "Vue d'ensemble",
      icon: <MdStats size={20} />,
    },
    {
      id: "purchases" as TabType,
      label: "Historique d'achats",
      icon: <MdTimeline size={20} />,
    },
    {
      id: "access" as TabType,
      label: "Accès aux chapitres",
      icon: <MdBook size={20} />,
    },
    {
      id: "promotions" as TabType,
      label: "Promotions",
      icon: <MdCardGiftcard size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/users")}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition mb-6"
          title="Retour">
          <MdArrowBack className="text-xl text-gray-600" />
        </button>

        {/* Two Column Layout */}
        <div className={`grid gap-6 transition-all duration-300 ${
          isMobile
            ? 'grid-cols-1'
            : sidebarCollapsed
              ? 'grid-cols-5 lg:grid-cols-5'
              : 'grid-cols-4 lg:grid-cols-4'
        }`}>
          {/* Left Column - User Profile (Fixed) */}
          {/* Left Sidebar - Desktop */}
          {!sidebarCollapsed && (
            <div className="col-span-1">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-6">
                {/* Gradient Header with Toggle Button */}
                <div className="relative h-24 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed((prev: boolean) => !prev)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full hover:bg-gray-200 transition-colors"
                    title="Toggle sidebar (Esc)">
                    {sidebarCollapsed ? (
                      <MdChevronLeft size={20} className="text-gray-700" />
                    ) : (
                      <MdChevronRight size={20} className="text-gray-700" />
                    )}
                  </button>
                </div>

                {/* Avatar */}
                <div className="px-6 pb-6">
                  <div className="flex justify-center -mt-12 mb-4">
                    <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user.email[0].toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      {user.email.split("@")[0]}
                    </h2>
                    <p className="text-xs text-gray-500 mb-3">
                      ID: {user.publicId.slice(0, 12)}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                      <MdEmail size={16} />
                      <span className="text-xs">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <MdPhone size={16} />
                      <span className="text-xs">+33 6 XX XX XX XX</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4 flex justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                      {user.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <MdSend size={16} />
                      <span>Message</span>
                    </button>
                    <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <MdBarChart size={16} />
                      <span>Analytics</span>
                    </button>
                    <button
                      onClick={handleToggleStatus}
                      className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <MdEdit size={16} />
                      <span>Éditer</span>
                    </button>
                    <button
                      onClick={() => setShowAddEntitlementModal(true)}
                      className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <MdBook size={16} />
                      <span>+ Accès</span>
                    </button>
                    <button
                      onClick={() => setShowAssignPromoModal(true)}
                      className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <MdLocalOffer size={16} />
                      <span>+ Promo</span>
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {user.orders.filter((o) => o.status === "PAID").length}
                        </div>
                        <div className="text-xs text-gray-500">Achats</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {
                            new Set(user.entitlements.map((e) => e.chapterId))
                              .size
                          }
                        </div>
                        <div className="text-xs text-gray-500">Chapitres</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed Icon Bar - Desktop */}
          {sidebarCollapsed && (
            <div className="hidden lg:flex col-span-1 flex-col items-center gap-2 py-6 px-3 w-20 bg-white rounded-2xl shadow-sm sticky top-6">
              {/* Avatar Icon */}
              <div
                className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand sidebar">
                {user.email[0].toUpperCase()}
              </div>

              {/* Icon Buttons */}
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Expand">
                <MdChevronLeft size={18} className="text-gray-700" />
              </button>

              <button
                onClick={() => handleToggleStatus()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Éditer">
                <MdEdit size={18} className="text-gray-700" />
              </button>

              <button
                onClick={() => setShowAddEntitlementModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ajouter accès">
                <MdBook size={18} className="text-gray-700" />
              </button>

              <button
                onClick={() => setShowAssignPromoModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ajouter promo">
                <MdLocalOffer size={18} className="text-gray-700" />
              </button>

              <button
                onClick={() => navigate("/users")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-auto"
                title="Retour">
                <MdArrowBack size={18} className="text-gray-700" />
              </button>
            </div>
          )}

          {/* Right Column - Content with Tabs */}
          <div className={`flex flex-col ${
            isMobile
              ? 'col-span-1'
              : sidebarCollapsed
                ? 'col-span-4'
                : 'col-span-3'
          }`}>
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm mb-6 p-2">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}>
                    {tab.icon}
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === "overview" && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <MdStats className="text-blue-500" />
                      Statistiques d'achats
                    </h2>
                    <PurchaseStatistics
                      orders={user.orders}
                      entitlements={user.entitlements}
                      locale={locale}
                    />
                  </div>

                  {/* Charts */}
                  <PurchaseTimelineChart
                    orders={user.orders}
                    locale={locale}
                  />
                  <PurchaseDistributionChart
                    orders={user.orders}
                    locale={locale}
                  />
                </>
              )}

              {activeTab === "purchases" && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <MdShoppingCart className="text-blue-500" />
                      Historique des achats
                    </h2>
                    <span className="text-sm text-gray-500">
                      {user.orders.length} transaction
                      {user.orders.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <PurchaseTimeline
                    orders={user.orders}
                    entitlements={user.entitlements}
                    locale={locale}
                  />
                </div>
              )}

              {activeTab === "access" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MdBook className="text-blue-500" />
                        Accès aux chapitres
                      </h2>
                      <button
                        onClick={() => setShowAddEntitlementModal(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm">
                        + Ajouter un accès
                      </button>
                    </div>
                    <ChapterAccessSummary
                      entitlements={user.entitlements}
                      reads={user.reads}
                      locale={locale}
                    />
                  </div>

                  {/* Reading Progress Section */}
                  {user.reads && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MdBook className="text-purple-500" />
                        Chapitres entamés - Progression de lecture
                      </h2>
                      <div className="grid grid-cols-1 space-y-6">
                        {user.reads.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <MdBook
                              size={48}
                              className="mx-auto mb-2 opacity-50"
                            />
                            <p>Aucun Chapitre entamé</p>
                          </div>
                        )}

                        {Array.from(
                          user.reads.reduce((map, read) => {
                            const chapter = map.get(read.chapterId) || {
                              id: read.chapterId,
                              title: read.chapter.title,
                              protagonistName: read.chapter.protagonistName,
                              volumes: [],

                            };
                            chapter.volumes.push(read);
                            map.set(read.chapterId, chapter);
                            return map;
                          }, new Map<string, any>()),
                        ).map(([, chapter]) => (
                          <div
                            key={chapter.id}
                            className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-4">
                              {chapter.protagonistName} :
                              {chapter.title}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {chapter.volumes
                                .sort((a, b) => a.volumeNumber - b.volumeNumber)
                                .map((volume: VolumeRead) => (
                                  <div
                                    key={volume.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-600 bg-gray-300">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                          Vol. {volume.volumeNumber}
                                        </span>
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            volume.perspective === "NARRATOR"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-purple-100 text-purple-700"
                                          }`}>
                                          {volume.perspective === "NARRATOR"
                                            ? "📖 Narrateur"
                                            : "🔓 Protagoniste"}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-auto">
                                          Ouvert{" "}
                                          {new Date(
                                            volume.firstOpenedAt,
                                          ).toLocaleDateString(locale)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                          <div
                                            className={`h-full transition-all ${
                                              volume.perspective === "NARRATOR"
                                                ? "bg-blue-500"
                                                : "bg-purple-500"
                                            }`}
                                            style={{
                                              width: `${volume.progress}%`,
                                            }}></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">
                                          {volume.progress}%
                                        </span>
                                      </div>
                                      {volume.completedAt && (
                                        <div className="text-xs text-green-600 mt-1">
                                          ✓ Complété{" "}
                                          {new Date(
                                            volume.completedAt,
                                          ).toLocaleDateString(locale)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "promotions" && (
                <div className="space-y-6">
                  {/* Consolidated Promotions Overview */}
                  {(user.applicablePromotions?.length || 0) +
                    (user.appliedPromotions?.length || 0) +
                    (user.orders.some((o) => o.appliedPromotion) ? 1 : 0) >
                    0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MdCardGiftcard
                          className="text-blue-600"
                          size={24}
                        />
                        Vue d'ensemble consolidée
                      </h3>
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="grid grid-cols-7 gap-3 p-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">
                          <div>Promotion</div>
                          <div className="text-center">Type</div>
                          <div className="text-center">Valeur</div>
                          <div className="text-center">Statut</div>
                          <div className="text-center">Utilisée</div>
                          <div className="text-center">Restante</div>
                          <div className="text-center">Catégorie</div>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {Array.from(
                            new Map(
                              [
                                ...(user.applicablePromotions?.map((p) => ({
                                  ...p,
                                  source: "applicable",
                                })) || []),
                                ...(user.appliedPromotions?.map((ap) => ({
                                  ...ap.promotion,
                                  source: "assigned",
                                  assignedAt: ap.appliedAt,
                                })) || []),
                                ...user.orders
                                  .filter((o) => o.appliedPromotion)
                                  .map((o) => ({
                                    ...o.appliedPromotion!,
                                    source: "used",
                                  })),
                              ].reduce((map, promo) => {
                                const key = promo.id;
                                const existing = map.get(key);
                                if (existing) {
                                  existing.sources = new Set([
                                    ...(existing.sources || new Set()),
                                    promo.source,
                                  ]);
                                  if (promo.source === "used")
                                    existing.usedCount =
                                      (existing.usedCount || 0) + 1;
                                } else {
                                  map.set(key, {
                                    ...promo,
                                    sources: new Set([promo.source]),
                                    usedCount: promo.source === "used" ? 1 : 0,
                                  });
                                }
                                return map;
                              }, new Map()),
                            ).values(),
                          ).map((promo: any) => {
                            const now = new Date();
                            const isActive =
                              promo.isActive &&
                              new Date(promo.startsAt) <= now &&
                              new Date(promo.endsAt) >= now;
                            const usedCount = promo.usedCount || 0;
                            const remaining = promo.perUserLimit
                              ? Math.max(0, promo.perUserLimit - usedCount)
                              : promo.maxUses
                                ? Math.max(
                                    0,
                                    promo.maxUses - (promo._count?.orders || 0),
                                  )
                                : "∞";

                            return (
                              <div
                                key={promo.id}
                                className="grid grid-cols-7 gap-3 p-4 hover:bg-gray-50 transition-colors items-center text-sm">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {promo.name}
                                  </div>
                                  {promo.code && (
                                    <div className="text-xs text-gray-500">
                                      {promo.code}
                                    </div>
                                  )}
                                </div>
                                <div className="text-center">
                                  {promo.type === "PERCENT" && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      %
                                    </span>
                                  )}
                                  {promo.type === "FIXED" && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      €
                                    </span>
                                  )}
                                  {promo.type === "FREE" && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                      FREE
                                    </span>
                                  )}
                                </div>
                                <div className="text-center font-medium text-gray-900">
                                  {promo.type === "PERCENT" &&
                                    `${promo.value}%`}
                                  {promo.type === "FIXED" &&
                                    `${((promo.value || 0) / 100).toFixed(2)}€`}
                                  {promo.type === "FREE" && "—"}
                                </div>
                                <div className="text-center">
                                  {isActive ? (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      Actif
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                      Expiré
                                    </span>
                                  )}
                                </div>
                                <div className="text-center font-semibold text-gray-900">
                                  {usedCount}
                                </div>
                                <div className="text-center font-semibold text-gray-900">
                                  {typeof remaining === "number"
                                    ? remaining
                                    : remaining}
                                </div>
                                <div className="text-center text-xs space-x-1">
                                  {promo.sources.has("applicable") && (
                                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                      Disponible
                                    </span>
                                  )}
                                  {promo.sources.has("assigned") && (
                                    <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                      Attribuée
                                    </span>
                                  )}
                                  {promo.sources.has("used") && (
                                    <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                      Utilisée
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Directly Assigned Promotions */}
                  {user.appliedPromotions &&
                    user.appliedPromotions.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <MdCardGiftcard
                            className="text-green-600"
                            size={24}
                          />
                          Promotions attribuées directement
                        </h3>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                            <div>Nom</div>
                            <div className="text-center">Type</div>
                            <div className="text-center">Valeur</div>
                            <div className="text-center">Code</div>
                            <div className="text-center">Attribuée le</div>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {user.appliedPromotions.map((assignedPromo) => (
                              <div
                                key={assignedPromo.id}
                                className="grid grid-cols-5 gap-4 p-4 hover:bg-green-50 transition-colors items-center">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {assignedPromo.promotion.name}
                                  </div>
                                  {assignedPromo.promotion.description && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {assignedPromo.promotion.description}
                                    </div>
                                  )}
                                </div>
                                <div className="text-center">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                    {assignedPromo.promotion.type ===
                                      "PERCENT" && "Pourcentage"}
                                    {assignedPromo.promotion.type === "FIXED" &&
                                      "Montant"}
                                    {assignedPromo.promotion.type === "FREE" &&
                                      "Gratuit"}
                                  </span>
                                </div>
                                <div className="text-center font-medium text-gray-900">
                                  {assignedPromo.promotion.type === "PERCENT" &&
                                    `${assignedPromo.promotion.value}%`}
                                  {assignedPromo.promotion.type === "FIXED" &&
                                    `${((assignedPromo.promotion.value || 0) / 100).toFixed(2)}€`}
                                  {assignedPromo.promotion.type === "FREE" &&
                                    "—"}
                                </div>
                                <div className="text-center">
                                  {assignedPromo.promotion.code ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-mono bg-gray-100 text-gray-700">
                                      {assignedPromo.promotion.code}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </div>
                                <div className="text-center text-sm text-gray-600">
                                  {new Date(
                                    assignedPromo.appliedAt,
                                  ).toLocaleDateString(locale, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Applied Promotions in Orders */}
                  {user.orders.some((o) => o.appliedPromotion) && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MdCardGiftcard
                          className="text-orange-600"
                          size={24}
                        />
                        Promotions utilisées aux achats
                      </h3>
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                          <div>Nom</div>
                          <div className="text-center">Type</div>
                          <div className="text-center">Valeur</div>
                          <div className="text-center">Utilisée</div>
                          <div className="text-center">Portée</div>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {Array.from(
                            new Map(
                              user.orders
                                .filter((o) => o.appliedPromotion)
                                .reduce((map, order) => {
                                  const promo = order.appliedPromotion!;
                                  const key = promo.id;
                                  const existing = map.get(key);
                                  map.set(key, {
                                    ...promo,
                                    count: (existing?.count || 0) + 1,
                                  });
                                  return map;
                                }, new Map()),
                            ).values(),
                          ).map((promo) => (
                            <div
                              key={promo.id}
                              className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {promo.name}
                                </div>
                                {promo.description && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    {promo.description}
                                  </div>
                                )}
                              </div>
                              <div className="text-center">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                  {promo.type === "PERCENT" && "Pourcentage"}
                                  {promo.type === "FIXED" && "Montant"}
                                  {promo.type === "FREE" && "Gratuit"}
                                </span>
                              </div>
                              <div className="text-center font-medium text-gray-900">
                                {promo.type === "PERCENT" && `${promo.value}%`}
                                {promo.type === "FIXED" &&
                                  `${((promo.value || 0) / 100).toFixed(2)}€`}
                                {promo.type === "FREE" && "—"}
                              </div>
                              <div className="text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
                                  {promo.count}
                                </span>
                              </div>
                              <div className="text-center text-sm text-gray-600">
                                {promo.scope}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Applicable Promotions */}
                  {user.applicablePromotions &&
                    user.applicablePromotions.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <MdLocalOffer
                            className="text-purple-600"
                            size={24}
                          />
                          Promotions disponibles
                        </h3>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                            <div>Nom</div>
                            <div className="text-center">Type</div>
                            <div className="text-center">Valeur</div>
                            <div className="text-center">Code</div>
                            <div className="text-center">Portée</div>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {user.applicablePromotions.map((promo) => (
                              <div
                                key={promo.id}
                                className="grid grid-cols-5 gap-4 p-4 hover:bg-purple-50 transition-colors items-center">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {promo.name}
                                  </div>
                                  {promo.description && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {promo.description}
                                    </div>
                                  )}
                                </div>
                                <div className="text-center">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                                    {promo.type === "PERCENT" && "Pourcentage"}
                                    {promo.type === "FIXED" && "Montant"}
                                    {promo.type === "FREE" && "Gratuit"}
                                  </span>
                                </div>
                                <div className="text-center font-medium text-gray-900">
                                  {promo.type === "PERCENT" &&
                                    `${promo.value}%`}
                                  {promo.type === "FIXED" &&
                                    `${((promo.value || 0) / 100).toFixed(2)}€`}
                                  {promo.type === "FREE" && "—"}
                                </div>
                                <div className="text-center">
                                  {promo.code ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-mono bg-gray-100 text-gray-700">
                                      {promo.code}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </div>
                                <div className="text-center text-sm text-gray-600">
                                  {promo.scope}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Empty State */}
                  {!(user.applicablePromotions?.length || 0) &&
                    !(user.appliedPromotions?.length || 0) &&
                    !user.orders.some((o) => o.appliedPromotion) && (
                      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <MdCardGiftcard
                          className="mx-auto text-gray-400 mb-4"
                          size={48}
                        />
                        <p className="text-gray-600 font-medium">
                          Aucune promotion
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Cet utilisateur n'a aucune promotion attribuée ou
                          applicable
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Entitlement Modal */}
      {showAddEntitlementModal && (
        <AddEntitlementModal
          isOpen={showAddEntitlementModal}
          userId={user.id}
          onClose={() => setShowAddEntitlementModal(false)}
          onSuccess={() => {
            loadUser();
            setShowAddEntitlementModal(false);
          }}
        />
      )}

      {/* Assign Promo Modal */}
      {showAssignPromoModal && (
        <AssignPromoModal
          userId={user.id}
          userEmail={user.email}
          onClose={() => setShowAssignPromoModal(false)}
          onSuccess={() => {
            loadUser();
            setShowAssignPromoModal(false);
          }}
        />
      )}

      {/* Mobile Floating Button */}
      {isMobile && (
        <>
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-lg hover:shadow-xl transition-shadow z-40"
            title="Ouvrir profil">
            {user.email[0].toUpperCase()}
          </button>

          {/* Mobile Sidebar Modal */}
          {showMobileSidebar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowMobileSidebar(false)}>
              <div
                className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg">
                    <MdChevronLeft size={24} />
                  </button>
                </div>

                {/* Sidebar content (reuse from full sidebar) */}
                <div className="px-6 pb-6">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user.email[0].toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      {user.email.split("@")[0]}
                    </h2>
                    <p className="text-xs text-gray-500 mb-3">
                      ID: {user.publicId.slice(0, 12)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4 flex justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                      {user.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <MdSend size={16} />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => {
                        handleToggleStatus();
                        setShowMobileSidebar(false);
                      }}
                      className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <MdEdit size={16} />
                      <span>Éditer</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddEntitlementModal(true);
                        setShowMobileSidebar(false);
                      }}
                      className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <MdBook size={16} />
                      <span>+ Accès</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAssignPromoModal(true);
                        setShowMobileSidebar(false);
                      }}
                      className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <MdLocalOffer size={16} />
                      <span>+ Promo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
