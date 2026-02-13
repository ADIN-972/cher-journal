import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import AddEntitlementModal from "../components/AddEntitlementModal";
import {
  MdArrowBack,
  MdEmail,
  MdEvent,
  MdShoppingCart,
  MdLock,
  MdCheckCircle,
  MdCancel,
  MdEdit,
  MdSend,
  MdBarChart,
  MdAttachFile,
  MdSearch,
  MdPhone,
  MdLocationOn,
  MdNotes,
  MdExpandMore,
  MdExpandLess,
  MdBook,
  MdVisibility,
  MdAttachMoney,
  MdCardGiftcard,
} from "react-icons/md";

// Main UserDetail page component
export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const locale =
    typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : "fr";
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddEntitlementModal, setShowAddEntitlementModal] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  // Load user data
  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}`);
      setUser(res.data);
    } catch (err) {
      toast.error(t("user_detail.load_error"));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, [id]);

  // Toggle chapter accordion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  // Format date utility
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format amount utility
  const formatAmount = (amount: number, currency: string) => {
    return amount.toLocaleString(locale, {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 2,
    });
  };

  // Handle status toggle (stub)
  const handleToggleStatus = () => {
    toast(t("user_detail.actions.edit_status"));
  };

  // ...existing code...

  interface Promotion {
    id: string;
    name: string;
    description?: string;
    scope: string;
    type: string;
    value?: number;
    code?: string;
    targetType: string;
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
    versionScope: string;
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
    firstOpenedAt: string;
    completedAt: string | null;
    chapter: {
      id: string;
      title: string;
    };
  }

  const getChapterStats = (chapterId: string) => {
    const entitlement = user?.entitlements.find(
      (e) => e.chapterId === chapterId
    );
    const reads = user?.reads.filter((r) => r.chapterId === chapterId) || [];
    const orders =
      user?.orders.filter((o) => o.chapter?.id === chapterId) || [];

    return {
      volumesPaid: entitlement
        ? `${entitlement.volumeFrom}-${entitlement.volumeTo}`
        : "Aucun",
      volumesRead: reads.length > 0 ? reads.length : 0,
      lastRead: reads.length > 0 ? reads[0].firstOpenedAt : null,
      orders: orders,
    };
  };

  const isVolumePaid = (volumeNumber: number, chapterId: string): boolean => {
    const entitlement = user?.entitlements.find(
      (e) => e.chapterId === chapterId
    );
    if (!entitlement) return false;
    return (
      volumeNumber >= entitlement.volumeFrom &&
      volumeNumber <= entitlement.volumeTo
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("messages.loading")}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/users")}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition mb-6"
          title={t("user_detail.actions.back")}>
          <MdArrowBack className="text-xl text-gray-600" />
        </button>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Gradient Header */}
              <div className="h-32 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>

              {/* Avatar */}
              <div className="px-6 pb-6">
                <div className="flex justify-center -mt-16 mb-4">
                  <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {user.email[0].toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {user.email.split("@")[0]}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">
                    @{user.publicId.slice(0, 8)}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                    <MdEmail size={16} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <MdPhone size={16} />
                    <span>+33 6 12 34 56 78</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <MdSend size={16} />
                    <span>{t("user_detail.actions.message")}</span>
                  </button>
                  <button className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <MdBarChart size={16} />
                    <span>{t("user_detail.actions.analytics")}</span>
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                    title={t("user_detail.actions.edit_status")}>
                    <MdEdit size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <MdNotes
                  size={20}
                  className="text-gray-700"
                />
                <h3 className="font-semibold text-gray-900">
                  {t("user_detail.notes.title")}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t("user_detail.notes.body")}
              </p>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <MdLocationOn
                  size={20}
                  className="text-gray-700"
                />
                <h3 className="font-semibold text-gray-900">
                  {t("user_detail.address.title")}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {t("user_detail.address.line")}
              </p>
              <button
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                title={t("user_detail.address.view_map")}>
                {t("user_detail.address.view_map")}
              </button>
            </div>

            {/* Attachments Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MdAttachFile
                    size={20}
                    className="text-gray-700"
                  />
                  <h3 className="font-semibold text-gray-900">
                    {t("user_detail.attachments.title")}
                  </h3>
                </div>
                <button
                  className="text-sm text-gray-500 hover:text-gray-700"
                  title={
                    t("common.add") + " " + t("user_detail.attachments.title")
                  }>
                  {t("common.add")}
                </button>
              </div>
              <p className="text-sm text-gray-500 text-center py-4">
                {t("user_detail.attachments.none")}
              </p>
            </div>
          </div>

          {/* Right Column - Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <MdSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder={t("user_detail.search_orders_placeholder")}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {user.orders.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("user_detail.stats.total_orders")}
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {formatAmount(
                      user.orders
                        .filter((o) => o.status === "PAID")
                        .reduce((sum, o) => sum + (o.amountTotal || 0), 0),
                      "EUR"
                    )}
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    {t("user_detail.stats.paid_orders")}
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700 px-2">
                  <div className="flex-1">{t("user_detail.order")}</div>
                  <div className="w-32 text-right">
                    {t("user_detail.status")}
                  </div>
                </div>

                {user.orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {t("user_detail.no_orders")}
                  </div>
                ) : (
                  user.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <MdShoppingCart
                            className="text-gray-600"
                            size={20}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {t("user_detail.order_label", undefined, {
                              id: order.id.slice(0, 8).toUpperCase(),
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </div>
                          {order.chapter && (
                            <div className="text-sm text-gray-600 mt-1">
                              {order.chapter.title} - Vol. {order.volumeFrom}
                              {order.volumeTo &&
                                order.volumeTo !== order.volumeFrom &&
                                ` à ${order.volumeTo}`}
                            </div>
                          )}
                          {order.appliedPromotion && (
                            <div className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                              <MdCardGiftcard size={14} />
                              <span className="font-medium">{order.appliedPromotion.name}</span>
                              {order.appliedPromotion.type === "PERCENT" && order.appliedPromotion.value && (
                                <span>({order.appliedPromotion.value}% off)</span>
                              )}
                              {order.appliedPromotion.type === "FIXED" && order.appliedPromotion.value && (
                                <span>(-{(order.appliedPromotion.value / 100).toFixed(2)}€)</span>
                              )}
                              {order.appliedPromotion.type === "FREE" && (
                                <span>(Gratuit)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-32 flex justify-end">
                        {order.status === "PAID" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                            <MdCheckCircle size={16} />
                            {t("orders.completed")}
                          </span>
                        )}
                        {order.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                            <MdEvent size={16} />
                            {t("orders.pending")}
                          </span>
                        )}
                        {order.status === "REFUNDED" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                            <MdCancel size={16} />
                            {t("orders.refunded", "Refunded")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Directly Assigned Promotions */}
                {user.appliedPromotions && user.appliedPromotions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MdCardGiftcard className="text-green-600" size={24} />
                      {t("user_detail.assigned_promotions", "Directly Assigned Promotions")}
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                        <div>{t("user_detail.promo_name", "Promotion Name")}</div>
                        <div className="text-center">{t("user_detail.promo_type", "Type")}</div>
                        <div className="text-center">{t("user_detail.promo_value", "Value")}</div>
                        <div className="text-center">{t("user_detail.promo_code", "Code")}</div>
                        <div className="text-center">{t("user_detail.assigned_date", "Assigned")}</div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {user.appliedPromotions.map((assignedPromo) => (
                          <div
                            key={assignedPromo.id}
                            className="grid grid-cols-5 gap-4 p-4 hover:bg-green-50 transition-colors items-center">
                            <div>
                              <div className="font-medium text-gray-900">{assignedPromo.promotion.name}</div>
                              {assignedPromo.promotion.description && (
                                <div className="text-sm text-gray-500 mt-1">{assignedPromo.promotion.description}</div>
                              )}
                            </div>
                            <div className="text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                {assignedPromo.promotion.type === "PERCENT" && "Pourcentage"}
                                {assignedPromo.promotion.type === "FIXED" && "Montant"}
                                {assignedPromo.promotion.type === "FREE" && "Gratuit"}
                              </span>
                            </div>
                            <div className="text-center font-medium text-gray-900">
                              {assignedPromo.promotion.type === "PERCENT" && `${assignedPromo.promotion.value}%`}
                              {assignedPromo.promotion.type === "FIXED" && `${((assignedPromo.promotion.value || 0) / 100).toFixed(2)}€`}
                              {assignedPromo.promotion.type === "FREE" && "—"}
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
                              {formatDate(assignedPromo.appliedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Promotions Summary */}
                {user.orders.some(o => o.appliedPromotion) && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MdCardGiftcard className="text-orange-600" size={24} />
                      {t("user_detail.applied_promotions", "Applied Promotions")}
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                        <div>{t("user_detail.promo_name", "Promotion Name")}</div>
                        <div className="text-center">{t("user_detail.promo_type", "Type")}</div>
                        <div className="text-center">{t("user_detail.promo_value", "Value")}</div>
                        <div className="text-center">{t("user_detail.promo_usage", "Used")}</div>
                        <div className="text-center">{t("user_detail.promo_scope", "Scope")}</div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {Array.from(
                          new Map(
                            user.orders
                              .filter(o => o.appliedPromotion)
                              .reduce((map, order) => {
                                const promo = order.appliedPromotion!;
                                const key = promo.id;
                                const existing = map.get(key);
                                map.set(key, {
                                  ...promo,
                                  count: (existing?.count || 0) + 1,
                                });
                                return map;
                              }, new Map())
                          ).values()
                        ).map((promo) => (
                          <div
                            key={promo.id}
                            className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors items-center">
                            <div>
                              <div className="font-medium text-gray-900">{promo.name}</div>
                              {promo.description && (
                                <div className="text-sm text-gray-500 mt-1">{promo.description}</div>
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
                              {promo.type === "FIXED" && `${((promo.value || 0) / 100).toFixed(2)}€`}
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
                {user.applicablePromotions && user.applicablePromotions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MdLocalOffer className="text-blue-600" size={24} />
                      {t("user_detail.available_promotions", "Available Promotions")}
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                        <div>{t("user_detail.promo_name", "Promotion Name")}</div>
                        <div className="text-center">{t("user_detail.promo_type", "Type")}</div>
                        <div className="text-center">{t("user_detail.promo_value", "Value")}</div>
                        <div className="text-center">{t("user_detail.promo_code", "Code")}</div>
                        <div className="text-center">{t("user_detail.promo_scope", "Scope")}</div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {user.applicablePromotions.map((promo) => (
                          <div
                            key={promo.id}
                            className="grid grid-cols-5 gap-4 p-4 hover:bg-blue-50 transition-colors items-center">
                            <div>
                              <div className="font-medium text-gray-900">{promo.name}</div>
                              {promo.description && (
                                <div className="text-sm text-gray-500 mt-1">{promo.description}</div>
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
                              {promo.type === "PERCENT" && `${promo.value}%`}
                              {promo.type === "FIXED" && `${((promo.value || 0) / 100).toFixed(2)}€`}
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

                {/* Chapters Section with Accordion */}
                <div className="mt-6">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <MdBook
                        size={24}
                        className="text-blue-600"
                      />
                      {t("user_detail.chapters.title")}
                    </h2>

                    {user.entitlements.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        {t("user_detail.chapters.none")}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Grouper par chapitre */}
                        {Array.from(
                          new Set(user.entitlements.map((e) => e.chapterId))
                        ).map((chapterId) => {
                          const entitlement = user.entitlements.find(
                            (e) => e.chapterId === chapterId
                          );
                          if (!entitlement) return null;

                          const stats = getChapterStats(chapterId);
                          const isExpanded = expandedChapters.has(chapterId);
                          const chapterReads = (user.reads || []).filter(
                            (r) => r.chapterId === chapterId
                          );

                          return (
                            <div
                              key={chapterId}
                              className="border-2 border-gray-200 rounded-xl overflow-hidden">
                              {/* Chapter Header - Clickable */}
                              <button
                                onClick={() => toggleChapter(chapterId)}
                                className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors flex items-center justify-between"
                                title={t("user_detail.chapter.toggle_details")}>
                                <div className="flex items-center gap-4 flex-1 text-left">
                                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <MdBook
                                      className="text-blue-600"
                                      size={24}
                                    />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-900 text-lg">
                                      {entitlement.chapter.title}
                                    </h3>
                                    <div className="flex gap-4 mt-1">
                                      <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <MdShoppingCart size={16} />
                                        <strong>
                                          {t("user_detail.chapter.paid_label")}:
                                        </strong>{" "}
                                        {t("user_detail.chapter.volume_prefix")}{" "}
                                        {stats.volumesPaid}
                                      </span>
                                      <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <MdVisibility size={16} />
                                        <strong>
                                          {t("user_detail.chapter.read_label")}:
                                        </strong>{" "}
                                        {stats.volumesRead}{" "}
                                        {t("user_detail.chapter.volumes")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  {isExpanded ? (
                                    <MdExpandLess size={24} />
                                  ) : (
                                    <MdExpandMore size={24} />
                                  )}
                                </div>
                              </button>

                              {/* Chapter Details - Accordion Content */}
                              {isExpanded && (
                                <div className="p-4 bg-white border-t-2 border-gray-200">
                                  <div className="space-y-4">
                                    {/* Entitlements Section */}
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <MdLock size={18} />
                                        {t("user_detail.chapter.paid_volumes")}
                                      </h4>
                                      <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-gray-900 font-medium">
                                              {t(
                                                "user_detail.chapter.volumes_range",
                                                undefined,
                                                {
                                                  from: entitlement.volumeFrom,
                                                  to: entitlement.volumeTo,
                                                }
                                              )}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                              {t(
                                                "user_detail.chapter.access",
                                                undefined,
                                                {
                                                  access:
                                                    entitlement.versionScope,
                                                }
                                              )}{" "}
                                              •{" "}
                                              {t(
                                                "user_detail.chapter.source",
                                                undefined,
                                                {
                                                  source: entitlement.source,
                                                }
                                              )}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                              {t(
                                                "user_detail.chapter.granted_on"
                                              )}
                                            </p>
                                            <p className="text-sm font-medium text-gray-900">
                                              {new Date(
                                                entitlement.grantedAt
                                              ).toLocaleDateString(locale)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Orders for this chapter */}
                                    {stats.orders.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                          <MdShoppingCart size={18} />
                                          {t(
                                            "user_detail.chapter.orders",
                                            undefined,
                                            {
                                              count: stats.orders.length,
                                            }
                                          )}
                                        </h4>
                                        <div className="space-y-2">
                                          {stats.orders.map((order) => (
                                            <div
                                              key={order.id}
                                              className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                              <div>
                                                <p className="font-medium text-gray-900">
                                                  #
                                                  {order.id
                                                    .slice(0, 8)
                                                    .toUpperCase()}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                  {new Date(
                                                    order.createdAt
                                                  ).toLocaleDateString(locale, {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-bold text-gray-900">
                                                  {formatAmount(
                                                    order.amountTotal || 0,
                                                    order.currency || "EUR"
                                                  )}
                                                </p>
                                                <span
                                                  className={`inline-block px-2 py-1 text-xs rounded-lg font-medium ${
                                                    order.status === "PAID"
                                                      ? "bg-green-100 text-green-700"
                                                      : order.status ===
                                                          "PENDING"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                  }`}>
                                                  {order.status}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Volume Reads */}
                                    {chapterReads.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                          <MdVisibility size={18} />
                                          {t(
                                            "user_detail.chapter.read_history",
                                            undefined,
                                            {
                                              count: chapterReads.length,
                                            }
                                          )}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                          {chapterReads
                                            .sort(
                                              (a, b) =>
                                                a.volumeNumber - b.volumeNumber
                                            )
                                            .map((read) => {
                                              const isPaid = isVolumePaid(
                                                read.volumeNumber,
                                                read.chapterId
                                              );
                                              return (
                                                <div
                                                  key={read.id}
                                                  className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                  <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <p className="font-medium text-gray-900">
                                                          {t(
                                                            "user_detail.chapter.volume_label",
                                                            undefined,
                                                            {
                                                              volume:
                                                                read.volumeNumber,
                                                            }
                                                          )}
                                                        </p>
                                                        {isPaid ? (
                                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                                                            <MdAttachMoney
                                                              size={14}
                                                            />
                                                            {t(
                                                              "user_detail.chapter.paid"
                                                            )}
                                                          </span>
                                                        ) : (
                                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                                            <MdCardGiftcard
                                                              size={14}
                                                            />
                                                            {t(
                                                              "user_detail.chapter.free"
                                                            )}
                                                          </span>
                                                        )}
                                                      </div>
                                                      <p className="text-xs text-gray-600 mt-1">
                                                        {t(
                                                          "user_detail.chapter.opened_on",
                                                          undefined,
                                                          {
                                                            date: new Date(
                                                              read.firstOpenedAt
                                                            ).toLocaleDateString(
                                                              locale
                                                            ),
                                                          }
                                                        )}
                                                      </p>
                                                      {read.completedAt && (
                                                        <p className="text-xs text-gray-600">
                                                          {t(
                                                            "user_detail.chapter.completed_on",
                                                            undefined,
                                                            {
                                                              date: new Date(
                                                                read.completedAt
                                                              ).toLocaleDateString(
                                                                locale
                                                              ),
                                                            }
                                                          )}
                                                        </p>
                                                      )}
                                                    </div>
                                                    {read.completedAt ? (
                                                      <MdCheckCircle
                                                        className="text-green-600"
                                                        size={20}
                                                      />
                                                    ) : (
                                                      <MdVisibility
                                                        className="text-blue-600"
                                                        size={20}
                                                      />
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Entitlement Modal */}
      <AddEntitlementModal
        isOpen={showAddEntitlementModal}
        onClose={() => setShowAddEntitlementModal(false)}
        userId={user.id}
        onSuccess={loadUser}
      />
    </div>
  );
}
