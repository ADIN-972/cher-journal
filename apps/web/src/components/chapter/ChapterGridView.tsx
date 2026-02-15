import { Link } from "react-router-dom";
import type { Chapter } from "../../stores/catalogStore";
import ChapterCover from "../common/ChapterCover";
import ReviewStars from "../common/ReviewStars";
import ChapterIntensityIndicators from "../common/ChapterIntensityIndicators";
import { getReadingTime } from "../../lib/functions";

interface ChapterGridViewProps {
  chapter: Chapter;
}

export default function ChapterGridView({ chapter }: ChapterGridViewProps) {
  return (
    <Link
      to={`/chapters/${chapter.id}`}
      className="dark:border-white/30 dark:bg-white/5 border p-3 rounded-md group">
      <div className="aspect-[3/4] !text-md overflow-hidden rounded-lg mb-3 relative bg-gradient-to-br from-boudoir-800 to-boudoir-900">
        {chapter.coverAsset?.url ? (
          <ChapterCover
            imageUrl={`${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`}
            title={chapter.protagonistName || chapter.title}
            showPremiumBadge={false}
            showLimitedEditionBadge={false}
            textSize="md"
            showTitleOverlay={true}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
            style={{
              backgroundImage: `url('assets/images/404_bg.png')`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-boudoir-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      <div className="flex flex-col justify-center min-w-0 flex-1">
        <h4 className="font-serif text-sm text-charcoal dark:text-white/70 dark:text-white/70 group-hover:text-gold transition-colors line-clamp-2 mb-2">
          {chapter.title}
        </h4>
        <ReviewStars chapterId={chapter.id} size="sm" showCount={false} />
        <p className="text-sm text-gray-500 flex items-center gap-2 italic mt-1">
          <span className="material-symbols-outlined text-xs">schedule</span>
          {chapter.totalCharacterCount
            ? `${getReadingTime(chapter.totalCharacterCount)} min de lecture`
            : " "}
        </p>

        {chapter && (
          <ChapterIntensityIndicators chapter={chapter} variant="compact" />
        )}
      </div>
    </Link>
  );
}
