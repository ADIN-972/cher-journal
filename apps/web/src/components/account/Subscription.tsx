export default function Subscription() {
  const subscriptionPlan = {
    name: 'Premium',
    price: 999,
    period: 'mois',
    nextBilling: '2024-02-15',
    features: [
      'Accès à tous les chapitres',
      'Nouveautés en avant-première',
      'Sans publicité',
      'Téléchargement pour lecture hors-ligne',
    ],
  };

  const formatPrice = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Abonnement
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Gérez votre abonnement et vos avantages.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-[#c5a059]/10 to-[#c5a059]/5 dark:from-[#2d1620]/60 dark:to-[#2d1620]/40 rounded-2xl border border-[#c5a059]/30 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-[#c5a059] text-3xl">
                    workspace_premium
                  </span>
                  <h3 className="text-2xl font-display italic text-charcoal dark:text-white">
                    Plan {subscriptionPlan.name}
                  </h3>
                </div>
                <p className="text-charcoal dark:text-white/70">
                  Abonnement actif
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#c5a059]">
                  {formatPrice(subscriptionPlan.price)}
                </p>
                <p className="text-sm text-charcoal dark:text-white/70">
                  par {subscriptionPlan.period}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {subscriptionPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-lg">
                    check_circle
                  </span>
                  <span className="text-charcoal dark:text-white/70">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-charcoal dark:text-white/70 mb-6">
              <span className="material-symbols-outlined text-base">
                calendar_today
              </span>
              <span>
                Prochain renouvellement le{' '}
                {new Date(subscriptionPlan.nextBilling).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-white dark:bg-boudoir-900/50 border border-boudoir-300 dark:border-boudoir-800 text-charcoal dark:text-white py-3 rounded-xl font-medium hover:border-[#c5a059] transition-all">
                Modifier le plan
              </button>
              <button className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 py-3 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-all">
                Résilier
              </button>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
            <h3 className="text-xl font-display italic text-charcoal dark:text-white mb-4">
              Historique de facturation
            </h3>
            <div className="space-y-3">
              {[
                { date: '2024-01-15', amount: 999, status: 'Payé' },
                { date: '2023-12-15', amount: 999, status: 'Payé' },
                { date: '2023-11-15', amount: 999, status: 'Payé' },
              ].map((invoice, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-boudoir-300 dark:border-boudoir-800 last:border-0"
                >
                  <div>
                    <p className="text-charcoal dark:text-white font-medium">
                      {new Date(invoice.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {invoice.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-charcoal dark:text-white font-bold">
                      {formatPrice(invoice.amount)}
                    </p>
                    <button className="text-xs text-[#c5a059] hover:underline">
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Other Plans */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
            <h3 className="text-lg font-display italic text-charcoal dark:text-white mb-4">
              Autres plans
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-boudoir-300 dark:border-boudoir-800">
                <h4 className="font-bold text-charcoal dark:text-white mb-1">
                  Basique
                </h4>
                <p className="text-2xl font-bold text-[#c5a059] mb-2">4,99 €</p>
                <p className="text-xs text-charcoal dark:text-white/70">
                  Accès limité au catalogue
                </p>
              </div>
              <div className="p-4 rounded-xl border-2 border-[#c5a059] bg-[#c5a059]/5">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-charcoal dark:text-white">
                    Premium Plus
                  </h4>
                  <span className="text-xs bg-[#c5a059] text-white px-2 py-0.5 rounded-full">
                    Nouveau
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#c5a059] mb-2">19,99 €</p>
                <p className="text-xs text-charcoal dark:text-white/70">
                  Tous les avantages + contenu exclusif
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
