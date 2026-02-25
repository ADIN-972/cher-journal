import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface SupportClaim {
  id: string;
  category: 'TECHNICAL' | 'BILLING' | 'CONTENT' | 'OTHER';
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNote?: string;
  respondedAt?: string;
  createdAt: string;
}

export default function MySupportClaims() {
  const [claims, setClaims] = useState<SupportClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<SupportClaim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await api.getUserSupportClaims();
      setClaims(data);
      if (data.length > 0) {
        setSelectedClaim(data[0]);
      }
    } catch (error) {
      console.error('Failed to load support claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      TECHNICAL: '🔧 Technique',
      BILLING: '💳 Facturation',
      CONTENT: '📚 Contenu',
      OTHER: '❓ Autre',
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPEN: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      IN_PROGRESS: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      RESOLVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      CLOSED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    };
    const labels: Record<string, string> = {
      OPEN: 'Ouvert',
      IN_PROGRESS: 'En cours',
      RESOLVED: 'Résolu',
      CLOSED: 'Fermé',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Mes Réclamations Support
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Suivi de vos demandes de support
      </p>

      {claims.length === 0 ? (
        <div className="bg-gradient-to-br from-boudoir-50 to-boudoir-100 dark:from-[#2d1620]/60 dark:to-[#2d1620]/40 rounded-2xl border border-boudoir-300 dark:border-[#c5a059]/30 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-[#c5a059]/30 mb-4">
            support_agent
          </span>
          <p className="text-charcoal dark:text-white/70 italic">
            Vous n'avez pas encore soumis de réclamation
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des réclamations */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-300 dark:border-[#c5a059]/30 overflow-hidden">
              <div className="p-4 border-b border-boudoir-300 dark:border-[#c5a059]/30">
                <h3 className="font-semibold text-charcoal dark:text-white">
                  Vos réclamations ({claims.length})
                </h3>
              </div>
              <div className="divide-y divide-boudoir-300 dark:divide-[#c5a059]/30 max-h-96 overflow-y-auto">
                {claims.map((claim) => (
                  <button
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className={`w-full text-left p-4 transition-all hover:bg-[#c5a059]/5 dark:hover:bg-[#c5a059]/10 ${
                      selectedClaim?.id === claim.id
                        ? 'bg-[#c5a059]/10 dark:bg-[#c5a059]/20 border-l-4 border-[#c5a059]'
                        : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-charcoal dark:text-white mb-1 truncate">
                      {claim.subject}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-charcoal/70 dark:text-white/70">
                        {getCategoryLabel(claim.category)}
                      </span>
                      <div className="text-xs">
                        {getStatusBadge(claim.status)}
                      </div>
                    </div>
                    <div className="text-xs text-charcoal/50 dark:text-white/50 mt-2">
                      {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Détail de la réclamation */}
          <div className="lg:col-span-2">
            {selectedClaim ? (
              <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-300 dark:border-[#c5a059]/30 p-6">
                {/* Header */}
                <div className="mb-6 pb-6 border-b border-boudoir-300 dark:border-[#c5a059]/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-display italic text-[#c5a059] mb-2">
                        {selectedClaim.subject}
                      </h3>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(selectedClaim.status)}
                        <span className="text-sm text-charcoal dark:text-white/70">
                          {getCategoryLabel(selectedClaim.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-charcoal dark:text-white mb-3">
                    Votre message
                  </h4>
                  <div className="bg-boudoir-50 dark:bg-[#2d1620]/40 rounded-xl p-4 text-charcoal dark:text-white/70 text-sm whitespace-pre-wrap">
                    {selectedClaim.message}
                  </div>
                  <div className="text-xs text-charcoal/50 dark:text-white/50 mt-2">
                    Envoyé le {new Date(selectedClaim.createdAt).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(selectedClaim.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Admin Response */}
                {selectedClaim.adminNote && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-900/50">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                      📬 Réponse de notre équipe support
                    </h4>
                    <p className="text-charcoal dark:text-white/70 text-sm whitespace-pre-wrap">
                      {selectedClaim.adminNote}
                    </p>
                    {selectedClaim.respondedAt && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                        Répondu le {new Date(selectedClaim.respondedAt).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(selectedClaim.respondedAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Status Info */}
                <div className="mt-6 pt-6 border-t border-boudoir-300 dark:border-[#c5a059]/30">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-charcoal/70 dark:text-white/70">Statut</span>
                      <div className="mt-1">{getStatusBadge(selectedClaim.status)}</div>
                    </div>
                    <div>
                      <span className="text-charcoal/70 dark:text-white/70">Catégorie</span>
                      <div className="mt-1 font-medium text-charcoal dark:text-white">
                        {getCategoryLabel(selectedClaim.category)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
