import { Link } from "react-router-dom";
import type { Chapter } from "../../stores/catalogStore";
import ChapterCover from "../common/ChapterCover";
import ReviewStars from "../common/ReviewStars";
import { getReadingTime } from "../../lib/functions";

interface ChapterListViewProps {
  chapter: Chapter;
}

export default function ChapterListView({ chapter }: ChapterListViewProps) {
  return (
    <Link
      to={`/chapters/${chapter.id}`}
      className="dark:border-white/30 dark:bg-white/5 border p-3 rounded-md flex gap-4 group">
      <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden relative bg-gradient-to-br from-boudoir-800 to-boudoir-900">
        {chapter.coverAsset?.url ? (
          <ChapterCover
            imageUrl={`${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`}
            title={chapter.protagonistName || chapter.title}
            showPremiumBadge={false}
            showLimitedEditionBadge={false}
            textSize="md"
            showTitleOverlay={false}
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
        <p className="font-script text-2xl text-gold mb-1">
          {chapter.protagonistName || "Récit"}
        </p>
        <h5 className="font-semibold text-charcoal dark:text-white/70 dark:text-white group-hover:text-gold transition-colors mb-2 line-clamp-1">
          {chapter.title}
        </h5>
        <ReviewStars chapterId={chapter.id} size="sm" />
        <p className="text-xs text-charcoal dark:text-white/70 line-clamp-2 font-light leading-relaxed mt-2">
          {chapter.accroche_love || chapter.accroche_classic}
        </p>
        <p className="text-xs text-gray-500 flex items-center gap-2 italic mt-1">
          <span className="material-symbols-outlined text-xs">schedule</span>
          {chapter.totalCharacterCount
            ? `${getReadingTime(chapter.totalCharacterCount)} min de lecture`
            : " "}
        </p>
      </div>
    </Link>
  );
}
