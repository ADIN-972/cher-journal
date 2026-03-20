import { Link } from 'react-router-dom';

interface CoverAsset {
  id: string;
  objectKey: string;
  thumbnailObjectKey?: string | null;
  mimeType: string;
}

interface ChapterCardProps {
  id: string;
  title: string;
  protagonistName: string;
  coverAsset?: CoverAsset | null;
  publishedAt?: string;
  volumeCount?: number;
  featured?: boolean;
  isPrivateLocked?: boolean;
}

export default function ChapterCard({
  id,
  title,
  protagonistName,
  coverAsset,
  publishedAt,
  volumeCount,
  featured = false,
  isPrivateLocked = false,
}: ChapterCardProps) {
  const coverImage = coverAsset?.objectKey
    ? `${import.meta.env.VITE_API_URL ?? ""}/uploads/${coverAsset.thumbnailObjectKey || coverAsset.objectKey}`
    : null;

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
      })
    : null;

  return (
    <Link to={`/chapters/${id}`} className="group block">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl transition-all duration-500 ${featured ? 'hover:scale-[1.02]' : 'hover:scale-105'} hover:shadow-2xl hover:shadow-rose-500/20`}>
        {/* Cover Image with Overlay */}
        <div className={`relative ${featured ? 'aspect-[2/3]' : 'aspect-[3/4]'} overflow-hidden`}>
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isPrivateLocked ? 'grayscale opacity-50' : ''}`}
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br from-rose-900/80 via-purple-900/80 to-gray-900 flex items-center justify-center ${isPrivateLocked ? 'grayscale opacity-50' : ''}`}>
              <div className="text-center p-6">
                <div className="text-6xl mb-4 opacity-50">📖</div>
                <p className="text-rose-200/80 font-serif italic text-lg">{title}</p>
              </div>
            </div>
          )}

          {/* Lock Overlay for Private Chapters */}
          {isPrivateLocked && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-white text-6xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                lock
              </span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

          {/* Club Prive Badge */}
          {isPrivateLocked && (
            <div className="absolute top-3 right-3 z-20">
              <span className="bg-purple-600/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                Club Privé
              </span>
            </div>
          )}

          {/* Top Badge */}
          {!isPrivateLocked && volumeCount !== undefined && volumeCount > 0 && (
            <div className="absolute top-3 right-3">
              <span className="bg-rose-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                {volumeCount} tome{volumeCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Content Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            {/* Protagonist Name */}
            <p className="text-rose-400 font-medium text-sm tracking-wider uppercase mb-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              {protagonistName}
            </p>

            {/* Title */}
            <h3 className={`font-serif font-bold text-white leading-tight mb-3 ${featured ? 'text-2xl' : 'text-xl'}`}>
              {title}
            </h3>

            {/* Meta Info */}
            <div className="flex items-center justify-between">
              {formattedDate && (
                <span className="text-gray-400 text-xs">
                  {formattedDate}
                </span>
              )}

              {/* Read Button */}
              <span className="inline-flex items-center gap-2 text-rose-400 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                Découvrir
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Border Glow */}
        <div className="absolute inset-0 rounded-2xl border border-rose-500/0 group-hover:border-rose-500/30 transition-colors duration-500" />
      </div>
    </Link>
  );
}
