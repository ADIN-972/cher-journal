import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";

const EXIT_DURATION = 800; // ms — must match CSS animation duration
const TRIGGER_NAV_AT = 550; // ms — fire nav callback when page is edge-on

// ─── Types ───────────────────────────────────────────────────────────────────
export interface VolumeLayer {
  id: string;
  content: string;
  chapterTitle?: string;
  volumeTitle?: string;
  volumeNumber?: number;
  coverImageUrl?: string | null;
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface FlipBookProps {
  /** All loaded volumes in chapter order. FlipBook renders a div for every entry. */
  volumes: VolumeLayer[];
  /** ID of the volume the parent considers "current" (drives visual after 800 ms). */
  currentVolumeId: string;
  // Reading settings
  fontSize?: number;
  fontFamily?: "serif" | "sans-serif" | "mono";
  lineHeight?: number;
  footer?: React.ReactNode;
  // Navigation
  hasPrevAccess?: boolean;
  hasNextAccess?: boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onPageProgress?: (pct: number) => void;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function FlipBook({
  volumes,
  currentVolumeId,
  fontSize = 16,
  fontFamily = "serif",
  lineHeight = 1.7,
  footer,
  hasPrevAccess,
  hasNextAccess,
  onNavigatePrev,
  onNavigateNext,
  onPageProgress,
}: FlipBookProps) {
  // ── Display state ────────────────────────────────────────────────────────
  // `displayVolumeId` is the VISUAL current (switches at 800 ms, not at prop change).
  const [displayVolumeId, setDisplayVolumeId] = useState(currentVolumeId);
  const currentVolumeIdRef = useRef(currentVolumeId);
  useEffect(() => {
    currentVolumeIdRef.current = currentVolumeId;
    // Sync display immediately when NOT mid-flip (e.g. external navigation)
    if (!isFlippingRef.current) {
      setDisplayVolumeId(currentVolumeId);
    }
  }, [currentVolumeId]);

  // ── Animation state ──────────────────────────────────────────────────────
  const [isNextExiting, setIsNextExiting] = useState(false);
  const [isPrevAnim, setIsPrevAnim]       = useState(false);
  const isFlippingRef  = useRef(false);
  const navTimersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const outerRef = useRef<HTMLDivElement>(null);
  // One scroll container per volume, keyed by volumeId
  const scrollContainersRef = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const [progress, setProgress] = useState(0);

  const clearNavTimers = () => {
    navTimersRef.current.forEach(clearTimeout);
    navTimersRef.current = [];
  };

  // ── CSS custom properties ────────────────────────────────────────────────
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    el.style.setProperty("--reader-font-size", `${fontSize}px`);
    el.style.setProperty("--reader-line-height", String(lineHeight));
  }, [fontSize, lineHeight]);

  useEffect(() => () => clearNavTimers(), []);

  // ── Scroll progress ──────────────────────────────────────────────────────
  const handleScroll = useCallback(
    (volumeId: string) => {
      if (volumeId !== displayVolumeId) return;
      const el = scrollContainersRef.current.get(volumeId);
      if (!el) return;
      const pct =
        el.scrollHeight <= el.clientHeight
          ? 100
          : Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
      onPageProgress?.(pct);
      setProgress(pct);
    },
    [displayVolumeId, onPageProgress],
  );

  // ── Navigation: next ──────────────────────────────────────────────────────
  const handleNavNext = useCallback(() => {
    if (!onNavigateNext || !hasNextAccess) return;
    clearNavTimers();
    isFlippingRef.current = true;
    setIsNextExiting(true);

    const t1 = setTimeout(() => {
      onNavigateNext();
    }, TRIGGER_NAV_AT);

    const t2 = setTimeout(() => {
      const newId = currentVolumeIdRef.current;
      setDisplayVolumeId(newId);
      setIsNextExiting(false);
      isFlippingRef.current = false;
      scrollContainersRef.current.get(newId)?.scrollTo(0, 0);
      onPageProgress?.(0);
      setProgress(0);
    }, EXIT_DURATION);

    navTimersRef.current.push(t1, t2);
  }, [onNavigateNext, hasNextAccess, onPageProgress]);

