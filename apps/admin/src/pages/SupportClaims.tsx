import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import {
  MdContactSupport,
  MdCheckCircle,
  MdHourglassEmpty,
  MdCancel,
  MdDone,
} from 'react-icons/md';

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

export default function SupportClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<SupportClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('all');

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

  const filteredClaims = filter === 'all' ? claims : claims.filter(c => c.status === filter);

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
      OPEN: 'bg-red-100 text-red-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      RESOLVED: 'bg-blue-100 text-blue-700',
      CLOSED: 'bg-green-100 text-green-700',
    };
    const icons: Record<string, React.ReactNode> = {
      OPEN: <MdCancel className="inline mr-1" />,
      IN_PROGRESS: <MdHourglassEmpty className="inline mr-1" />,
      RESOLVED: <MdCheckCircle className="inline mr-1" />,
      CLOSED: <MdDone className="inline mr-1" />,
    };
    const labels: Record<string, string> = {
      OPEN: 'Ouvert',
      IN_PROGRESS: 'En cours',
      RESOLVED: 'Résolu',
      CLOSED: 'Fermé',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MdContactSupport className="text-3xl text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Claims</h1>
            <p className="text-gray-500">Gérez les réclamations des utilisateurs</p>
          </div>
        </div>
        <button
          onClick={loadClaims}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'all' ? 'Tous' : status === 'OPEN' ? 'Ouverts' : status === 'IN_PROGRESS' ? 'En cours' : status === 'RESOLVED' ? 'Résolus' : 'Fermés'}
            {status !== 'all' && (
              <span className="ml-2 text-xs">
                ({filteredClaims.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredClaims.length === 0 ? (
          <div className="text-center py-12">
            <MdContactSupport className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune réclamation trouvée</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Utilisateur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Catégorie</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sujet</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{claim.user?.email}</div>
                    <div className="text-xs text-gray-500">
                      {claim.user?.firstName} {claim.user?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{getCategoryLabel(claim.category)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{claim.subject}</td>
                  <td className="px-6 py-4 text-sm">{getStatusBadge(claim.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => navigate(`/support-claims/${claim.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Détail →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-red-600">
            {claims.filter(c => c.status === 'OPEN').length}
          </div>
          <div className="text-sm text-gray-500 mt-2">Ouvertes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600">
            {claims.filter(c => c.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-sm text-gray-500 mt-2">En cours</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">
            {claims.filter(c => c.status === 'RESOLVED').length}
          </div>
          <div className="text-sm text-gray-500 mt-2">Résolues</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">
            {claims.filter(c => c.status === 'CLOSED').length}
          </div>
          <div className="text-sm text-gray-500 mt-2">Fermées</div>
        </div>
      </div>
    </div>
  );
}
