import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import {
  MdArrowBack,
  MdShoppingCart,
  MdPerson,
  MdPayment,
  MdCalendarToday,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdInfo,
  MdAttachMoney,
  MdLocalOffer,
  MdReceipt,
} from "react-icons/md";
import RefundManagement from "../components/RefundManagement";

interface OrderDetail {
  id: string;
  userId: string;
  type: string;
  status: string;
  provider?: string;
  providerSessionId?: string;
  providerPaymentIntentId?: string;
  currency?: string;
  amountTotal?: number;
  appliedPriceFreeToRead?: number;
  appliedPricePaywall?: number;
  appliedPriceEpilogue?: number;
  appliedPriceSchemaId?: string;
  appliedPromotionId?: string;
  createdAt: string;
  user: {
    id: string;
    publicId: string;
    email: string;
  };
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      toast.error(t("messages.error.load_order"));
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; color: string; icon: any }
    > = {
      PAID: {
        label: "Payée",
        color: "bg-green-100 text-green-800",
        icon: MdCheckCircle,
      },
      PENDING: {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-800",
        icon: MdPending,
      },
      FAILED: {
        label: "Échouée",
        color: "bg-red-100 text-red-800",
        icon: MdCancel,
      },
      CANCELLED: {
        label: "Annulée",
        color: "bg-gray-100 text-gray-800",
        icon: MdCancel,
      },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
      icon: MdInfo,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      VOLUME: "Volume",
      CHAPTER: "Chapitre",
      POV_CHAPTER: "POV Chapitre",
      POV_VOLUME: "POV Volume",
      EPILOGUE: "Épilogue",
      COLORING: "Coloriage",
      BUNDLE: "Bundle",
      SUBSCRIPTION: "Abonnement",
      PREORDER: "Pré-commande",
    };

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800">
        <MdShoppingCart className="w-4 h-4" />
        {typeLabels[type] || type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg animate-pulse">
            <MdShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div className="text-lg text-gray-700 font-medium">
            Chargement de la commande...
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Retour à la liste des commandes">
            <MdArrowBack className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Commande #{order.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Créée le {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}
          {getTypeBadge(order.type)}
        </div>
      </header>

      <article className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <MdReceipt className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Résumé de la commande
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">ID de la commande</p>
                    <p className="text-base font-medium text-gray-900 font-mono">
                      {order.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Type de commande</p>
                    <p className="text-base font-medium text-gray-900">
                      {getTypeBadge(order.type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <p className="text-base font-medium text-gray-900">
                      {getStatusBadge(order.status)}
                    </p>
                  </div>
                </div>

                {order.amountTotal !== null &&
                  order.amountTotal !== undefined && (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm text-green-700 font-medium">
                          Montant total
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(
                            order.amountTotal,
                            order.currency || "EUR"
                          )}
                        </p>
                      </div>
                      <MdAttachMoney className="w-12 h-12 text-green-600 opacity-50" />
                    </div>
                  )}

                {order.appliedPromotionId && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <MdLocalOffer className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-700 font-medium">
                        Promotion appliquée
                      </p>
                      <p className="text-sm text-purple-900 font-mono">
                        {order.appliedPromotionId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Payment Details */}
          {order.provider && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MdPayment className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Détails du paiement
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Fournisseur de paiement
                      </p>
                      <p className="text-base font-medium text-gray-900 capitalize">
                        {order.provider}
                      </p>
                    </div>

                    {order.currency && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Devise</p>
                        <p className="text-base font-medium text-gray-900">
                          {order.currency}
                        </p>
                      </div>
                    )}
                  </div>

                  {order.providerSessionId && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        ID de session {order.provider}
                      </p>
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {order.providerSessionId}
                      </p>
                    </div>
                  )}

                  {order.providerPaymentIntentId && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        ID d'intention de paiement
                      </p>
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {order.providerPaymentIntentId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Pricing Details */}
          {(order.appliedPriceFreeToRead ||
            order.appliedPricePaywall ||
            order.appliedPriceEpilogue ||
            order.appliedPriceSchemaId) && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MdInfo className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Détails de tarification
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {order.appliedPriceSchemaId && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Schéma de prix appliqué
                      </span>
                      <span className="text-sm font-mono text-gray-900">
                        {order.appliedPriceSchemaId}
                      </span>
                    </div>
                  )}

                  {order.appliedPriceFreeToRead !== null &&
                    order.appliedPriceFreeToRead !== undefined && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Prix Free-to-Read
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            order.appliedPriceFreeToRead,
                            order.currency || "EUR"
                          )}
                        </span>
                      </div>
                    )}

                  {order.appliedPricePaywall !== null &&
                    order.appliedPricePaywall !== undefined && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Prix Paywall
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            order.appliedPricePaywall,
                            order.currency || "EUR"
                          )}
                        </span>
                      </div>
                    )}

                  {order.appliedPriceEpilogue !== null &&
                    order.appliedPriceEpilogue !== undefined && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Prix Épilogue
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            order.appliedPriceEpilogue,
                            order.currency || "EUR"
                          )}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column - User Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <MdPerson className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Client</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-base font-medium text-gray-900">
                    {order.user.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">ID Utilisateur</p>
                  <p className="text-sm font-mono text-gray-900">
                    {order.user.publicId}
                  </p>
                </div>

                <Link
                  to={`/users/${order.user.id}`}
                  className="block w-full mt-4 px-4 py-2 bg-indigo-600 text-white text-center font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  aria-label={`Voir le profil de ${order.user.email}`}>
                  Voir le profil
                </Link>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <MdCalendarToday className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Chronologie
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  <div className="relative flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center z-10">
                      <MdShoppingCart className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-gray-900">
                        Commande créée
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {order.status === "PAID" && (
                    <div className="relative flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center z-10">
                        <MdCheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-gray-900">
                          Paiement confirmé
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === "FAILED" && (
                    <div className="relative flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center z-10">
                        <MdCancel className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-gray-900">
                          Paiement échoué
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === "PENDING" && (
                    <div className="relative flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center z-10">
                        <MdPending className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-gray-900">
                          En attente de paiement
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Commande en cours de traitement
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Management Section */}
        <div className="mt-6">
          <RefundManagement
            orderId={order.id}
            orderAmount={order.amountTotal || 0}
            orderCurrency={order.currency || "EUR"}
            orderStatus={order.status}
            onRefundCreated={loadOrder}
          />
        </div>
      </article>
    </main>
  );
}
