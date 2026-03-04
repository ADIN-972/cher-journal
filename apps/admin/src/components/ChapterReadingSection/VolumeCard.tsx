import React, { useMemo } from 'react';

interface VolumeRead {
  id: string;
  chapterId: string;
  volumeNumber: number;
  perspective: 'NARRATOR' | 'PROTAGONIST';
  progress: number;
  firstOpenedAt: string;
  completedAt: string | null;
}

interface VolumeCardProps {
  volume: VolumeRead;
  locale?: string;
}

export const VolumeCard: React.FC<VolumeCardProps> = ({
  volume,
  locale = 'en-US'
}) => {
  // Memoized computed values
  const perspectiveBadgeColor = useMemo(() => {
    return volume.perspective === 'NARRATOR'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';
  }, [volume.perspective]);

  const perspectiveLabel = useMemo(() => {
    return volume.perspective === 'NARRATOR'
      ? '📖 Narrateur'
      : '🔓 Protagoniste';
  }, [volume.perspective]);

  const progressBarColor = useMemo(() => {
    return volume.perspective === 'NARRATOR' ? 'bg-blue-500' : 'bg-purple-500';
  }, [volume.perspective]);

  const openedDate = useMemo(() => {
    return new Date(volume.firstOpenedAt).toLocaleDateString(locale);
  }, [volume.firstOpenedAt, locale]);

  const completedDate = useMemo(() => {
    if (!volume.completedAt) return null;
    return new Date(volume.completedAt).toLocaleDateString(locale);
  }, [volume.completedAt, locale]);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-600 bg-gray-300">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-gray-700">
            Vol. {volume.volumeNumber}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${perspectiveBadgeColor}`}>
            {perspectiveLabel}
          </span>
          <span className="text-xs text-gray-500 ml-auto">
            Ouvert {openedDate}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${progressBarColor}`}
              style={{ width: `${volume.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">
            {volume.progress}%
          </span>
        </div>
        {completedDate && (
          <div className="text-xs text-green-600 mt-1">
            ✓ Complété {completedDate}
          </div>
        )}
      </div>
    </div>
  );
};
