import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

interface SupportClaim {
  id: string;
  userId: string;
  category: 'TECHNICAL' | 'BILLING' | 'CONTENT' | 'OTHER';
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNote?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    publicId: string;
  };
  messages?: SupportMessage[];
}

interface SupportMessage {
  id: string;
  claimId: string;
  authorId: string;
  role: 'USER' | 'ADMIN';
  content: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  OPEN: { label: 'Ouvert', badgeClass: 'bg-red-50 text-red-700', dotClass: 'bg-red-500 animate-pulse' },
  IN_PROGRESS: { label: 'En cours', badgeClass: 'bg-amber-50 text-amber-700', dotClass: 'bg-amber-500' },
  RESOLVED: { label: 'Résolu', badgeClass: 'bg-blue-50 text-blue-700', dotClass: 'bg-blue-500' },
  CLOSED: { label: 'Fermé', badgeClass: 'bg-green-50 text-green-700', dotClass: 'bg-green-600' },
};

const CATEGORY_ICONS: Record<string, { icon: string; label: string }> = {
  TECHNICAL: { icon: 'build', label: 'Technique' },
  BILLING: { icon: 'payments', label: 'Facturation' },
  CONTENT: { icon: 'library_books', label: 'Contenu' },
  OTHER: { icon: 'help', label: 'Autre' },
};