  // ── Navigation: prev ──────────────────────────────────────────────────────
  const handleNavPrev = useCallback(() => {
    if (!onNavigatePrev || !hasPrevAccess) return;
    clearNavTimers();
    isFlippingRef.current = true;
    setIsPrevAnim(true);

    const t1 = setTimeout(() => {
      onNavigatePrev();
    }, TRIGGER_NAV_AT);

    const t2 = setTimeout(() => {
      const newId = currentVolumeIdRef.current;
      setDisplayVolumeId(newId);
      setIsPrevAnim(false);
      isFlippingRef.current = false;
      scrollContainersRef.current.get(newId)?.scrollTo(0, 0);
      onPageProgress?.(0);
      setProgress(0);
    }, EXIT_DURATION);

    navTimersRef.current.push(t1, t2);
  }, [onNavigatePrev, hasPrevAccess, onPageProgress]);

  // ── Reading helpers ──────────────────────────────────────────────────────
  const fontClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "mono"
        ? "font-mono"
        : "font-sans";

  // ── Render a single volume slot ───────────────────────────────────────────
  const displayIdx = volumes.findIndex((v) => v.id === displayVolumeId);

  const renderVolume = (vol: VolumeLayer, i: number) => {
    const diff = i - displayIdx;
    const isCur  = diff === 0;
    const isNext = diff === 1;
    const isPrev = diff === -1;
    const isActive = isCur || isNext || isPrev;

    // Volumes far from current: placeholder only — no GPU layers, no scroll containers
    if (!isActive) {
      return (
        <div key={vol.id} style={{ display: "none" }} aria-hidden />
      );
    }

    // z-index class (4 discrete values — no inline style needed)
    let zClass: string;
    if (isCur)                     zClass = "reader-slot-z-10";
    else if (isPrev && isPrevAnim) zClass = "reader-slot-z-20";
    else if (isNext)               zClass = "reader-slot-z-0";
    else                           zClass = "reader-slot-z-neg10"; // prev idle

    let animClass = "";
    if (isCur && isNextExiting)    animClass = "page-exit-left";
    else if (isPrev && isPrevAnim) animClass = "page-exit-right";

    const paragraphs = vol.content.split("\n\n").filter((p) => p.trim());
    const shadow = "shadow-[0_16px_64px_rgba(0,0,0,0.28)] dark:shadow-[0_16px_64px_rgba(0,0,0,0.65)]";

    return (
      <div
        key={vol.id}
        className={`${zClass} absolute inset-0 rounded-[3px] overflow-hidden ${shadow} ${animClass}`}
      >
        <div className="flex w-full h-full">
          <div className="relative flex-1 min-w-0">
            <div className="hidden xl:block absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/18 to-transparent pointer-events-none z-10" />
            <div
              ref={(el) => scrollContainersRef.current.set(vol.id, el)}
              onScroll={isCur ? () => handleScroll(vol.id) : undefined}
              className="reader-scroll-gpu w-full h-full overflow-y-auto bg-[#faf5ea] dark:bg-[#1c1610]"
            >
              <div className="px-8 md:px-[10%] lg:px-[20%] pt-32 pb-48 bg-parchment dark:bg-background-dark">
                <div className="text-center mb-10">
                  <div className="h-px w-14 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-4" />
                  {vol.chapterTitle && (
                    <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 dark:text-white/30 font-ornate mb-1">
                      {vol.chapterTitle}
                    </p>
                  )}
                  <h2 className="font-ornate text-xl text-charcoal dark:text-white leading-snug">
                    Vol. {vol.volumeNumber}
                    {vol.volumeTitle && (
                      <span className="block text-slate-900 dark:text-white font-ornate tracking-wide text-[26px] md:text-[40px] font-medium leading-tight text-center pb-2 pt-2">
                        {vol.volumeTitle}
                      </span>
                    )}
                  </h2>
                  <div className="h-px w-14 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-1" />
                </div>

                <div className={`${fontClass} reader-text-content`}>
                  {paragraphs.map((para, pi) => {
                    const isFirst = pi === 0;
                    return (
                      <React.Fragment key={pi}>
                        {isFirst && vol.coverImageUrl && (
                          <div className="antique-float flex flex-col items-center gap-4">
                            <div className="relative w-full aspect-[1/1] flex items-center justify-center">
                              <img
                                alt=""
                                className="w-full h-full object-cover vignette-mask shadow-md rounded-md"
                                src={vol.coverImageUrl}
                                decoding="sync"
                              />
                            </div>
                          </div>
                        )}
                        <p
                          className={`text-justify text-slate-800 dark:text-slate-300 ${
                            isFirst ? "first-letter-ornate drop-cap mb-8" : "mb-4"
                          }`}
                        >
                          {para}
                        </p>
                      </React.Fragment>
                    );
                  })}
                </div>

                {isCur && footer && (
                  <div className="mt-16 pt-8 border-t border-gold/15">{footer}</div>
                )}

                <div className="mt-10 flex justify-center">
                  <span className="text-[9px] text-charcoal/20 dark:text-white/10 font-ornate tracking-widest select-none">
                    — {vol.volumeNumber} —
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div
      ref={outerRef}
      className="w-full h-full grid flex-col items-center min-h-dvh bg-parchment dark:bg-background-dark"
    >
      <div className="h-full w-full flex flex-col max-w-[900px] md:max-w-full">
        {/* Perspective wrapper — all N volume slots */}
        <div className="reader-flip-wrapper relative h-full">
          {volumes.map(renderVolume)}
        </div>

        {/* Navigation bar */}
        <div className="fixed backdrop-blur w-full lg:px-[10%] bottom-0 mt-5 flex items-center justify-between">
          {hasPrevAccess ? (
            <button
              type="button"
              onClick={handleNavPrev}
              className="flex items-center gap-2 text-gold transition-colors group rounded-full px-2 py-1 m-2 bg-white border-2 border-gold"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span className="text-[10px] uppercase tracking-widest font-ornate hidden sm:inline">
                Vol. précédent
              </span>
            </button>
          ) : (
            <div className="flew w-[46px] h-[40px] flex items-center gap-2 text-gold hover:scale-105 transition-transform group rounded-full px-2 py-1 m-2 border-2 border-transparent" />
          )}

          {/* Progress bar */}
          <footer className="bottom-0 left-0 w-full z-50 bg-charcoal-600 dark:bg-black/30 backdrop-blur px-6 py-4 flex flex-col items-center">
            <div className="w-full max-w-[480px] flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-widest text-charcoal/60 dark:text-white/60 font-bold font-ornate">
                Lecture en cours
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold font-bold font-ornate">
                {progress}% complété
              </span>
            </div>
            <div className="w-full max-w-[480px] h-1 bg-gold/10 rounded-full overflow-hidden">
              <div
                className="reader-progress-fill h-full bg-gradient-to-r from-gold/60 via-gold to-gold/60 rounded-full shadow-[0_0_8px_rgba(197,160,89,0.5)] transition-all duration-500"
                style={{ "--progress-w": `${progress}%` } as React.CSSProperties}
              />
            </div>
          </footer>

          <div className="reader-texture-overlay fixed inset-0 pointer-events-none opacity-20 dark:opacity-5 mix-blend-multiply" />

          {hasNextAccess ? (
            <button
              type="button"
              onClick={handleNavNext}
              className="flex items-center gap-2 text-gold hover:scale-105 transition-transform group rounded-full px-2 py-1 m-2 bg-white border-2 border-gold"
            >
              <span className="text-[10px] uppercase tracking-widest font-ornate hidden sm:inline">
                Vol. suivant
              </span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          ) : (
            <div className="flew w-[46px] h-[40px] flex items-center gap-2 text-gold hover:scale-105 transition-transform group rounded-full px-2 py-1 m-2 border-2 border-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}
