import { Link } from "react-router-dom";
import type { Chapter } from "../../stores/catalogStore";
import ChapterCover from "../common/ChapterCover";
import ReviewStars from "../common/ReviewStars";
import ChapterIntensityIndicators from "../common/ChapterIntensityIndicators";
import { getReadingTime } from "../../lib/functions";

interface ChapterGridViewProps {
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

export default function ChapterGridView({
  chapter,
  top3 = false,
  index,
}: ChapterGridViewProps) {
  const isTop3 = top3 && index !== undefined && index < 3;
  return (
    <Link
      to={`/chapters/${chapter.id}`}
      className={`${
        isTop3 ? `border-4 ${getRankingStyles(index).border}` : "border dark:border-white/30"
      }  dark:bg-white/5 p-3 rounded-2xl group`}>
      <div className="aspect-[3/4] !text-md overflow-hidden rounded-lg mb-3 relative ">
        {isTop3 && getRankingStyles(index) && (
          <div
            className={`absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg bg-gradient-to-br ${getRankingStyles(index)?.border} ${getRankingStyles(index)?.gradient}`}>
            <span className={`${getRankingStyles(index)?.text} font-display font-bold text-sm`}>
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
            textSize="auto"
            showTitleOverlay={true}
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
        {/* <div className="absolute inset-0 bg-gradient-to-t from-boudoir-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" /> */}
      </div>

      <div className="flex flex-col justify-center min-w-0 flex-1">
        <h4 className="font-serif text-sm text-charcoal dark:text-white/70 dark:text-white/70 group-hover:text-gold transition-colors line-clamp-2 mb-2">
          {chapter.title}
        </h4>
        <ReviewStars
          chapterId={chapter.id}
          size="sm"
          showCount={false}
        />
        <p className="text-sm text-gray-500 flex items-center gap-2 italic mt-1">
          <span className="material-symbols-outlined text-xs">schedule</span>
          {chapter.totalCharacterCount
            ? `${getReadingTime(chapter.totalCharacterCount)} min de lecture`
            : " "}
        </p>

        {chapter && (
          <ChapterIntensityIndicators
            chapter={chapter}
            variant="compact"
          />
        )}
      </div>
    </Link>
  );
}
