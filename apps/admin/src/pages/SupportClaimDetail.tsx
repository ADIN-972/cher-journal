import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import {
  MdArrowBack,
  MdCheckCircle,
  MdHourglassEmpty,
  MdCancel,
  MdDone,
  MdSend,
} from 'react-icons/md';

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
}

export default function SupportClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<SupportClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('OPEN');
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
      setAdminNote(response.data.adminNote || '');
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
      await api.patch<{ success: boolean; data: SupportClaim }>(
        `/admin/support-claims/${claim.id}`,
        { status: newStatus }
      );
      toast.success('Statut mis à jour avec succès');
      loadClaim();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Erreur lors de la mise à jour du statut');
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
      await api.post<{ success: boolean; data: SupportClaim }>(
        `/admin/support-claims/${claim.id}/respond`,
        { adminNote }
      );
      toast.success('Réponse envoyée avec succès');
      setAdminNote('');
      loadClaim();
    } catch (err) {
      console.error('Failed to respond:', err);
      toast.error('Erreur lors de l\'envoi de la réponse');
    } finally {
      setSubmitting(false);
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

  if (!claim) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Réclamation non trouvée</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/support-claims')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <MdArrowBack />
        Retour à la liste
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{claim.subject}</h1>
            <div className="flex items-center gap-3">
              {getStatusBadge(claim.status)}
              <span className="text-gray-500">{getCategoryLabel(claim.category)}</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Utilisateur</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium text-gray-900">{claim.user?.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Nom</div>
              <div className="font-medium text-gray-900">
                {claim.user?.firstName} {claim.user?.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ID Public</div>
              <div className="font-medium text-gray-900 font-mono text-xs">
                {claim.user?.publicId.slice(0, 12)}...
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Date de création</div>
              <div className="font-medium text-gray-900">
                {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Message</h3>
        <div className="bg-gray-50 rounded p-4 text-gray-700 whitespace-pre-wrap">
          {claim.message}
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Changer le statut</h3>
        <div className="flex items-center gap-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="OPEN">Ouvert</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolu</option>
            <option value="CLOSED">Fermé</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={submitting || newStatus === claim.status}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            Mettre à jour
          </button>
        </div>
      </div>

      {/* Admin Note */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Réponse</h3>

        {claim.adminNote && (
          <div className="mb-6 pb-6 border-b">
            <div className="text-sm text-gray-500 mb-2">Note existante :</div>
            <div className="bg-blue-50 rounded p-4 text-gray-700">
              {claim.adminNote}
            </div>
            {claim.respondedAt && (
              <div className="text-xs text-gray-500 mt-2">
                Répondu le {new Date(claim.respondedAt).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        )}

        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Entrez votre réponse ou note..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={handleRespond}
          disabled={submitting || !adminNote.trim()}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
        >
          <MdSend />
          Envoyer la réponse
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 text-center">
        <p>ID: {claim.id}</p>
        <p>Dernière modification: {new Date(claim.updatedAt).toLocaleString('fr-FR')}</p>
      </div>
    </div>
  );
}
