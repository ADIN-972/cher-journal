interface ChapterCoverProps {
  imageUrl?: string | null;
  title: string;
  showPremiumBadge?: boolean;
  showLimitedEditionBadge?: boolean;
  className?: string;
  textClassName?: string;
  textSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "auto";
  showBookmarkIcon?: boolean;
  showFavoriteIcon?: boolean;
  hasGrayscaleEffect?: boolean;
  showTitleOverlay?: boolean;
  roundedLeft?: boolean;
  bordered?: boolean;
  isAccesClub?: boolean;
}

export default function ChapterCover({
  imageUrl,
  title,
  showPremiumBadge = false,
  showLimitedEditionBadge = false,
  showBookmarkIcon = false,
  showFavoriteIcon = false,
  className = "",
  textClassName = "",
  textSize = "md",
  hasGrayscaleEffect = false,
  showTitleOverlay = true,
  roundedLeft = true,
  bordered = true,
  isAccesClub = false,
}: ChapterCoverProps) {
  const textSizeClass = {
    sm: "xl:text-sm",
    md: "xl:text-md",
    lg: "xl:text-lg",
    xl: "xl:text-xl",
    "2xl": "xl:text-2xl",
    "3xl": "xl:text-3xl",
    auto: "xl:text-[calc(10%+3vw)] 4xl:text-[calc(10%+1vw)]",
  }[textSize];
  return (
    <div
      className={`relative group h-full ${className} place-self-initial`}
      style={{ placeSelf: "initial" }}>
      {isAccesClub && (
        <div className="ruban z-[12]">
          <div className="flex  newsreader text-sm lg:text-xl italic text-white text-shadow-lg text-nowrap flex-row items-center justify-center gap-1 lg:gap-3 px-0 lg:px-6 xl:px-12  my-2">
          <span className="material-symbols-outlined text-sm lg:text-xl block">
            lock
          </span>
          {`Accès Club`}
          </div>
        </div>
      )}
      <div className="absolute -inset-1 opacity-25 group-hover:opacity-40 transition duration-1000"></div>
      <div
        className={`relative bg-background-dark rounded-lg ${roundedLeft ? "rounded-l-md" : ""} overflow-hidden aspect-[3/4] shadow-2xl z-[2] w-[93%] h-full`}>
        {showBookmarkIcon && (
          <div className="absolute -top-1 right-[5%] flex flex-col items-center group cursor-pointer">
            <div className="bg-gold h-16 w-8 shadow-lg flex items-end justify-center pb-2 rounded-b-sm transition-all group-hover:h-20 z-[1]">
              {/* <span className="material-symbols-outlined text-cream text-lg select-none">
                bookmark
              </span> */}
            </div>

            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[8px] border-t-gold z-[1]"></div>
          </div>
        )}
        {showFavoriteIcon && (
          <div className="absolute -top-1 right-[15%] flex flex-col items-center group cursor-pointer">
            <div className="bg-pink-700 h-16 w-8 shadow-lg flex items-end justify-center pb-2 rounded-b-sm transition-all group-hover:h-20 z-[1]">
              <span className="material-symbols-outlined text-cream text-lg select-none">
                favorite
              </span>
            </div>
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[8px] border-t-pink-700 z-[1]"></div>
          </div>
        )}

        <div className="absolute -inset-2 bg-accent-gold/5 rounded-xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

        <div
          className={`relative h-full grid grid-rows-[auto_1fr]  ${bordered ? " pl-[2%]" : ""} bg-[#53273F] rounded-[4px] overflow-hidden aspect-[3/4] book-edge ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.01]`}>
          <img
            className={`w-full h-auto ${bordered ? "aspect-[1/1]" : "aspect-[3/4]"}  object-cover ${hasGrayscaleEffect ? "grayscale" : ""} group-hover:grayscale-0 opacity-90 group-hover:opacity-100 transition-opacity duration-500`}
            src={imageUrl ?? "/assets/images/404_bg.png"}
            alt={title}
          />
          {showTitleOverlay && (
            <div
              className={` ${bordered ? "" : "absolute"}  grid  bottom-0 items-center handwriting ${
                textClassName
                  ? textClassName
                  : `text-center w-full leading-4
                ${
                  "" // bg-[#833963]/80
                }
                text-shadow-[0_35px_35px_rgb(83_39_63_/_0.85)] ${
                  "text-[calc(10%+5vw)]" // " md:text-[calc(10%+3vw)]"
                } ${textSizeClass} text-white px-2 py-[10%] transition-colors duration-300 group-hover:text-white text-shadow-lg/30`
              }  z-[1] `}>
              {title}
            </div>
          )}

          {/* <div className="book-texture"></div> */}
          <div className="book-spine-effect"></div>
          <div className="book-binding-line"></div>
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div> */}
          {showLimitedEditionBadge && (
            <div className="absolute bg-white bottom-2 w-full z-20 items-center flex justify-center  z-[0]">
              <span className="px-3 py-1 bg-accent-gold text-background-dark text-[10px] font-black rounded-sm shadow-lg uppercase tracking-[0.2em] text-shadow-md">
                Édition Limitée
              </span>
            </div>
          )}
        </div>

        {showPremiumBadge && (
          <div className="absolute bottom-2 left-3 right-6 z-[1]">
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-widest text-shadow-md">
              Premium
            </span>
          </div>
        )}
      </div>
      <div className="absolute w-full h-full top-0 bottom-0 left-[3px]  py-[2%] z-[1]">
        {/* <div className="absolute w-[120%] h-10 bg-white  -bottom-2 skew-x-[-12deg] -left-[2%] my-auto shadow-[0_35px_35px_rgb(255, 255, 255)]"></div> */}
        <div className="absolute flex w-[97%] h-[94%] bg-[#833963] my-[2%] rounded-md"></div>
        <div className="absolute flex w-[96%] h-[89%] bg-white border-[1px] my-[5%] border-gray-400"></div>
        <div className="absolute flex w-[95%] h-[91%] bg-white border-[1px] my-[4%] border-gray-400"></div>
        <div className="absolute flex w-[94%] h-[93%] bg-white border-[1px] my-[3%] border-gray-400"></div>
        <div className="absolute flex w-[93%] h-[95%] bg-white border-[1px] my-[1%] border-gray-400"></div>
        {/* <div className="absolute flex w-[96%] h-[90%] bg-white border-[1px] py-[4%] border-gray-500"></div> */}
        {/* <div className="absolute flex w-[95%] h-[95%] bg-white border-[1px] py-[3%] border-gray-500"></div> */}
      </div>
    </div>
  );
}
