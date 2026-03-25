import { Link } from "react-router-dom";
import type { Chapter } from "../../stores/catalogStore";
import ChapterCover from "../common/ChapterCover";
import ReviewStars from "../common/ReviewStars";
import { getReadingTime } from "../../lib/functions";
import BookStore from "../common/BookStore";
import ChapterIntensityIndicators from "../common/ChapterIntensityIndicators";

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
        "" /*  isTop3
          ? `border-4 ${getRankingStyles(index).border}`
          : "border dark:border-white/30"*/
      }${
        "" //" dark:bg-white/5 "
      } p-3 rounded-md grid grid-cols-[auto_1fr] gap-4 group`}>
      <div className=" shrink-0 rounded-lg  relative ">
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
          /*<ChapterCover
            imageUrl={`${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`}
            title={chapter.protagonistName || chapter.title}
            showPremiumBadge={false}
            showLimitedEditionBadge={false}
            textSize="md"
            showTitleOverlay={false}
            hasGrayscaleEffect={!isTop3 && top3}
          />*/
          <div className=" md:col-span-4 w-[150px] lg:w-[200px]  xl:w-[300px] aspect-[3/4]">
            <ChapterCover
              imageUrl={`${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`}
              title={chapter.protagonistName || chapter.title}
              showPremiumBadge={false}
              showLimitedEditionBadge={false}
              textSize="md"
              showTitleOverlay={true}
              hasGrayscaleEffect={!isTop3 && top3}
              isAccesClub={chapter.isPrivate}
              // showPremiumBadge={true}
              // showLimitedEditionBadge={true}
            />

            <div className="absolute top-[4%] -left-[20px] w-[200px] lg:w-[263px]  xl:w-[390px] h-auto z-0">
              <BookStore />
            </div>
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
            style={{
              backgroundImage: `url('assets/images/404_bg.png')`,
            }}
          />
        )}
      </div>
      <div className="flex flex-col z-[2] md:ml-10">
        <p className="font-script text-4xl text-gold mb-1">
          {chapter.protagonistName || "Récit"}
        </p>
        <h5 className="text-umber dark:text-white text-2xl lg:text-5xl font-medium mb-6 leading-tight italic newsreader mt-6">
          {chapter.title}
        </h5>
        <p className=" hidden md:flex text-xl lg:text-3xl  text-gray-600 dark:text-gray-300 leading-relaxed italic newsreader col-span-2 p-4">
          {chapter.accroche_love || chapter.accroche_classic}
        </p>
        <div className="flex flex-col ml-auto ">
          <ReviewStars
            chapterId={chapter.id}
            size="sm"
          />
          <p className="text-xs text-gray-500 flex items-center gap-2 italic mt-1">
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
      </div>
      <p className="md:hidden text-xl/6 text-gray-600 text-center  dark:text-gray-300 italic newsreader col-span-2 p-4">
        {chapter.accroche_love || chapter.accroche_classic}
      </p>
    </Link>
  );
}
