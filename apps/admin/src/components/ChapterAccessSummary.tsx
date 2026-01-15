import { MdBook, MdVisibility, MdLock, MdCheckCircle, MdExpandMore, MdExpandLess } from "react-icons/md";
import { useState } from "react";

interface Entitlement {
  id: string;
  chapterId: string;
  volumeFrom: number;
  volumeTo: number;
  versionScope: string; // BASE | ALL
  source: string; // PURCHASE, PREORDER, PACK, SUBSCRIPTION
  grantedAt: string;
  chapter: {
    id: string;
    title: string;
    status: string;
  };
}

interface VolumeRead {
  id: string;
  chapterId: string;
  volumeNumber: number;
  firstOpenedAt: string;
  completedAt: string | null;
  chapter: {
    id: string;
    title: string;
  };
}

interface ChapterAccessSummaryProps {
  entitlements: Entitlement[];
  reads: VolumeRead[];
  locale?: string;
}

export default function ChapterAccessSummary({
  entitlements,
  reads,
  locale = 'fr',
}: ChapterAccessSummaryProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  // Get source badge
  const getSourceBadge = (source: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      PURCHASE: { label: 'Achat', color: 'bg-blue-100 text-blue-700' },
      PREORDER: { label: 'Précommande', color: 'bg-orange-100 text-orange-700' },
      PACK: { label: 'Pack', color: 'bg-purple-100 text-purple-700' },
      SUBSCRIPTION: { label: 'Abonnement', color: 'bg-green-100 text-green-700' },
    };

    const badge = badges[source] || { label: source, color: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`px-2 py-1 ${badge.color} text-xs font-medium rounded-full`}>
        {badge.label}
      </span>
    );
  };

  // Check if volume is paid
  const isVolumePaid = (volumeNumber: number, chapterId: string): boolean => {
    const entitlement = entitlements.find((e) => e.chapterId === chapterId);
    if (!entitlement) return false;
    return volumeNumber >= entitlement.volumeFrom && volumeNumber <= entitlement.volumeTo;
  };

  // Group by chapter
  const chapterMap = new Map<string, {
    entitlement: Entitlement | null;
    reads: VolumeRead[];
  }>();

  // Add entitlements
  entitlements.forEach((e) => {
    chapterMap.set(e.chapterId, {
      entitlement: e,
      reads: reads.filter((r) => r.chapterId === e.chapterId),
    });
  });

  // Add chapters with reads but no entitlement
  reads.forEach((r) => {
    if (!chapterMap.has(r.chapterId)) {
      chapterMap.set(r.chapterId, {
        entitlement: null,
        reads: reads.filter((read) => read.chapterId === r.chapterId),
      });
    }
  });

  const chapters = Array.from(chapterMap.entries());

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MdBook size={48} className="mx-auto mb-2 opacity-50" />
        <p>Aucun accès à des chapitres</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chapters.map(([chapterId, data]) => {
        const { entitlement, reads: chapterReads } = data;
        const isExpanded = expandedChapters.has(chapterId);

        // Get chapter title from entitlement or first read
        const chapterTitle = entitlement?.chapter.title || chapterReads[0]?.chapter.title || 'Chapitre sans titre';

        return (
          <div key={chapterId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <button
              onClick={() => toggleChapter(chapterId)}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <MdBook className="text-blue-500" size={24} />
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-900">{chapterTitle}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {entitlement ? (
                      <>
                        <span className="text-sm text-gray-600">
                          Volumes {entitlement.volumeFrom}-{entitlement.volumeTo}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600">
                          {entitlement.versionScope === 'ALL' ? 'Narrateur + Protagoniste' : 'Narrateur'}
                        </span>
                        <span className="text-gray-300">•</span>
                        {getSourceBadge(entitlement.source)}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Aucun accès payé</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats + Expand Icon */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {chapterReads.length} volume{chapterReads.length > 1 ? 's' : ''} lu{chapterReads.length > 1 ? 's' : ''}
                  </div>
                </div>
                {isExpanded ? (
                  <MdExpandLess size={24} className="text-gray-400" />
                ) : (
                  <MdExpandMore size={24} className="text-gray-400" />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {/* Entitlement Details */}
                {entitlement && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MdCheckCircle className="text-blue-600" size={18} />
                      <span className="font-medium text-blue-900">Accès Payé</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700">Volumes:</span>
                        <span className="ml-2 font-medium text-blue-900">
                          {entitlement.volumeFrom}-{entitlement.volumeTo}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">Perspectives:</span>
                        <span className="ml-2 font-medium text-blue-900">
                          {entitlement.versionScope === 'ALL' ? '👁️👁️' : '👁️'}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">Source:</span>
                        <span className="ml-2 font-medium text-blue-900">
                          {entitlement.source}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">Obtenu le:</span>
                        <span className="ml-2 font-medium text-blue-900">
                          {formatDate(entitlement.grantedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reading History */}
                <div className="space-y-2 mt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Historique de lecture</h4>
                  {chapterReads.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucune lecture enregistrée</p>
                  ) : (
                    chapterReads.map((read) => {
                      const isPaid = isVolumePaid(read.volumeNumber, chapterId);
                      return (
                        <div
                          key={read.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900">
                              Volume {read.volumeNumber}
                            </span>
                            {isPaid ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                <MdCheckCircle size={12} />
                                Payé
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                                <MdLock size={12} />
                                Gratuit
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              Ouvert: {formatDate(read.firstOpenedAt)}
                            </div>
                            {read.completedAt && (
                              <div className="text-xs text-gray-400">
                                Terminé: {formatDate(read.completedAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
