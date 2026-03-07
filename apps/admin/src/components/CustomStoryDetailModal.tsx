import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import {
  MdClose,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdCamera,
  MdPerson,
  MdEmail,
  MdCategory,
  MdVolumeUp,
} from 'react-icons/md';

interface CustomStoryDetailModalProps {
  story: any;
  isOpen: boolean;
  onClose: () => void;
  onActionSuccess: () => void;
}

type ModalAction = 'view' | 'approve' | 'reject' | 'mark-review';

export default function CustomStoryDetailModal({
  story,
  isOpen,
  onClose,
  onActionSuccess,
}: CustomStoryDetailModalProps) {
  const [action, setAction] = useState<ModalAction>('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.post(`/admin/custom-stories/${story.id}/approve`);
      toast.success('Demande approuvée avec succès');
      onActionSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'approbation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez entrer une raison de rejet');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/admin/custom-stories/${story.id}/reject`, {
        reason: rejectionReason,
        notes: rejectionNotes,
      });
      toast.success('Demande rejetée');
      onActionSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du rejet');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUnderReview = async () => {
    setLoading(true);
    try {
      await api.post(`/admin/custom-stories/${story.id}/under-review`);
      toast.success('Demande marquée comme en examen');
      onActionSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600';
      case 'UNDER_REVIEW':
        return 'text-blue-600';
      case 'APPROVED':
        return 'text-green-600';
      case 'REJECTED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'UNDER_REVIEW':
        return 'En examen';
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold">{story.protagonistName}</h2>
            <p className="text-indigo-100 text-sm mt-1">
              Demande de création personnalisée
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    story.status === "APPROVED"
                      ? "bg-green-500"
                      : story.status === "REJECTED"
                        ? "bg-red-500"
                        : story.status === "UNDER_REVIEW"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                  }`}></div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Statut
                  </p>
                  <p
                    className={`text-lg font-semibold ${getStatusColor(story.status)}`}>
                    {getStatusLabel(story.status)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Soumis le
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(story.submittedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <MdPerson className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Utilisateur
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {story.user.firstName} {story.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {story.user.username || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <MdEmail className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white break-all">
                    {story.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Story Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MdCategory className="w-5 h-5" />
              Paramètres de l'histoire
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genres
                </p>
                <div className="flex flex-wrap gap-2">
                  {story.selectedGenres.map((genre: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau d'explicité
                </p>
                <p className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
                  {story.explicitLevel}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fin imaginée
                </p>
                <p className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium inline-block">
                  {story.storyEnding}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photos
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {story.photoAssetIds.length} photo
                  {story.photoAssetIds.length !== 1 ? "s" : ""} uploadée
                  {story.photoAssetIds.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Emotional Levels */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Niveaux Émotionnels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Intensité", value: story.niveauIntensitee },
                { label: "Douceur", value: story.niveauDouceur },
                { label: "Danger", value: story.niveauDanger },
                { label: "Transformation", value: story.niveauTransformation },
              ].map((level, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {level.label}
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div
                          key={dot}
                          className={`w-2 h-2 rounded-full ${
                            dot <= level.value
                              ? "bg-red-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Description & Personnalité
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {story.description}
              </p>
            </div>
          </div>

          {/* Volume Proposals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MdVolumeUp className="w-5 h-5" />
              Propositions pour les 10 Volumes
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {story.volumeProposals?.map((vol: any, idx: number) => (
                <details
                  key={idx}
                  className="group border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                  <summary className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between font-medium text-gray-900 dark:text-white">
                    <span>Volume {vol.volumeNumber}</span>
                    <span className="group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="px-4 py-3 space-y-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lieu / Région
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {vol.proposedLocation || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Événement clé
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {vol.proposedOrientation || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Twist / Surprise
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {vol.proposedTwist || "-"}
                      </p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Rejection Info (if rejected) */}
          {story.status === "REJECTED" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Raison du rejet
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                {story.rejectionReason}
              </p>
              {story.rejectionNotes && (
                <>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 mt-2">
                    Notes additionnelles
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap">
                    {story.rejectionNotes}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Action Section */}
          {action === "view" && story.status === "PENDING" && (
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setAction("mark-review")}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <MdPending className="w-4 h-4" />
                Marquer en examen
              </button>
              <button
                onClick={() => setAction("approve")}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <MdCheckCircle className="w-4 h-4" />
                Approuver
              </button>
              <button
                onClick={() => setAction("reject")}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <MdCancel className="w-4 h-4" />
                Rejeter
              </button>
            </div>
          )}

          {action === "approve" && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-4 pt-6 border-t">
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  Êtes-vous sûr d'approuver cette demande ?
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  L'utilisateur sera notifié et sa demande sera marquée comme
                  approuvée.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {loading ? "Traitement..." : "Confirmer l'approbation"}
                </button>
                <button
                  onClick={() => setAction("view")}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}

          {action === "reject" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-4 pt-6 border-t">
              <div>
                <label className="block text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                  Raison du rejet *
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Contenu inapproprié, Doublons existants, etc."
                  className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                  Notes additionnelles (optionnel)
                </label>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Détails supplémentaires pour l'utilisateur..."
                  rows={3}
                  className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                  {loading ? "Traitement..." : "Confirmer le rejet"}
                </button>
                <button
                  onClick={() => {
                    setAction("view");
                    setRejectionReason("");
                    setRejectionNotes("");
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}

          {action === "mark-review" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4 pt-6 border-t">
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Marquer comme en examen ?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Cette demande sera passée au statut "En examen" et retirée de
                  la liste des demandes en attente.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleMarkUnderReview}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? "Traitement..." : "Confirmer"}
                </button>
                <button
                  onClick={() => setAction("view")}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
