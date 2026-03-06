import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  MdDelete,
  MdPending,
  MdCheckCircle,
  MdCancel,
  MdCalendarToday,
  MdCategory,
  MdArrowForward,
} from 'react-icons/md';

interface CustomStory {
  id: string;
  protagonistName: string;
  description: string;
  selectedGenres: string[];
  explicitLevel: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  rejectionReason?: string;
  photoAssetIds: string[];
}

export default function CustomStoryRequests() {
  const [stories, setStories] = useState<CustomStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<CustomStory | null>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/custom-stories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load custom stories');
      }

      const data = await response.json();
      setStories(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (storyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;

    try {
      const response = await fetch(`/api/custom-stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel story');
      }

      toast.success('Demande annulée');
      loadStories();
      setSelectedStory(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'annulation');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: MdPending,
        label: 'En attente',
      },
      UNDER_REVIEW: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: MdPending,
        label: 'En examen',
      },
      APPROVED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: MdCheckCircle,
        label: 'Approuvé',
      },
      REJECTED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: MdCancel,
        label: 'Rejeté',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aucune demande
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Vous n'avez pas encore soumis de demandes de création d'histoire
          personnalisée.
        </p>
        <a
          href="/create-story"
          className="inline-block px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
        >
          Créer une demande
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mes Demandes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Suivez l'état de vos demandes de création d'histoires personnalisées
          </p>
        </div>
        <a
          href="/create-story"
          className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Nouvelle demande
        </a>
      </div>

      <div className="space-y-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700 transition-colors overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {story.protagonistName}
                    </h3>
                    {getStatusBadge(story.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {story.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Genres
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {story.selectedGenres.slice(0, 2).map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                    {story.selectedGenres.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        +{story.selectedGenres.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Explicité
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium text-sm mt-1">
                    {story.explicitLevel}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Photos
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium text-sm mt-1">
                    {story.photoAssetIds.length}/10
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Date
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium text-sm mt-1 flex items-center gap-1">
                    <MdCalendarToday className="w-3 h-3" />
                    {formatDate(story.submittedAt)}
                  </p>
                </div>
              </div>

              {story.status === 'REJECTED' && story.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm">
                  <p className="font-semibold text-red-800 dark:text-red-300 mb-1">
                    Raison du rejet
                  </p>
                  <p className="text-red-700 dark:text-red-400">
                    {story.rejectionReason}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setSelectedStory(
                      selectedStory?.id === story.id ? null : story
                    )
                  }
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                >
                  Détails
                  <MdArrowForward className="w-4 h-4" />
                </button>

                {story.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(story.id)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2 text-sm"
                  >
                    <MdDelete className="w-4 h-4" />
                    Annuler
                  </button>
                )}
              </div>
            </div>

            {selectedStory?.id === story.id && (
              <div className="bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Détails complets
                </h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                      Description
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {story.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                      Genres sélectionnés
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {story.selectedGenres.map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 rounded-full text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {story.status === 'APPROVED' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-green-800 dark:text-green-300">
                        ✨ Félicitations ! Votre demande a été approuvée. Un
                        auteur travaille actuellement à la création de votre
                        histoire personnalisée.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
