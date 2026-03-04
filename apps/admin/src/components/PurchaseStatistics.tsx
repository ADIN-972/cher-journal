import {
  MdAttachMoney,
  MdShoppingCart,
  MdBook,
  MdLocalOffer,
  MdTrendingUp,
  MdCardGiftcard,
} from "react-icons/md";

interface Order {
  id: string;
  type: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
  appliedPromotionId?: string | null;
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

interface PurchaseStatisticsProps {
  orders: Order[];
  entitlements: Entitlement[];
  locale?: string;
}

export default function PurchaseStatistics({
  orders,
  entitlements,
  locale = 'fr',
}: PurchaseStatisticsProps) {
  // Calculate statistics
  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const totalSpent = paidOrders.reduce((sum, o) => sum + o.amountTotal, 0);
  const ordersWithPromo = paidOrders.filter((o) => o.appliedPromotionId).length;
  const uniqueChapters = new Set(entitlements.map((e) => e.chapterId)).size;

  // Count volumes owned
  const totalVolumesOwned = entitlements.reduce(
    (sum, e) => sum + (e.volumeTo - e.volumeFrom + 1),
    0
  );

  // Count perspective upgrades (ALL scope)
  const perspectiveUpgrades = entitlements.filter((e) => e.scopes?.includes('POV')).length;

  // Count subscriptions
  const subscriptions = entitlements.filter((e) => e.source === 'SUBSCRIPTION').length;

  // Count purchases by type
  const ordersByType = paidOrders.reduce((acc, order) => {
    acc[order.type] = (acc[order.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Format amount
  const formatAmount = (amount: number, currency: string = 'EUR') => {
    return (amount / 100).toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    });
  };

  // Average order value
  const averageOrderValue = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

  const stats = [
    {
      label: 'Total Dépensé',
      value: formatAmount(totalSpent),
      icon: <MdAttachMoney size={24} className="text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      label: 'Commandes Payées',
      value: paidOrders.length.toString(),
      icon: <MdShoppingCart size={24} className="text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Chapitres Débloqués',
      value: uniqueChapters.toString(),
      icon: <MdBook size={24} className="text-purple-500" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      label: 'Volumes Possédés',
      value: totalVolumesOwned.toString(),
      icon: <MdBook size={24} className="text-indigo-500" />,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
    },
    {
      label: 'Achats avec Promo',
      value: ordersWithPromo.toString(),
      icon: <MdLocalOffer size={24} className="text-orange-500" />,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      label: 'Panier Moyen',
      value: formatAmount(averageOrderValue),
      icon: <MdTrendingUp size={24} className="text-teal-500" />,
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-4 border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                {stat.icon}
              </div>
            </div>
            <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Purchases by Type */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MdShoppingCart size={20} className="text-gray-600" />
            Achats par Type
          </h3>
          <div className="space-y-2">
            {Object.entries(ordersByType).map(([type, count]) => {
              const typeLabels: Record<string, string> = {
                CHAPTER: 'Chapitres',
                VERSION_PACK: 'Packs Perspectives',
                COLORING: 'Cahiers de Coloriage',
                BUNDLE: 'Bundles',
                PREORDER: 'Précommandes',
              };

              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {typeLabels[type] || type}
                  </span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              );
            })}
            {Object.keys(ordersByType).length === 0 && (
              <p className="text-sm text-gray-500 italic">Aucun achat</p>
            )}
          </div>
        </div>

        {/* Access Summary */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MdCardGiftcard size={20} className="text-gray-600" />
            Résumé des Accès
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Perspectives Débloq.</span>
              <span className="font-semibold text-gray-900">
                {perspectiveUpgrades > 0 ? `${perspectiveUpgrades} 👁️👁️` : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Abonnements Actifs</span>
              <span className="font-semibold text-gray-900">
                {subscriptions > 0 ? `${subscriptions} ✨` : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Achats Uniques</span>
              <span className="font-semibold text-gray-900">
                {entitlements.filter((e) => e.source === 'PURCHASE').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Packs/Bundles</span>
              <span className="font-semibold text-gray-900">
                {entitlements.filter((e) => e.source === 'PACK').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
