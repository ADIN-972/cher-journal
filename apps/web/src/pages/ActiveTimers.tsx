import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import WaitTimer from '../components/WaitTimer';
import { NotificationService } from '../lib/notifications';

interface Wait {
  chapterId: string;
  chapterTitle: string;
  volumeNumber: number;
  unlocksAt: string;
  remainingMs?: number;
  completedAt?: string;
  isCompleted?: boolean;
}

type TabType = 'active' | 'completed' | 'all';

export default function ActiveTimers() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [waits, setWaits] = useState<Wait[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWaits = async (tab: TabType) => {
    try {
      setIsLoading(true);
      setError(null);
      let response;

      if (tab === 'active') {
        response = await api.getActiveWaits();
      } else if (tab === 'completed') {
        response = await api.getCompletedWaits();
      } else {
        response = await api.getAllWaits();
      }

      setWaits(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch waits:', err);
      setError('Impossible de charger vos timers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaits(activeTab);
  }, [activeTab]);

  // Request notification permission on mount
  useEffect(() => {
    NotificationService.requestPermission();
  }, []);

  const handleTimerComplete = () => {
    // Refresh the list when a timer completes
    fetchWaits(activeTab);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-pink-200/70">Chargement de vos timers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent mb-2">
          Mes Timers
        </h1>
        <p className="text-pink-200/70">
          {waits.length} timer{waits.length !== 1 ? 's' : ''} {activeTab === 'active' ? 'actif' : activeTab === 'completed' ? 'terminé' : 'au total'}{waits.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('active')}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
            activeTab === 'active'
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 scale-105'
              : 'bg-purple-500/20 text-pink-200 hover:bg-purple-500/30 border border-purple-400/20'
          }`}
        >
          Actifs
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('completed')}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 scale-105'
              : 'bg-purple-500/20 text-pink-200 hover:bg-purple-500/30 border border-purple-400/20'
          }`}
        >
          Terminés
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('all')}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 scale-105'
              : 'bg-purple-500/20 text-pink-200 hover:bg-purple-500/30 border border-purple-400/20'
          }`}
        >
          Tous
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {waits.length === 0 && !error && (
        <div className="bg-purple-900/30 border border-purple-400/20 rounded-2xl p-12 text-center backdrop-blur-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-3">
            {activeTab === 'active' ? 'Aucun timer actif' : activeTab === 'completed' ? 'Aucun timer terminé' : 'Aucun timer'}
          </h2>
          <p className="text-pink-200/70 mb-8 max-w-md mx-auto">
            {activeTab === 'active' && "Vous n'avez pas de timer en cours. Lancez un timer \"Attendre pour lire\" sur un chapitre pour débloquer gratuitement les volumes suivants."}
            {activeTab === 'completed' && "Vous n'avez pas encore terminé de timer. Les timers terminés apparaîtront ici."}
            {activeTab === 'all' && "Vous n'avez aucun timer. Commencez à lire pour débloquer des contenus gratuitement."}
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 hover:scale-105"
          >
            Explorer le catalogue
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      )}

      {/* Timers Grid */}
      {waits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {waits.map((wait) => {
            const isComplete = wait.isCompleted || (wait.remainingMs !== undefined && wait.remainingMs <= 0);
            return (
              <Link
                key={`${wait.chapterId}-${wait.volumeNumber}`}
                to={`/chapters/${wait.chapterId}`}
                className="group bg-gradient-to-br from-purple-900/40 to-purple-800/30 border border-purple-400/20 rounded-2xl p-6 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Chapter Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">
                    {wait.chapterTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-pink-200/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm">Volume {wait.volumeNumber}</span>
                  </div>
                </div>

                {/* Timer or Completed Badge */}
                {activeTab === 'completed' || isComplete ? (
                  <div className="bg-emerald-900/30 border border-emerald-400/30 rounded-xl p-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-3">
                        <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-emerald-300 font-medium">
                        Timer terminé
                      </p>
                      <p className="text-xs text-emerald-300/60 mt-1">
                        {new Date(wait.unlocksAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-950/50 border border-purple-400/20 rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-xs text-pink-200/60 mb-2 uppercase tracking-wider">
                        Déblocage dans
                      </p>
                      <WaitTimer
                        remainingMs={wait.remainingMs || 0}
                        onComplete={handleTimerComplete}
                        variant="large"
                        chapterTitle={wait.chapterTitle}
                        volumeNumber={wait.volumeNumber}
                      />
                    </div>
                  </div>
                )}

                {/* View Chapter Link */}
                <div className="mt-4 flex items-center justify-center text-sm text-rose-300/80 group-hover:text-rose-300 transition-colors">
                  <span>Voir le chapitre</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      {waits.length > 0 && activeTab === 'active' && (
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-400/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">À propos des timers</h4>
              <p className="text-pink-200/70 text-sm leading-relaxed">
                Chaque timer vous permet de débloquer gratuitement un volume après un certain temps d'attente. Vous pouvez avoir plusieurs timers actifs en même temps sur différents chapitres.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
