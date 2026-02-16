import { Link } from "react-router-dom";
import type { Chapter } from "../../stores/catalogStore";
import ChapterCover from "../common/ChapterCover";
import ReviewStars from "../common/ReviewStars";
import { getReadingTime } from "../../lib/functions";

interface ChapterListViewProps {
  chapter: Chapter;
  top3?: boolean;
  index?: number;
}

const getRankingStyles = (index: number) => {
  const styles = {
    0: {
      border: "border-[#D4AF37]/50",
      gradient: "from-[#D4AF37] via-[#FBF5B7] to-[#8B5E3C]",
      text: "text-[#645113]",
      label: "Or",
    },
    1: {
      border: "border-stone-300/50",
      gradient: "from-[#C0C0C0] via-[#F5F5F5] to-[#7A7A7A]",
      text: "text-[#696767]",
      label: "Argent",
    },
    2: {
      border: "border-[#CD7F32]/50",
      gradient: "from-[#CD7F32] via-[#E6BE8A] to-[#633517]",
      text: "text-[#7c4b19]",
      label: "Bronze",
    },
  };
  return styles[index as keyof typeof styles] || null;
};

export default function ChapterListView({
  chapter,
  top3 = false,
  index,
}: ChapterListViewProps) {
  const isTop3 = top3 && index !== undefined && index < 3;
  return (
    <Link
      to={`/chapters/${chapter.id}`}
      className={`${
        isTop3
          ? `border-4 ${getRankingStyles(index).border}`
          : "border dark:border-white/30"
      } dark:bg-white/5  p-3 rounded-md flex gap-4 group`}>
      <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden relative bg-gradient-to-br from-boudoir-800 to-boudoir-900">
        {top3 &&
          index !== undefined &&
          index < 3 &&
          getRankingStyles(index) && (
            <div
              className={`absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg bg-gradient-to-br ${getRankingStyles(index)?.border} ${getRankingStyles(index)?.gradient}`}>
              <span
                className={`font-display font-bold text-sm ${getRankingStyles(index)?.text}`}>
                {index + 1}
              </span>
            </div>
          )}
        {chapter.coverAsset?.url ? (
          <ChapterCover
            imageUrl={`${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`}
            title={chapter.protagonistName || chapter.title}
            showPremiumBadge={false}
            showLimitedEditionBadge={false}
            textSize="md"
            showTitleOverlay={false}
            hasGrayscaleEffect={!isTop3 && top3}
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
        <ReviewStars
          chapterId={chapter.id}
          size="sm"
        />
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
