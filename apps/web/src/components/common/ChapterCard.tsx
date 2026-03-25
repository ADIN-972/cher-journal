import ChapterCover from "./ChapterCover";
import { getGenreTranslation } from "../../lib/genreTranslations";
import { GENRES } from "../../pages/Catalogue";

interface ChapterCardProps {
  imageUrl?: string;
  title: string;
  badge: string;
  badgeColor?: string;
  subtitle: string;
  description: string;
  genres?: Array<{ genre: string }>;
  onClick?: () => void;
  fallbackImageIndex?: number;
  hasStartedReading?: boolean;
  isFavorite?: boolean;
  protagonistName?: string;
  isPrivate?: boolean;
}

const DEFAULT_FALLBACK_IMAGES = [
  "1507003211169-0a1dd7228f2d",
  "1518531933037-91b2f5f229cc",
  "1544457070-4cd773b4d71e",
];

export default function ChapterCard({
  imageUrl,
  title,
  badge,
  badgeColor = "text-gold",
  subtitle,
  description,
  genres = [],
  onClick,
  fallbackImageIndex = 0,
  hasStartedReading = false,
  isFavorite = false,
  protagonistName,
  isPrivate = false
}: ChapterCardProps) {
  const fallbackImage =
    DEFAULT_FALLBACK_IMAGES[
      fallbackImageIndex % DEFAULT_FALLBACK_IMAGES.length
    ];

  return (
    <div
      className="grid grid-cols-[120px_1fr] md:grid-cols-[200px_1fr] h-full md:flex md:flex-col gap-4 group cursor-pointer py-10 bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 border-y shadow-md dark:shadow-boudoir-950/50 p-4 rounded-xl border border-boudoir-200/50 dark:border-boudoir-800/50 hover:border-gold/30 dark:hover:border-gold/50 transition-all"
      onClick={onClick}>
      {/* Thumbnail */}
      <div className="aspect-[3/4] shrink-0 rounded-lg overflow-hidden relative  shadow-sm">
        {imageUrl ? (
          <ChapterCover
            imageUrl={imageUrl}
            title={protagonistName || title}
            showPremiumBadge={false}
            showLimitedEditionBadge={false}
            hasGrayscaleEffect={true}
            textSize="auto"
            isAccesClub={isPrivate}
            //showBookmarkIcon={hasStartedReading}
            // showFavoriteIcon={isFavorite}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-${fallbackImage}?w=200&q=80')`,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="grid w-full grid-rows-[auto_1fr] p-3">
        <p
          className={`grid w-full items-center justify-center text-center badge text-xl ${badgeColor} mb-0.5`}>
          {badge}
        </p>
        <h5 className=" grid w-full text-[calc(10%+6vw)] leading-5 md:leading-[calc(10%+3vw)] md:text-[calc(10%+4vw)] mt-5 text-charcoal dark:text-white group-hover:text-gold dark:group-hover:text-gold transition-colors mb-1  handwriting items-center justify-center text-center">
          {title}
        </h5>
      </div>
      <div className="text-[calc(10%+4vw)] md:text-[calc(10%+1vw)] col-span-2 text-charcoal dark:text-white/70  font-light leading-relaxed   mb-2 italic text-justify">
        {description}
      </div>

      {/* Genre tags */}
      {genres.length > 0 && (
        <div className="flex gap-1 w-full flex-wrap mt-3 col-span-2 items-center justify-center">
          {genres.map((genreTag, idx) => {
            const genreData = GENRES[genreTag.genre as keyof typeof GENRES];
            const icon = genreData?.icon;
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-gold/10 dark:bg-boudoir-800 border border-gold/30 dark:border-gold text-gold text-[14px] px-2 py-0.5 rounded-full font-semibold">
                {icon && (
                  <span className="material-symbols-outlined text-[12px]">
                    {icon}
                  </span>
                )}
                {getGenreTranslation(genreTag.genre)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
