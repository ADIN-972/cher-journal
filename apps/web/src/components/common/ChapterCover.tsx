interface ChapterCoverProps {
  imageUrl?: string | null;
  title: string;
  showPremiumBadge?: boolean;
  showLimitedEditionBadge?: boolean;
  className?: string;
  textSize?: "sm" | "md" | "lg"| "xl"| "2xl"| "3xl";
}

export default function ChapterCover({
  imageUrl,
  title,
  showPremiumBadge = false,
  showLimitedEditionBadge = false,
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
        <div className="absolute -inset-2 bg-accent-gold/5 rounded-xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

        <div className="relative grid grid-rows-[auto_1fr] bg-black rounded-[4px] overflow-hidden aspect-[3/4] book-edge ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.01]">
          {imageUrl ? (
            <>
              <img
                className="w-full h-auto object-cover"
                // src={imageUrl.replace(".png", "-thumb.png")}
                src={imageUrl}
                alt={title}
              />
              <div className={`relative flex px-8 items-center bg-[#53273F] handwriting ${textSizeClass}`}>
                {title}
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent-gold/20 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">📖</div>
                <p className={`${textSizeClass} text-charcoal dark:text-white/70 font-medium`}>
                  {title}
                </p>
              </div>
            </div>
          )}
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
