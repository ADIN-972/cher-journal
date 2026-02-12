import {
  MdShoppingCart,
  MdCardGiftcard,
  MdBook,
  MdVisibility,
  MdAttachMoney,
  MdLocalOffer,
  MdCheckCircle,
  MdCancel,
  MdHourglassEmpty
} from "react-icons/md";

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
}

interface Entitlement {
  id: string;
  chapterId: string;
  volumeFrom: number;
  volumeTo: number;
  versionScope: string; // BASE | ALL
  source: string; // PURCHASE, PREORDER, PACK, SUBSCRIPTION
  grantedAt: string;
  chapter: {
    id: string;
    title: string;
    status: string;
  };
}

interface PurchaseTimelineProps {
  orders: Order[];
  entitlements: Entitlement[];
  locale?: string;
}

export default function PurchaseTimeline({ orders, entitlements, locale = 'fr' }: PurchaseTimelineProps) {

  // Format amount
  const formatAmount = (amount: number, currency: string = 'EUR') => {
    return (amount / 100).toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    });
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get icon for order type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CHAPTER':
        return <MdBook className="text-blue-500" size={20} />;
      case 'VERSION_PACK':
        return <MdVisibility className="text-purple-500" size={20} />;
      case 'COLORING':
        return <MdCardGiftcard className="text-pink-500" size={20} />;
      case 'BUNDLE':
        return <MdShoppingCart className="text-green-500" size={20} />;
      case 'PREORDER':
        return <MdHourglassEmpty className="text-orange-500" size={20} />;
      default:
        return <MdShoppingCart className="text-gray-500" size={20} />;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CHAPTER: 'Chapitre',
      VERSION_PACK: 'Pack Perspectives',
      COLORING: 'Cahier de Coloriage',
      BUNDLE: 'Bundle',
      PREORDER: 'Précommande',
    };
    return labels[type] || type;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <MdCheckCircle size={14} />
            Payé
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            <MdHourglassEmpty size={14} />
            En attente
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <MdCancel size={14} />
            Remboursé
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  };

  // Get entitlement info for this order
  const getEntitlementInfo = (order: Order) => {
    // Find entitlement granted around the same time (within 10 seconds)
    const orderDate = new Date(order.createdAt).getTime();
    const entitlement = entitlements.find(e => {
      const grantedDate = new Date(e.grantedAt).getTime();
      return Math.abs(grantedDate - orderDate) < 10000; // 10 seconds
    });

    if (!entitlement) {
      // Fallback: use order's embedded chapter info
      if (order.chapter && order.volumeFrom && order.volumeTo) {
        return {
          chapter: order.chapter.title,
          volumes: `Volumes ${order.volumeFrom}-${order.volumeTo}`,
          perspective: 'BASE',
        };
      }
      return null;
    }

    return {
      chapter: entitlement.chapter.title,
      volumes: `Volumes ${entitlement.volumeFrom}-${entitlement.volumeTo}`,
      perspective: entitlement.versionScope,
    };
  };

  // Get description for order
  const getOrderDescription = (order: Order) => {
    const info = getEntitlementInfo(order);

    if (!info) {
      return "Achat sans détails";
    }

    const parts = [info.chapter];

    if (order.type === 'VERSION_PACK') {
      parts.push(`(${info.perspective === 'ALL' ? 'Narrateur + Protagoniste' : 'Narrateur'})`);
    } else {
      parts.push(`(${info.volumes})`);
    }

    return parts.join(' ');
  };

  // Sort orders by date (most recent first)
  const sortedOrders = [...orders].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MdShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
          <p>Aucun achat effectué</p>
        </div>
      ) : (
        sortedOrders.map((order) => {
          const entitlementInfo = getEntitlementInfo(order);

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getTypeIcon(order.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {getTypeLabel(order.type)}
                      </span>
                      {getStatusBadge(order.status)}
                      {order.appliedPromotionId && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          <MdLocalOffer size={12} />
                          Promo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {getOrderDescription(order)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-gray-900">
                    {formatAmount(order.amountTotal, order.currency || 'EUR')}
                  </div>
                  {order.provider && (
                    <div className="text-xs text-gray-400 mt-1">
                      via {order.provider}
                    </div>
                  )}
                </div>
              </div>

              {/* Entitlement Details */}
              {entitlementInfo && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Chapitre:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {entitlementInfo.chapter}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Volumes:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {entitlementInfo.volumes}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Perspectives:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {entitlementInfo.perspective === 'ALL'
                          ? '👁️ Narrateur + Protagoniste'
                          : '👁️ Narrateur uniquement'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order ID for debugging */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-mono">
                  ID: {order.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
