import { useState, useEffect } from 'react';

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
    // TODO: Fetch purchases from API
    setTimeout(() => {
      setPurchases([
        {
          id: '1',
          date: '2024-01-15',
          itemTitle: 'Chapitre 1 - Nuit de Soie',
          amount: 299,
          status: 'completed',
        },
        {
          id: '2',
          date: '2024-01-10',
          itemTitle: 'Volume complet - Le Secret du Boudoir',
          amount: 1999,
          status: 'completed',
        },
      ]);
      setIsLoading(false);
    }, 500);
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
        <div className="space-y-4">
          {purchases.map((purchase) => (
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
      )}
    </div>
  );
}