export default function SupportClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<SupportClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>('OPEN');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClaim();
  }, [id]);

  const loadClaim = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: SupportClaim }>(
        `/admin/support-claims/${id}`
      );
      setClaim(response.data);
      setNewStatus(response.data.status);
      setAdminNote('');
    } catch (err) {
      console.error('Failed to load support claim:', err);
      toast.error('Erreur lors du chargement de la réclamation');
      navigate('/support-claims');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!claim) return;
    try {
      setSubmitting(true);
      await api.patch(`/admin/support-claims/${claim.id}`, { status: newStatus });
      toast.success('Statut mis à jour');
      loadClaim();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async () => {
    if (!claim || !adminNote.trim()) {
      toast.error('Veuillez entrer une réponse');
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/admin/support-claims/${claim.id}/respond`, { adminNote });
      toast.success('Réponse envoyée');
      setAdminNote('');
      loadClaim();
    } catch (err) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!claim) return;
    try {
      setSubmitting(true);
      await api.patch(`/admin/support-claims/${claim.id}`, { status: 'RESOLVED' });
      toast.success('Ticket résolu');
      loadClaim();
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400">Réclamation non trouvée</p>
      </div>
    );
  }

  const status = STATUS_CONFIG[claim.status] || STATUS_CONFIG.OPEN;
  const cat = CATEGORY_ICONS[claim.category] || CATEGORY_ICONS.OTHER;

  return (
    <div className="p-8 h-[calc(100vh-5rem)] overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex items-end justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/support-claims')}
              className="text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-amber-700 mb-1 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Support
            </button>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
              <span className="opacity-50 font-light">#{claim.id.slice(0, 8)}</span>
              <span className="italic">"{claim.subject}"</span>
            </h1>
          </div>
          <div className="flex gap-3">
            {/* Status selector */}
            <select
              aria-label="Changer le statut"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-4 py-2.5 rounded-full border border-gray-200 text-xs font-semibold uppercase tracking-wider focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
            >
              <option value="OPEN">Ouvert</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="RESOLVED">Résolu</option>
              <option value="CLOSED">Fermé</option>
            </select>
            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={submitting || newStatus === claim.status}
              className="px-6 py-2.5 rounded-full border border-amber-200 text-amber-700 text-[10px] tracking-widest uppercase font-bold hover:bg-amber-50 transition-colors disabled:opacity-40"
            >
              Mettre à jour
            </button>
            <button
              type="button"
              onClick={handleResolve}
              disabled={submitting || claim.status === 'RESOLVED' || claim.status === 'CLOSED'}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] tracking-widest uppercase font-bold shadow-xl shadow-amber-600/10 hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Résoudre le ticket
            </button>
          </div>
        </div>

        {/* Main Content: 2 columns */}
        <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
          {/* Left Column: Conversation */}
          <div className="col-span-8 flex flex-col bg-gray-50 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-3">
              {(claim.messages && claim.messages.length > 0) ? (
                claim.messages.map((msg) => {
                  const isAdmin = msg.role === 'ADMIN';
                  const time = new Date(msg.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

                  return isAdmin ? (
                    <div key={msg.id} className="flex flex-col items-end ml-auto max-w-[85%]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] text-gray-300">{time} •</span>
                        <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Admin</span>
                      </div>
                      <div className="bg-amber-50 p-2 rounded-lg rounded-tr-none shadow-md border border-amber-100">
                        <p className="text-lg leading-relaxed italic text-amber-900 whitespace-pre-line">"{msg.content}"</p>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex flex-col items-start max-w-[85%]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                          {claim.user?.firstName} {claim.user?.lastName}
                        </span>
                        <span className="text-[10px] text-gray-300">• {time}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg rounded-tl-none border-l-2 border-amber-300 shadow-sm">
                        <p className="text-lg leading-relaxed italic text-gray-600 whitespace-pre-line">"{msg.content}"</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback: legacy single message + adminNote */
                <>
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        {claim.user?.firstName} {claim.user?.lastName}
                      </span>
                      <span className="text-[10px] text-gray-300">
                        • {new Date(claim.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl rounded-tl-none border-l-2 border-amber-300 shadow-sm">
                      <p className="text-lg leading-relaxed italic text-gray-600">"{claim.message}"</p>
                    </div>
                  </div>
                  {claim.adminNote && (
                    <div className="flex flex-col items-end ml-auto max-w-[85%]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] text-gray-300">
                          {claim.respondedAt && new Date(claim.respondedAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {' '}•
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Admin</span>
                      </div>
                      <div className="bg-amber-50 p-6 rounded-2xl rounded-tr-none shadow-md border border-amber-100">
                        <p className="text-lg leading-relaxed italic text-amber-900">"{claim.adminNote}"</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Reply Editor */}
            <div className="p-6 bg-white/60 border-t border-gray-100">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-inner">
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 italic text-lg text-gray-600 resize-none h-24 placeholder:opacity-30 outline-none"
                  placeholder={`Répondre à ${claim.user?.firstName}...`}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
                <div className="flex justify-end items-center mt-2">
                  <button
                    type="button"
                    onClick={handleRespond}
                    disabled={submitting || !adminNote.trim()}
                    className="flex items-center gap-2 px-8 py-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] tracking-[0.2em] uppercase font-bold hover:shadow-lg transition-all disabled:opacity-40"
                  >
                    Envoyer
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="col-span-4 space-y-6 overflow-y-auto pr-2">
            {/* Metadata Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">Métadonnées</h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Statut</span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.badgeClass}`}>
                    <span className={`w-2 h-2 rounded-full ${status.dotClass}`}></span>
                    {status.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Catégorie</span>
                  <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                    {cat.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Créé le</span>
                  <span className="text-xs text-gray-700">
                    {new Date(claim.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Mis à jour</span>
                  <span className="text-xs text-gray-700">
                    {new Date(claim.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Reader Info Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">Profil Lectrice</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-xl border-2 border-amber-200">
                  {(claim.user?.firstName?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold italic text-gray-900 leading-tight">
                    {claim.user?.firstName} {claim.user?.lastName}
                  </h4>
                  <p className="text-[10px] uppercase text-gray-400 tracking-wider">
                    ID: {claim.user?.publicId?.slice(0, 12)}
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="material-symbols-outlined text-lg opacity-40">mail</span>
                  {claim.user?.email}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">
                Historique ({(claim.messages?.length || 0)} messages)
              </h3>
              <div className="space-y-5 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
                {/* Ticket created */}
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-amber-300 border-2 border-white shadow-sm"></div>
                  <p className="text-[11px] font-medium text-gray-700">Ticket créé</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(claim.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Message events from conversation */}
                {claim.messages?.slice(1).map((msg) => (
                  <div key={msg.id} className="relative pl-8">
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      msg.role === 'ADMIN' ? 'bg-amber-500' : 'bg-gray-300'
                    }`}></div>
                    <p className="text-[11px] font-medium text-gray-700">
                      {msg.role === 'ADMIN' ? 'Réponse admin' : 'Message client'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}

                {/* Status events */}
                {(claim.status === 'RESOLVED' || claim.status === 'CLOSED') && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                    <p className="text-[11px] font-medium text-gray-700">
                      Ticket {claim.status === 'RESOLVED' ? 'résolu' : 'fermé'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(claim.updatedAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
