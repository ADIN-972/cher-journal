import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
} from "react";
import { flushSync } from "react-dom";

const EXIT_DURATION = 800; // ms — must match CSS animation duration
const TRIGGER_NAV_AT = 550; // ms — fire nav callback when page is edge-on

// ─── Types ───────────────────────────────────────────────────────────────────
interface VolumeLayer {
  content: string;
  chapterTitle?: string;
  volumeTitle?: string;
  volumeNumber?: number;
  coverImageUrl?: string | null;
}

interface LayerState {
  top: VolumeLayer; // currently reading
  bottom: VolumeLayer | null; // preloaded next — under top, revealed on next flip
  prev: VolumeLayer | null; // preloaded prev — above top, covers on prev flip
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface FlipBookProps {
  content: string;
  chapterTitle?: string;
  volumeTitle?: string;
  volumeNumber?: number;
  coverImageUrl?: string | null;
  // Preloaded next (bottom layer)
  nextContent?: string;
  nextChapterTitle?: string;
  nextVolumeTitle?: string;
  nextVolumeNumber?: number;
  nextCoverImageUrl?: string | null;
  // Preloaded prev (above layer)
  prevContent?: string;
  prevChapterTitle?: string;
  prevVolumeTitle?: string;
  prevVolumeNumber?: number;
  prevCoverImageUrl?: string | null;
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
export default function FlipBook_save({
  content,
  chapterTitle,
  volumeTitle,
  volumeNumber,
  coverImageUrl,
  nextContent,
  nextChapterTitle,
  nextVolumeTitle,
  nextVolumeNumber,
  nextCoverImageUrl,
  prevContent,
  prevChapterTitle,
  prevVolumeTitle,
  prevVolumeNumber,
  prevCoverImageUrl,
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
  // ── Layer state ─────────────────────────────────────────────────────────
  const [layers, setLayers] = useState<LayerState>({
    top: {
      content,
      chapterTitle,
      volumeTitle,
      volumeNumber,
      coverImageUrl: coverImageUrl ?? null,
    },
    bottom: null,
    prev: null,
  });

  const [progress, setProgress] = useState(0);

  const layersRef = useRef(layers);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  // Queue for updates that arrive mid-flip
  const pendingBottomRef = useRef<VolumeLayer | null>(null);
  const pendingPrevRef = useRef<VolumeLayer | null>(null);

  // ── Animation state ─────────────────────────────────────────────────────
  const [nextFlipClass, setNextFlipClass] = useState(""); // applied to top layer
  const [isPrevFlipping, setIsPrevFlipping] = useState(false); // mounts prev layer
  const isFlippingRef = useRef(false); // true during any flip (guards prop-sync effects)
  const navTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── DOM refs ────────────────────────────────────────────────────────────
  const outerRef = useRef<HTMLDivElement>(null);
  const topLayerRef = useRef<HTMLDivElement>(null);
  const bottomLayerRef = useRef<HTMLDivElement>(null);
  const prevLayerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // ── Preload all layer images to prevent flicker on layer swap ────────────
  useEffect(() => {
    [layers.top.coverImageUrl, layers.bottom?.coverImageUrl, layers.prev?.coverImageUrl]
      .filter(Boolean)
      .forEach((url) => {
        const img = new Image();
        img.src = url as string;
      });
  }, [layers.top.coverImageUrl, layers.bottom?.coverImageUrl, layers.prev?.coverImageUrl]);

  // ── Sync current volume → top (non-navigation changes, e.g. perspective switch) ─
  useEffect(() => {
    if (isFlippingRef.current) return;
    setLayers((prev) => {
      if (prev.top.content === content) return prev;
      return {
        ...prev,
        top: {
          content,
          chapterTitle,
          volumeTitle,
          volumeNumber,
          coverImageUrl: coverImageUrl ?? null,
        },
      };
    });
  }, [content, chapterTitle, volumeTitle, volumeNumber, coverImageUrl]);

  // ── Sync next volume → bottom ────────────────────────────────────────────
  useEffect(() => {
    const newBottom: VolumeLayer | null = nextContent
      ? {
          content: nextContent,
          chapterTitle: nextChapterTitle,
          volumeTitle: nextVolumeTitle,
          volumeNumber: nextVolumeNumber,
          coverImageUrl: nextCoverImageUrl ?? null,
        }
      : null;
    if (isFlippingRef.current) {
      pendingBottomRef.current = newBottom;
      return;
    }
    setLayers((prev) => ({ ...prev, bottom: newBottom }));
  }, [
    nextContent,
    nextChapterTitle,
    nextVolumeTitle,
    nextVolumeNumber,
    nextCoverImageUrl,
  ]);

  // ── Sync prev volume → prev layer ───────────────────────────────────────
  useEffect(() => {
    const newPrev: VolumeLayer | null = prevContent
      ? {
          content: prevContent,
          chapterTitle: prevChapterTitle,
          volumeTitle: prevVolumeTitle,
          volumeNumber: prevVolumeNumber,
          coverImageUrl: prevCoverImageUrl ?? null,
        }
      : null;
    if (isFlippingRef.current) {
      pendingPrevRef.current = newPrev;
      return;
    }
    setLayers((prev) => ({ ...prev, prev: newPrev }));
  }, [
    prevContent,
    prevChapterTitle,
    prevVolumeTitle,
    prevVolumeNumber,
    prevCoverImageUrl,
  ]);

  useEffect(() => () => clearNavTimers(), []);

  // ── Scroll progress ──────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pct =
      el.scrollHeight <= el.clientHeight
        ? 100
        : Math.round(
            (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100,
          );
    onPageProgress?.(pct);
    setProgress(pct);
  }, [onPageProgress]);

  // ── Navigation: next ─────────────────────────────────────────────────────
  // Current (top) flips LEFT → bottom is revealed → bottom becomes new top
  const handleNavNext = useCallback(() => {
    if (!onNavigateNext || !hasNextAccess) return;
    clearNavTimers();
    isFlippingRef.current = true;
    setNextFlipClass("page-exit-left");

    const t1 = setTimeout(() => {
      onNavigateNext();
    }, TRIGGER_NAV_AT);

    const t2 = setTimeout(() => {
      const cur = layersRef.current;
      // flushSync forces React to commit synchronously while the top layer is still
      // invisible (fill-mode:forwards keeps opacity:0). The browser paints the new
      // image content in the hidden layer before we reveal it.
      flushSync(() => {
        setLayers({
          top: cur.bottom ?? cur.top, // bottom becomes new current
          bottom: pendingBottomRef.current, // new next (may be null if still loading)
          prev: cur.top, // old current becomes new prev
        });
        setProgress(0);
      });
      pendingBottomRef.current = null;
      isFlippingRef.current = false;
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      onPageProgress?.(0);
      // One rAF is enough: flushSync already committed the DOM, so the browser
      // has had one layout/paint cycle to decode the cached image before we reveal.
      requestAnimationFrame(() => {
        setNextFlipClass("");
      });
    }, EXIT_DURATION);

    navTimersRef.current.push(t1, t2);
  }, [onNavigateNext, hasNextAccess, onPageProgress]);

  // ── Navigation: prev ─────────────────────────────────────────────────────
  // Prev layer (above top) sweeps in with page-exit-right → covers top → becomes new top
  const handleNavPrev = useCallback(() => {
    if (!onNavigatePrev || !hasPrevAccess) return;
    clearNavTimers();
    isFlippingRef.current = true;
    setIsPrevFlipping(true); // mount prev layer with page-exit-right animation

    const t1 = setTimeout(() => {
      onNavigatePrev();
    }, TRIGGER_NAV_AT);

    const t2 = setTimeout(() => {
      const cur = layersRef.current;
      // flushSync: update top content while the z-20 prev layer still covers it.
      // The browser paints the new image under the mask before it's revealed.
      flushSync(() => {
        setLayers({
          top: cur.prev ?? cur.top, // prev becomes new current
          bottom: cur.top, // old current becomes new next
          prev: pendingPrevRef.current, // new prev (may be null if still loading)
        });
        setProgress(0);
      });
      pendingPrevRef.current = null;
      isFlippingRef.current = false;
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      onPageProgress?.(0);
      // One rAF: browser has already painted under the cover, now unmount it
      requestAnimationFrame(() => {
        setIsPrevFlipping(false);
      });
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

  const paragraphsTop = useMemo(
    () => layers.top.content.split("\n\n").filter((p) => p.trim()),
    [layers.top.content],
  );
  const paragraphsBottom = useMemo(
    () => (layers.bottom?.content ?? "").split("\n\n").filter((p) => p.trim()),
    [layers.bottom?.content],
  );
  const paragraphsPrev = useMemo(
    () => (layers.prev?.content ?? "").split("\n\n").filter((p) => p.trim()),
    [layers.prev?.content],
  );

  // ── Render a page ────────────────────────────────────────────────────────
  const renderPage = (
    layer: VolumeLayer,
    layerRef: React.RefObject<HTMLDivElement>,
    isTop: boolean,
    paragraphs: string[],
    zIndex = 0
  ) => (
    <div
      ref={layerRef}
      className="flex w-full h-full">
      {/* Left page — decorative, xl only */}
      {/* <div className="hidden xl:flex w-[300px] flex-none flex-col bg-[#e8dfc8] dark:bg-[#13100a] relative overflow-hidden">
         <div className="flex-1 flex items-center justify-center p-8">
          {layer.coverImageUrl ? (
            <div
              className="reader-cover-bg w-full h-full bg-cover bg-center opacity-55 rounded-sm"
              style={{ "--reader-cover-bg": `url(${layer.coverImageUrl})` } as React.CSSProperties}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 opacity-35">
              <div className="h-px w-10 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <span className="material-symbols-outlined text-[80px] text-gold select-none">
                auto_stories
              </span>
              <div className="h-px w-10 bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
          )}
        </div>
        <div className="pb-6 flex flex-col items-center gap-1">
          {layer.chapterTitle && (
            <p className="text-[8px] uppercase tracking-[0.35em] text-charcoal/25 dark:text-white/15 font-ornate text-center px-4">
              {layer.chapterTitle}
            </p>
          )}
          <p className="text-[8px] text-charcoal/20 dark:text-white/10 font-ornate tracking-widest">
            Vol. {layer.volumeNumber}
          </p>
        </div>



        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/30 via-black/10 to-transparent pointer-events-none" />
      </div> */}

      {/* Right page — scrollable */}
      <div className="relative flex-1 min-w-0">
        <div className="hidden xl:block absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/18 to-transparent pointer-events-none z-10" />
        <div
          ref={isTop ? scrollRef : undefined}
          onScroll={isTop ? handleScroll : undefined}
          className="w-full h-full overflow-y-auto bg-[#faf5ea] dark:bg-[#1c1610]">
          <div className="px-8 md:px-[10%] lg:px-[20%] pt-32 pb-48  bg-parchment dark:bg-background-dark">
            <div className="text-center mb-10">
              <div className="h-px w-14 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-4" />

              {layer.chapterTitle && (
                <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 dark:text-white/30 font-ornate mb-1">
                  {layer.chapterTitle}
                </p>
              )}
              <h2 className="font-ornate text-xl text-charcoal dark:text-white leading-snug">
                Vol. {layer.volumeNumber}
                {layer.volumeTitle && (
                  <span className="block text-slate-900 dark:text-white font-ornate tracking-wide text-[26px] md:text-[40px] font-medium leading-tight text-center pb-2 pt-2">
                    {layer.volumeTitle}
                  </span>
                )}
              </h2>
              <div className="h-px w-14 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-1" />
            </div>

            <div className={`${fontClass} reader-text-content`}>
              {paragraphs.map((para, i) => {
                const isFirstParagraph = i === 0;
                return (
                  <>
                    {isFirstParagraph && layer.coverImageUrl && (
                      <div className="antique-float flex flex-col items-center gap-4">
                        <div className="relative w-full aspect-[1/1] flex items-center justify-center">
                          <img
                            alt=""
                            className="w-full h-full object-cover vignette-mask shadow-md rounded-md"
                            src={layer.coverImageUrl}
                            decoding="sync"
                          />
                        </div>
                      </div>
                    )}
                    <p
                      key={i}
                      className={`text-justify text-slate-800 dark:text-slate-300 ${
                        isFirstParagraph
                          ? "first-letter-ornate drop-cap mb-8"
                          : " mb-4"
                      }`}>
                      {para}
                    </p>
                  </>
                );
              })}
            </div>

            {isTop && footer && (
              <div className="mt-16 pt-8 border-t border-gold/15">{footer}</div>
            )}

            <div className="mt-10 flex justify-center">
              <span className="text-[9px] text-charcoal/20 dark:text-white/10 font-ornate tracking-widest select-none">
                — {layer.volumeNumber} —
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────────────
  const shadow =
    "shadow-[0_16px_64px_rgba(0,0,0,0.28)] dark:shadow-[0_16px_64px_rgba(0,0,0,0.65)]";
  const outerClass =
    "w-full h-full grid flex-col items-center min-h-dvh bg-parchment dark:bg-background-dark";

  return (
    <div
      ref={outerRef}
      className={outerClass}>
      <div className="h-full w-full flex flex-col max-w-[900px] md:max-w-full">
        {/* Perspective wrapper — explicit height so absolute children have dimensions */}
        <div className="reader-flip-wrapper relative h-full">
          {/* z-0 — Bottom layer: preloaded next volume, revealed when top flips left */}
          {layers.bottom ? (
            <div
              className={`absolute inset-0 rounded-[3px] overflow-hidden ${shadow}`}>
              {renderPage(
                layers.bottom,
                bottomLayerRef,
                false,
                paragraphsBottom,
                0
              )}
            </div>
          ) : (
            <div className="absolute inset-0 rounded-[3px] bg-[#e8dfc8] dark:bg-[#13100a]" />
          )}

          {/* z-10 — Top layer: current volume, exits left on next flip */}
          <div
            className={`absolute inset-0 z-10 rounded-[3px] overflow-hidden ${shadow} ${nextFlipClass}`}>
            {renderPage(layers.top, topLayerRef, true, paragraphsTop, 10)}
          </div>

          {/* z-20 — Prev layer: preloaded prev volume, sweeps in to cover top on prev flip */}
          {isPrevFlipping && layers.prev && (
            <div
              className={`absolute inset-0 z-20 rounded-[3px] overflow-hidden ${shadow} page-exit-right`}>
              {renderPage(layers.prev, prevLayerRef, false, paragraphsPrev)}
            </div>
          )}
        </div>

        {/* Navigation bar */}
        <div className="fixed  backdrop-blur w-full bottom-0 mt-5 flex items-center justify-between">
          {hasPrevAccess ? (
            <button
              type="button"
              onClick={handleNavPrev}
              className="flex items-center gap-2 text-gold transition-colors group rounded-full px-2 py-1 m-2 bg-white border-2 border-gold">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span className="text-[10px] uppercase tracking-widest font-ornate hidden sm:inline">
                Vol. précédent
              </span>
            </button>
          ) : (
            <div className="flew w-[46px] h-[40px] flex items-center gap-2 text-gold hover:scale-105 transition-transform group rounded-full px-2 py-1 m-2 border-2 border-transparent"></div>
          )}

          {/* Fixed progress bar */}
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
                className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold/60 rounded-full shadow-[0_0_8px_rgba(197,160,89,0.5)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </footer>

          <div
            className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-5 mix-blend-multiply"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCun0EQcjBjiCTdnHOJgZTarDmGw709yp6EFjwQJVqOfJPpXCGA2dVGnbbryLC32uOcFACnOFMHbW_QYWx7pc4-eaP0rcW87VCju5ZRhEU9BhZSKoCdIhssIIE1fQ8XMDsdrVuuBN1ir1qWRA9O4DXi2fqaIS9t1K-ioACIQtpafqOhkb4DNaqi-GSnGcSOBM7xSJDIwzCRon4cbVPNc4KthOKux_Ox7gZumz9MtHcXAXeHcgz7adSjpMiycNm_cAbnsIqJ1pMkqjg')",
            }}
          />
          {hasNextAccess ? (
            <button
              type="button"
              onClick={handleNavNext}
              className="flex items-center gap-2 text-gold hover:scale-105 transition-transform group rounded-full px-2 py-1 m-2 bg-white border-2 border-gold">
              <span className="text-[10px] uppercase tracking-widest font-ornate hidden sm:inline">
                Vol. suivant
              </span>
              <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          ) : (
            <div className="flew w-[46px] h-[40px] flex items-center gap-2 text-gold hover:scale-105 transition-transform group rounded-full px-2 py-1 m-2 border-2 border-transparent"></div>
          )}
        </div>
      </div>
    </div>
  );
}
