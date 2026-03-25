import ChapterCover from "./common/ChapterCover";
import BookStore from "./common/BookStore";
import { Chapter } from "../stores/catalogStore";

interface ChapterHeaderProps {
  currentChapter: Chapter;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  isPurchasing: boolean;
  readButtonText: string;
  onUnlock: () => void;
  getReadingTime: (charCount: number) => number;
}

export default function ChapterHeader({
  currentChapter,
  imageUrl,
  rating,
  reviewCount,
  isPurchasing,
  readButtonText,
  onUnlock,
  getReadingTime,
}: ChapterHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
      {/* Cover Image */}
      <div className="relative md:col-span-4 lg:w-[300px] xl:w-[400px] aspect-[3/4]">
        <ChapterCover
          imageUrl={imageUrl}
          title={currentChapter.protagonistName}
          isAccesClub={currentChapter.isPrivate}
        />
        <div className="absolute top-[5%] -left-[10%] w-[130%] h-auto z-0">
          <BookStore />
        </div>
      </div>

      {/* Details Section */}
      <div className="md:col-span-8 flex flex-col justify-center">
        {/* Rating and Reading Time */}
        <div className="flex gap-4 mb-4">
          <span className="flex items-center gap-1 text-accent-gold text-sm font-semibold italic">
            <span className="material-symbols-outlined text-sm gold-fill">
              star
            </span>
            {rating} ({reviewCount} avis)
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-sm text-gray-400">
            Temps de lecture :{" "}
            {getReadingTime(currentChapter.totalCharacterCount || 0)} min
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-umber dark:text-white text-5xl lg:text-7xl font-medium mb-6 leading-tight italic"
          style={{ fontFamily: "newsreader, serif" }}>
          {currentChapter.title}
        </h1>

        {/* Description */}
        <div className="space-y-6 max-w-2xl">
          {currentChapter.accroche_classic && (
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed italic newsreader">
              {currentChapter.accroche_classic}
            </p>
          )}
          {currentChapter.accroche_love && (
            <p className="text-base text-gray-500 dark:text-gray-400 newsreader">
              {currentChapter.accroche_love}
            </p>
          )}
        </div>

        {/* Actions and Pricing */}
        {!currentChapter.isPrivate && (
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <button
              onClick={onUnlock}
              disabled={isPurchasing}
              className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-transform active:scale-95 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">
                {isPurchasing
                  ? "hourglass_empty"
                  : currentChapter.hasAccess
                    ? "auto_stories"
                    : "shopping_cart"}
              </span>
              {isPurchasing
                ? "Chargement..."
                : currentChapter.hasAccess
                  ? readButtonText
                  : "Débloquer l'aventure"}
            </button>

            {!currentChapter.hasAccess &&
              currentChapter.pricing?.bundleDiscountedPrice ? (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                    Prix de l'œuvre
                  </span>
                  <span className="text-2xl font-display font-bold">
                    {(
                      currentChapter.pricing.bundleDiscountedPrice / 100
                    ).toFixed(2)}{" "}
                    €
                  </span>
                </div>
              ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
