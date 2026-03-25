import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  respondedAt?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const CATEGORY_CONFIG: Record<string, { label: string; class: string }> = {
  TECHNICAL: { label: 'Technique', class: 'bg-blue-50 text-blue-700 border border-blue-100' },
  BILLING: { label: 'Facturation', class: 'bg-amber-50 text-amber-700 border border-amber-100' },
  CONTENT: { label: 'Contenu', class: 'bg-purple-50 text-purple-700 border border-purple-100' },
  OTHER: { label: 'Autre', class: 'bg-gray-50 text-gray-600 border border-gray-200' },
};

const STATUS_CONFIG: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  OPEN: { label: 'Ouvert', dotClass: 'bg-red-500', badgeClass: 'bg-red-50 text-red-700' },
  IN_PROGRESS: { label: 'En cours', dotClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700' },
  RESOLVED: { label: 'Résolu', dotClass: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700' },
  CLOSED: { label: 'Fermé', dotClass: 'bg-green-600', badgeClass: 'bg-green-50 text-green-700' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function SupportClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<SupportClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: SupportClaim[] }>('/admin/support-claims');
      setClaims(response.data);
    } catch (err) {
      console.error('Failed to load support claims:', err);
      toast.error('Erreur lors du chargement des réclamations');
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.subject.toLowerCase().includes(q) ||
        c.user?.email.toLowerCase().includes(q) ||
        c.user?.firstName.toLowerCase().includes(q) ||
        c.user?.lastName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    });

  const countByStatus = (status: string) => claims.filter(c => c.status === status).length;
  const resolutionRate = claims.length > 0
    ? Math.round(((countByStatus('RESOLVED') + countByStatus('CLOSED')) / claims.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-8 px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-gray-900 italic">
            Assistance & Réclamations
          </h1>
          <p className="text-gray-500 text-lg">
            Gérez les demandes de support de vos lectrices
          </p>
        </div>
        <button
          onClick={loadClaims}
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined">refresh</span>
          Actualiser
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Total Tickets</p>
              <h3 className="text-3xl font-bold text-gray-900">{claims.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <span className="material-symbols-outlined text-amber-700">confirmation_number</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">En attente</p>
              <h3 className="text-3xl font-bold text-gray-900">{countByStatus('OPEN')}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <span className="material-symbols-outlined text-red-600">pending_actions</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">En cours</p>
              <h3 className="text-3xl font-bold text-gray-900">{countByStatus('IN_PROGRESS')}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <span className="material-symbols-outlined text-amber-600">hourglass_top</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Résolus</p>
              <h3 className="text-3xl font-bold text-gray-900">{countByStatus('RESOLVED') + countByStatus('CLOSED')}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <span className="material-symbols-outlined text-green-700">task_alt</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-400">
            <span className="text-green-600 font-bold">{resolutionRate}%</span>
            <span className="ml-1">taux de résolution</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100/30 px-8 py-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="font-bold text-2xl text-gray-900">Réclamations Récentes</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 scale-75">search</span>
              <input
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all outline-none"
                placeholder="Rechercher un ticket..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filter === s
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {s === 'all' ? 'Tous' : STATUS_CONFIG[s]?.label}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 transition-all ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                title="Vue liste"
              >
                <span className="material-symbols-outlined text-sm">view_list</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-2 transition-all ${viewMode === 'cards' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                title="Vue cartes"
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
              </button>
            </div>
          </div>
      </div>

      {/* Claims Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100/30 overflow-hidden">
        {/* Content */}
        {filteredClaims.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4 block">support_agent</span>
            <p className="text-gray-400">Aucune réclamation trouvée</p>
          </div>
        ) : viewMode === 'list' ? (
          /* ─── List View ─── */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-8 py-4">Ticket</th>
                  <th className="px-8 py-4">Lectrice</th>
                  <th className="px-8 py-4">Sujet</th>
                  <th className="px-8 py-4">Catégorie</th>
                  <th className="px-8 py-4">Statut</th>
                  <th className="px-8 py-4">Activité</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClaims.map((claim) => {
                  const cat = CATEGORY_CONFIG[claim.category] || CATEGORY_CONFIG.OTHER;
                  const status = STATUS_CONFIG[claim.status] || STATUS_CONFIG.OPEN;
                  return (
                    <tr
                      key={claim.id}
                      className="hover:bg-amber-50/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/support-claims/${claim.id}`)}
                    >
                      <td className="px-8 py-6 font-bold text-sm text-amber-700">
                        #{claim.id.slice(0, 8)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs">
                            {(claim.user?.firstName?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 text-sm">
                              {claim.user?.firstName} {claim.user?.lastName}
                            </span>
                            <div className="text-xs text-gray-400">{claim.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-[200px] truncate font-medium text-sm text-gray-700">{claim.subject}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-tight font-bold ${cat.class}`}>{cat.label}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold italic w-fit ${status.badgeClass}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`}></span>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs space-y-0.5">
                          <div className="text-gray-700">{new Date(claim.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                          <div className="text-gray-400 italic">{timeAgo(claim.createdAt)}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/support-claims/${claim.id}`); }} className="p-2 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all" title="Voir">
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/support-claims/${claim.id}`); }} className="p-2 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all" title="Répondre">
                            <span className="material-symbols-outlined">chat_bubble</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ─── Cards View ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-8">
            {filteredClaims.map((claim) => {
              const cat = CATEGORY_CONFIG[claim.category] || CATEGORY_CONFIG.OTHER;
              const status = STATUS_CONFIG[claim.status] || STATUS_CONFIG.OPEN;
              return (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/support-claims/${claim.id}`)}
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${
                    claim.status === 'OPEN' ? 'from-red-400/60' :
                    claim.status === 'IN_PROGRESS' ? 'from-amber-400/60' :
                    claim.status === 'RESOLVED' ? 'from-blue-400/60' :
                    'from-green-400/60'
                  } to-transparent`}></div>

                  {/* Header: user + status */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                        {(claim.user?.firstName?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">
                          {claim.user?.firstName} {claim.user?.lastName}
                        </h4>
                        <p className="text-[10px] uppercase tracking-tight text-gray-400">
                          #{claim.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${status.badgeClass}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Subject + message preview */}
                  <h5 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-amber-700 transition-colors">
                    {claim.subject}
                  </h5>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                    {claim.message}
                  </p>

                  {/* Category badge */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-tight font-bold ${cat.class}`}>
                      {cat.label}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {timeAgo(claim.createdAt)}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate(`/support-claims/${claim.id}`); }}
                      className="text-amber-700 font-bold uppercase tracking-widest hover:underline"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer with count */}
        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Affichage de {filteredClaims.length} sur {claims.length} tickets
          </p>
        </div>
      </div>
    </div>
  );
}
