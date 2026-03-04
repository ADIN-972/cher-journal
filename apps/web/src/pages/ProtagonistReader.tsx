import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReaderStore } from "../stores/readerStore";
import { useToast } from "../hooks/useToast";
import { showErrorToast } from "../lib/toastHelper";
import api from "../lib/api";
import PerspectiveUnlock from "../components/PerspectiveUnlock";
import ReaderHeader from "../components/reader/ReaderHeader";

export default function ProtagonistReader({
  volumeId,
  footer,
  onClose,
  scrollContainerId,
  chapterId,
  onPurchasePerspective,
  isPurchasing,
  perspective,
  hasPrevAccess,
  hasNextAccess,
  onNavigatePrev,
  onNavigateNext,
}: {
  volumeId?: string;
  footer?: React.ReactNode;
  onClose?: () => void;
  scrollContainerId?: string;
  chapterId?: string;
  onPurchasePerspective?: (volumeNumber: number) => void;
  isPurchasing?: boolean;
  perspective?: "NARRATOR" | "PROTAGONIST";
  hasPrevAccess?: boolean;
  hasNextAccess?: boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    currentVolume,
    isLoading,
    error,
    settings,
    loadVolume,
    saveProgress,
  } = useReaderStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastProgressSentRef = useRef<number>(0);
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadAttemptIdRef = useRef<string | null>(null);
  const shownErrorForAttemptRef = useRef<string | null>(null);
  const loadedVolumeIdRef = useRef<string | null>(null);
  const currentAttemptVolumeIdRef = useRef<string | null>(null);

  const coverImageUrl = currentVolume?.illustrationUrl
    ? `${import.meta.env.VITE_API_URL ?? ""}${currentVolume.illustrationUrl}`
    : undefined;

  // Load volume on mount or when volumeId or perspective changes
  useEffect(() => {
    const perspectiveKey =
      perspective === "PROTAGONIST" ? "protagonist" : "narrator";
    const loadKey = `${volumeId}-${perspectiveKey}`;

    if (volumeId && loadedVolumeIdRef.current !== loadKey) {
      loadedVolumeIdRef.current = loadKey;
      currentAttemptVolumeIdRef.current = volumeId;
      loadAttemptIdRef.current = `${volumeId}-${Date.now()}`;
      shownErrorForAttemptRef.current = null;
      console.log(
        `[ProtagonistReader] Starting new volume load: ${volumeId} with perspective: ${perspective}`,
      );
      loadVolume(volumeId, perspectiveKey);
    }
  }, [volumeId, loadVolume, perspective]);

  // Send progress to API (debounced)
  const sendProgressToAPI = async (progress: number) => {
    if (!currentVolume) return;

    const progressDiff = progress - lastProgressSentRef.current;
    if (progressDiff < 5 && progress < 100) return;

    try {
      await api.updateProgress({
        chapterId: chapterId ?? currentVolume.chapterId,
        volumeNumber: currentVolume.volumeNumber,
        progress,
        perspective: perspective || "PROTAGONIST",
      });
      lastProgressSentRef.current = progress;
    } catch (error: any) {
      console.error(`[ProtagonistReader] PROGRESS_UPDATE_FAILED`, {
        volumeId: currentVolume?.id,
        volumeNumber: currentVolume?.volumeNumber,
        chapterId: chapterId ?? currentVolume?.chapterId,
        perspective: perspective || "PROTAGONIST",
        progress,
        errorMessage: error?.message,
        errorCode: error?.code,
        cause:
          "Failed to save reading progress to API (PROTAGONIST perspective)",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Handle error state with toast notification
  useEffect(() => {
    const currentAttemptId = loadAttemptIdRef.current;
    const attemptVolumeId = currentAttemptVolumeIdRef.current;

    if (
      currentAttemptId &&
      attemptVolumeId === volumeId &&
      shownErrorForAttemptRef.current !== currentAttemptId &&
      error &&
      isLoading === false
    ) {
      // Only show error if there's an explicit error message from the API
      console.log(`[ProtagonistReader] DISPLAYING_ERROR_TOAST`, {
        volumeId,
        error,
        currentAttemptId,
        attemptVolumeId,
        isLoading,
        cause: `API returned explicit error message: "${error}" (PROTAGONIST perspective)`,
        timestamp: new Date().toISOString(),
      });
      shownErrorForAttemptRef.current = currentAttemptId;
      showErrorToast(toast, error);
    } else if (currentAttemptId && attemptVolumeId !== volumeId) {
      console.log(`[ProtagonistReader] SKIPPING_ERROR_DISPLAY_WRONG_VOLUME`, {
        expectedVolumeId: volumeId,
        attemptVolumeId,
        currentAttemptId,
        cause:
          "Error is for different volume than currently requested (PROTAGONIST perspective)",
      });
    }
  }, [error, isLoading, volumeId, toast]);

  // Calculate scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const scrollContainer = scrollContainerId
        ? document.getElementById(scrollContainerId)
        : null;

      const containerHeight = scrollContainer
        ? scrollContainer.clientHeight
        : window.innerHeight;
      const documentHeight = contentRef.current.scrollHeight;
      const scrollTop = scrollContainer
        ? scrollContainer.scrollTop
        : window.scrollY;
      const scrollable = documentHeight - containerHeight;

      if (scrollable > 0) {
        const progress = Math.min(
          100,
          Math.max(0, (scrollTop / scrollable) * 100),
        );
        const roundedProgress = Math.round(progress);
        setScrollProgress(roundedProgress);

        if (currentVolume) {
          saveProgress(currentVolume.id, scrollTop);
        }

        if (progressUpdateTimeoutRef.current) {
          clearTimeout(progressUpdateTimeoutRef.current);
        }
        progressUpdateTimeoutRef.current = setTimeout(() => {
          sendProgressToAPI(roundedProgress);
        }, 2000);
      }
    };

    const scrollTarget = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : window;

    if (scrollTarget) {
      scrollTarget.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => {
        scrollTarget.removeEventListener("scroll", handleScroll);
        if (progressUpdateTimeoutRef.current) {
          clearTimeout(progressUpdateTimeoutRef.current);
        }
      };
    }

    return () => {};
  }, [currentVolume, saveProgress, scrollContainerId]);

  const handleExit = () => {
    if (onClose) {
      onClose();
    } else {
      const newUrl = chapterId ? `/chapters/${chapterId}` : "/catalogue";
      navigate(newUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-charcoal dark:text-white font-light">
            Chargement de l'intimité...
          </p>
        </div>
      </div>
    );
  }

  if (!currentVolume) {
    return null;
  }

  const paragraphs = currentVolume.content
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  return (
    <div className="font-display transition-colors duration-500 overflow-x-auto bg-rose-50 dark:bg-background-dark">
      {/* Rose Ambient Background */}

      <div className="curtain-left hidden xl:block"></div>
      <div className="curtain-right hidden xl:block"></div>
      <div className="frame-top hidden xl:block"></div>
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.01]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #e91e63 0%, transparent 50%), radial-gradient(circle at 80% 80%, #f06292 0%, transparent 50%)",
        }}></div>

      {/* Fixed Header - PROTAGONIST Theme */}
      <ReaderHeader
        onClose={onClose}
        perspective="PROTAGONIST"
      />

      {/* Main Reading Content */}
      <main
        ref={contentRef}
        className="flex flex-col items-center w-full min-h-screen pt-32 pb-48 px-6">
        <div className="reading-container flex flex-col max-w-[800px] w-full rounded-lg">
          {/* Header Section - PROTAGONIST Theme */}
          <div className="mb-16">
            <div className="flex flex-col items-center">
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-rose-400 to-transparent mb-4"></div>
              <p className="text-charcoal/60 dark:text-white/60 text-sm font-normal leading-normal uppercase tracking-[0.25em] font-ornate italic">
                {currentVolume.chapterTitle}
              </p>
              <p className="text-rose-500/70 dark:text-rose-400/70 text-xs mt-2 font-light italic">
                Point de vue de la Protagoniste
              </p>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-rose-400 to-transparent mt-4"></div>
            </div>

            <h1 className="text-slate-900 dark:text-white font-ornate tracking-wide text-[26px] md:text-[40px] font-medium leading-tight text-center pb-6 pt-2">
              Vol {currentVolume.volumeNumber}: {currentVolume.title}
            </h1>
          </div>

          {/* Body Text - with PROTAGONIST styling */}
          <article
            className={`space-y-8 ${
              settings.fontFamily === "serif"
                ? "font-serif"
                : settings.fontFamily === "mono"
                  ? "font-mono"
                  : "font-sans"
            }`}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
            }}>
            {paragraphs.map((paragraph, index) => {
              const shouldAddSeparator =
                (index + 1) % 5 === 0 && index < paragraphs.length - 1;
              const isFirstParagraph = index === 0;
              return (
                <div
                  className="relative"
                  key={index}>
                  {isFirstParagraph && coverImageUrl && (
                    <div className="antique-float flex flex-col items-center gap-4">
                      <div className="relative w-full aspect-[4/5] flex items-center justify-center">
                        <img
                          alt=""
                          className="w-full h-full object-cover vignette-mask mix-blend-multiply transition-opacity duration-700 shadow-md rounded-md"
                          src={coverImageUrl}
                        />
                      </div>
                    </div>
                  )}
                  <p
                    className={`text-justify text-slate-800 dark:text-slate-200 drop-cap ${
                      isFirstParagraph ? "first-letter-ornate" : ""
                    }`}
                    // style={{
                    //   color: isFirstParagraph ? "rgb(236, 72, 153)" : undefined,
                    // }}
                  >
                    {paragraph}
                  </p>
                  {shouldAddSeparator && (
                    <div className="py-12 flex justify-center">
                      <div className="flex items-center gap-3">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-rose-400/40"></div>
                        <span className="material-symbols-outlined text-rose-500/70 text-lg">
                          favorite
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-rose-400/40"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </article>
          <div className="mt-24 mb-12 flex justify-between items-center border-t border-rose-400/20 pt-10">
            {hasPrevAccess ? (
              <button
                onClick={onNavigatePrev}
                className="flex items-center gap-2 text-charcoal/50 dark:text-white/50 hover:text-rose-500 transition-colors group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  arrow_back
                </span>
                <span className="text-sm font-semibold uppercase tracking-widest font-ornate">
                  Volume précédent
                </span>
              </button>
            ) : (
              <div />
            )}
            {hasNextAccess && (
              <button
                onClick={onNavigateNext}
                className="flex items-center gap-2 text-rose-500 hover:scale-105 transition-transform group">
                <span className="text-sm font-semibold uppercase tracking-widest font-ornate">
                  Volume suivant
                </span>
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  arrow_forward
                </span>
              </button>
            )}
          </div>
          {/* Footer Navigation */}
          {footer ? footer : ""}
        </div>
      </main>

      {/* Bottom Progress Indicator - PROTAGONIST Theme */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-charcoal-600 dark:bg-black/30 backdrop-blur px-6 py-4 flex flex-col items-center border-t border-rose-500/20">
        <div className="w-full max-w-[800px] flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase tracking-widest text-charcoal/60 dark:text-white/60 font-bold font-ornate">
            Lecture intime en cours
          </span>
          <span className="text-[10px] uppercase tracking-widest text-rose-500 font-bold font-ornate">
            {scrollProgress}% parcouru
          </span>
        </div>
        <div className="w-full max-w-[800px] h-1 bg-rose-500/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500/60 via-rose-400 to-rose-500/60 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.5)] transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}></div>
        </div>
      </footer>

      {/* Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-5 mix-blend-multiply"
        id="texture-overlay"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCun0EQcjBjiCTdnHOJgZTarDmGw709yp6EFjwQJVqOfJPpXCGA2dVGnbbryLC32uOcFACnOFMHbW_QYWx7pc4-eaP0rcW87VCju5ZRhEU9BhZSKoCdIhssIIE1fQ8XMDsdrVuuBN1ir1qWRA9O4DXi2fqaIS9t1K-ioACIQtpafqOhkb4DNaqi-GSnGcSOBM7xSJDIwzCRon4cbVPNc4KthOKux_Ox7gZumz9MtHcXAXeHcgz7adSjpMiycNm_cAbnsIqJ1pMkqjg')",
        }}></div>
    </div>
  );
}
