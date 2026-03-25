import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface SupportMessage {
  id: string;
  role: 'USER' | 'ADMIN';
  content: string;
  createdAt: string;
}

interface SupportClaim {
  id: string;
  category: 'TECHNICAL' | 'BILLING' | 'CONTENT' | 'OTHER';
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNote?: string;
  respondedAt?: string;
  createdAt: string;
  messages?: SupportMessage[];
}

export default function MySupportClaims() {
  const [claims, setClaims] = useState<SupportClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<SupportClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async (preserveSelection = false) => {
    try {
      setLoading(true);
      const data = await api.getUserSupportClaims();
      setClaims(data);
      if (!preserveSelection) {
        if (data.length > 0) {
          loadClaimMessages(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load support claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClaimMessages = async (claim: SupportClaim) => {
    try {
      const response = await api.request(`/support/claims/${claim.id}/messages`) as any;
      const full = response.data || response;
      setSelectedClaim({ ...claim, messages: full.messages || [] });
    } catch {
      // Fallback: use claim without messages
      setSelectedClaim(claim);
    }
  };

  const handleSelectClaim = (claim: SupportClaim) => {
    setReplyText('');
    loadClaimMessages(claim);
  };

  const handleSendReply = async () => {
    if (!selectedClaim || !replyText.trim()) return;
    setSending(true);
    try {
      await api.request(`/support/claims/${selectedClaim.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: replyText.trim() }),
      });
      setReplyText('');
      // Reload messages for this claim, refresh list but keep selection
      loadClaimMessages(selectedClaim);
      loadClaims(true);
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      TECHNICAL: 'Technique',
      BILLING: 'Facturation',
      CONTENT: 'Contenu',
      OTHER: 'Autre',
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      OPEN: { label: 'Ouvert', class: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' },
      IN_PROGRESS: { label: 'En cours', class: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
      RESOLVED: { label: 'Résolu', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
      CLOSED: { label: 'Fermé', class: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
    };
    const c = config[status] || config.OPEN;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.class}`}>
        {c.label}
      </span>
    );
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div>
      </div>
    );
  }

  const messages = selectedClaim?.messages || [];
  const isClosed = selectedClaim?.status === 'CLOSED';

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Mes Réclamations
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
          {/* Claims List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-300 dark:border-[#c5a059]/30 overflow-hidden">
              <div className="p-4 border-b border-boudoir-300 dark:border-[#c5a059]/30">
                <h3 className="font-semibold text-charcoal dark:text-white">
                  Vos réclamations ({claims.length})
                </h3>
              </div>
              <div className="divide-y divide-boudoir-300 dark:divide-[#c5a059]/30 max-h-[500px] overflow-y-auto">
                {claims.map((claim) => (
                  <button
                    key={claim.id}
                    type="button"
                    onClick={() => handleSelectClaim(claim)}
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
                      {getStatusBadge(claim.status)}
                    </div>
                    <div className="text-xs text-charcoal/50 dark:text-white/50 mt-2">
                      {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="lg:col-span-2">
            {selectedClaim ? (
              <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-300 dark:border-[#c5a059]/30 flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-6 border-b border-boudoir-300 dark:border-[#c5a059]/30">
                  <div className="flex items-start justify-between">
                    <div>
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

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${
                          msg.role === 'ADMIN'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl rounded-tr-none'
                            : 'bg-boudoir-50 dark:bg-[#2d1620]/40 border border-boudoir-200 dark:border-boudoir-800 rounded-2xl rounded-tl-none'
                        } p-4`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              msg.role === 'ADMIN' ? 'text-blue-600 dark:text-blue-400' : 'text-[#c5a059]'
                            }`}>
                              {msg.role === 'ADMIN' ? 'Support' : 'Vous'}
                            </span>
                            <span className="text-[10px] text-charcoal/40 dark:text-white/30">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-charcoal dark:text-white/70 whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Legacy fallback */
                    <>
                      <div className="flex justify-start">
                        <div className="max-w-[80%] bg-boudoir-50 dark:bg-[#2d1620]/40 rounded-2xl rounded-tl-none p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] mb-2">Vous</div>
                          <p className="text-sm text-charcoal dark:text-white/70 whitespace-pre-wrap">{selectedClaim.message}</p>
                        </div>
                      </div>
                      {selectedClaim.adminNote && (
                        <div className="flex justify-end">
                          <div className="max-w-[80%] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl rounded-tr-none p-4">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Support</div>
                            <p className="text-sm text-charcoal dark:text-white/70 whitespace-pre-wrap">{selectedClaim.adminNote}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Reply input */}
                {!isClosed && (
                  <div className="p-4 border-t border-boudoir-300 dark:border-[#c5a059]/30">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                        placeholder="Écrire un message..."
                        className="flex-1 px-4 py-3 rounded-xl border border-boudoir-300 dark:border-boudoir-800 bg-white dark:bg-boudoir-900/30 text-charcoal dark:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#c5a059] transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleSendReply}
                        disabled={sending || !replyText.trim()}
                        className="px-6 py-3 bg-[#c5a059] hover:bg-[#b8935a] disabled:bg-boudoir-500 text-white rounded-xl font-bold transition-all disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">send</span>
                        {sending ? '...' : 'Envoyer'}
                      </button>
                    </div>
                    {selectedClaim.status === 'RESOLVED' && (
                      <p className="text-xs text-charcoal/50 dark:text-white/40 mt-2 italic">
                        Ce ticket est résolu. Envoyer un message le réouvrira automatiquement.
                      </p>
                    )}
                  </div>
                )}

                {isClosed && (
                  <div className="p-4 border-t border-boudoir-300 dark:border-[#c5a059]/30 text-center">
                    <p className="text-xs text-charcoal/50 dark:text-white/40 italic">
                      Ce ticket est fermé. Créez un nouveau ticket si besoin.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
