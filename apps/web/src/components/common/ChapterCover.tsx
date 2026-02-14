interface ChapterCoverProps {
  imageUrl?: string | null;
  title: string;
  showPremiumBadge?: boolean;
  showLimitedEditionBadge?: boolean;
  className?: string;
  textSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  showBookmarkIcon?: boolean;
}

export default function ChapterCover({
  imageUrl,
  title,
  showPremiumBadge = false,
  showLimitedEditionBadge = false,
  showBookmarkIcon = false,
  className = "",
  textSize = "md",
}: ChapterCoverProps) {
  const textSizeClass = {
    sm: "text-sm",
    md: "text-md",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  }[textSize];
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-1 opacity-25 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative bg-background-dark rounded-lg overflow-hidden aspect-[3/4] shadow-2xl">
        {showBookmarkIcon && (
          <div className="absolute -top-1 right-8 flex flex-col items-center group cursor-pointer">
            <div className="bg-gold h-16 w-8 shadow-lg flex items-end justify-center pb-2 rounded-b-sm transition-all group-hover:h-20 z-[1]">
              <span className="material-symbols-outlined text-cream text-lg select-none">
                bookmark
              </span>
            </div>

            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[8px] border-t-gold z-[1]"></div>
          </div>
        )}
        <div className="absolute -inset-2 bg-accent-gold/5 rounded-xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

        <div className="relative grid grid-rows-[auto_1fr] bg-black rounded-[4px] overflow-hidden aspect-[3/4] book-edge ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.01]">
          <img
            className="w-full h-auto object-cover"
            // src={imageUrl.replace(".png", "-thumb.png")}
            src={imageUrl ?? "/assets/images/404_bg.png"}
            alt={title}
          />
          <div
            className={`relative flex px-8 items-center bg-[#53273F] handwriting leading-4 ${textSizeClass}`}>
            {title}
          </div>

          {/* <div className="book-texture"></div> */}
          <div className="book-spine-effect"></div>
          <div className="book-binding-line"></div>
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div> */}
          {showLimitedEditionBadge && (
            <div className="absolute bg-white bottom-2 w-full z-20 items-center flex justify-center  z-[0]">
              <span className="px-3 py-1 bg-accent-gold text-background-dark text-[10px] font-black rounded-sm shadow-lg uppercase tracking-[0.2em]">
                Édition Limitée
              </span>
            </div>
          )}
        </div>

        {showPremiumBadge && (
          <div className="absolute bottom-2 left-3 right-6 z-[1]">
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-widest">
              Premium
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
