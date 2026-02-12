import ChapterCover from "./ChapterCover";

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
}: ChapterCardProps) {
  const fallbackImage =
    DEFAULT_FALLBACK_IMAGES[
      fallbackImageIndex % DEFAULT_FALLBACK_IMAGES.length
    ];

  return (
    <div
      className="grid grid-cols-[150px_1fr] md:flex md:flex-col gap-4 group cursor-pointer py-10 bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 border-y shadow-md dark:shadow-boudoir-950/50 p-4 rounded-xl border border-boudoir-200/50 dark:border-boudoir-800/50 hover:border-gold/30 dark:hover:border-gold/50 transition-all"
      onClick={onClick}>
      {/* Thumbnail */}
      <div className="aspect-[3/4] shrink-0 rounded-lg overflow-hidden relative bg-gradient-to-br from-boudoir-200 to-boudoir-300 dark:from-boudoir-800 dark:to-boudoir-900 shadow-sm">
        {imageUrl ? (
          <ChapterCover
            imageUrl={imageUrl}
            title={title}
            showPremiumBadge={false}
            showLimitedEditionBadge={false}
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
      <div className="flex flex-col justify-center min-w-0 flex-1 p-3">
        <p className={`badge text-xl ${badgeColor} mb-0.5`}>{badge}</p>
        <h5 className="text-4xl mt-5 text-charcoal dark:text-white group-hover:text-gold dark:group-hover:text-gold transition-colors mb-1 truncate handwriting p-3">
          {subtitle}
        </h5>
      </div>
      <div className="flex col-span-2">
        <p className="texte-lg md:text-xs text-charcoal dark:text-white/70 line-clamp-2 font-light leading-relaxed mb-2 italic ">
          {description}
        </p>

        {/* Genre tags */}
        {genres.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-3">
            {genres.slice(0, 2).map((genreTag, idx) => (
              <span
                key={idx}
                className="inline-block items-center justify-center text-center bg-gold/10 dark:bg-boudoir-800 border border-gold/30 dark:border-gold text-gold text-[10px] uppercase px-2 py-0.5 rounded-md font-semibold">
                {genreTag.genre.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
