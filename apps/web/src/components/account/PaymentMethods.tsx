import { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  cardBrand?: 'visa' | 'mastercard' | 'amex';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string;
}

export default function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      cardBrand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      cardBrand: 'mastercard',
      last4: '5555',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
    },
  ]);

  const [showAddCard, setShowAddCard] = useState(false);

  const getCardIcon = (brand: string) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
    };
    return icons[brand as keyof typeof icons] || '💳';
  };

  const handleSetDefault = (methodId: string) => {
    setMethods(
      methods.map((m) => ({
        ...m,
        isDefault: m.id === methodId,
      }))
    );
  };

  const handleRemove = (methodId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?')) {
      setMethods(methods.filter((m) => m.id !== methodId));
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Moyens de Paiement
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Gérez vos cartes bancaires et moyens de paiement.
      </p>

      {/* Payment Methods List */}
      <div className="space-y-4 mb-6">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`bg-white dark:bg-[#2d1620]/60 rounded-2xl border p-6 ${
              method.isDefault
                ? 'border-[#c5a059]'
                : 'border-boudoir-300 dark:border-boudoir-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`p-3 rounded-xl text-3xl ${
                    method.isDefault
                      ? 'bg-[#c5a059]/10'
                      : 'bg-boudoir-100 dark:bg-boudoir-900'
                  }`}
                >
                  {method.type === 'card'
                    ? getCardIcon(method.cardBrand || '')
                    : '💰'}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-display italic text-charcoal dark:text-white capitalize">
                      {method.type === 'card'
                        ? method.cardBrand
                        : 'PayPal'}
                    </h3>
                    {method.isDefault && (
                      <span className="text-xs bg-[#c5a059] text-white px-2 py-0.5 rounded-full">
                        Par défaut
                      </span>
                    )}
                  </div>

                  {method.type === 'card' ? (
                    <>
                      <p className="text-charcoal dark:text-white font-medium mb-1">
                        •••• •••• •••• {method.last4}
                      </p>
                      <p className="text-sm text-charcoal dark:text-white/70">
                        Expire {method.expiryMonth?.toString().padStart(2, '0')}/
                        {method.expiryYear}
                      </p>
                    </>
                  ) : (
                    <p className="text-charcoal dark:text-white">
                      {method.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-[#c5a059] hover:text-[#b8935a] text-sm font-medium transition-colors"
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  onClick={() => handleRemove(method.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 transition-colors"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Payment Method */}
      {!showAddCard ? (
        <button
          onClick={() => setShowAddCard(true)}
          className="w-full bg-white dark:bg-[#2d1620]/60 border-2 border-dashed border-boudoir-300 dark:border-boudoir-800 hover:border-[#c5a059] rounded-2xl p-6 flex items-center justify-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-[#c5a059]">add</span>
          <span className="text-charcoal dark:text-white font-medium">
            Ajouter un moyen de paiement
          </span>
        </button>
      ) : (
        <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
          <h3 className="text-xl font-display italic text-charcoal dark:text-white mb-6">
            Ajouter une carte
          </h3>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                Numéro de carte
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                  Date d'expiration
                </label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal dark:text-white/70 mb-2">
                Nom sur la carte
              </label>
              <input
                type="text"
                placeholder="JEAN DUPONT"
                className="w-full px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#c5a059] hover:bg-[#b8935a] text-white py-3 rounded-xl font-medium transition-all"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setShowAddCard(false)}
                className="flex-1 bg-boudoir-200 dark:bg-boudoir-800 text-charcoal dark:text-white py-3 rounded-xl font-medium hover:bg-boudoir-300 dark:hover:bg-boudoir-700 transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Info */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
            verified_user
          </span>
          <div>
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
              Paiements sécurisés
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Toutes vos informations de paiement sont cryptées et sécurisées. Nous utilisons Stripe pour traiter les paiements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
