import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface Purchase {
  id: string;
  date: string;
  itemTitle: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
}

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const data = await api.getUserOrders();
        setPurchases(data);
      } catch (error) {
        console.error('Failed to load purchases:', error);
        setPurchases([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchases();
  }, []);

  const formatPrice = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  const getStatusBadge = (status: Purchase['status']) => {
    const styles = {
      completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      refunded: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    };

    const labels = {
      completed: 'Complété',
      pending: 'En attente',
      refunded: 'Remboursé',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Filter only completed (paid) purchases
  const paidPurchases = purchases.filter((p) => p.status === 'completed');

  // Sort purchases by date (most recent first)
  const sortedPurchases = [...paidPurchases].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group purchases by month
  const groupedByMonth = sortedPurchases.reduce((acc, purchase) => {
    const date = new Date(purchase.date);
    const monthKey = date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(purchase);
    return acc;
  }, {} as Record<string, Purchase[]>);

  // Get sorted month keys (most recent first)
  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
    const dateA = new Date(groupedByMonth[a][0].date);
    const dateB = new Date(groupedByMonth[b][0].date);
    return dateB.getTime() - dateA.getTime();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Historique des Achats
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Consultez l'historique complet de vos transactions.
      </p>

      {purchases.length === 0 ? (
        <div className="bg-gradient-to-br from-boudoir-50 to-boudoir-100 dark:from-[#2d1620]/60 dark:to-[#2d1620]/40 rounded-2xl border border-boudoir-300 dark:border-[#c5a059]/30 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-[#c5a059]/30 mb-4">
            shopping_bag
          </span>
          <p className="text-charcoal dark:text-white/70 italic">
            Aucun achat pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map((monthKey) => (
            <div key={monthKey}>
              {/* Month Header */}
              <div className="mb-4 pb-3 border-b-2 border-boudoir-300 dark:border-[#c5a059]/30">
                <h3 className="text-xl font-display italic text-[#c5a059] capitalize">
                  {monthKey}
                </h3>
              </div>

              {/* Purchases for this month */}
              <div className="space-y-4">
                {groupedByMonth[monthKey].map((purchase) => (
                  <div
                    key={purchase.id}
                    className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-300 dark:border-[#c5a059]/30 p-6 hover:border-[#c5a059] dark:hover:border-[#c5a059]/70 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="material-symbols-outlined text-[#c5a059]">
                            receipt_long
                          </span>
                          <h3 className="text-lg font-display italic text-charcoal dark:text-white">
                            {purchase.itemTitle}
                          </h3>
                        </div>
                        <p className="text-sm text-charcoal dark:text-white/70 mb-3">
                          {new Date(purchase.date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {getStatusBadge(purchase.status)}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#c5a059]">
                          {formatPrice(purchase.amount)}
                        </p>
                        <button type="button" className="mt-2 text-sm text-charcoal dark:text-white/70 hover:text-[#c5a059] dark:hover:text-[#c5a059] transition-colors font-medium">
                          Voir le reçu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
