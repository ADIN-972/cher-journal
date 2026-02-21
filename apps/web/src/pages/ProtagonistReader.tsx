import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReaderStore } from "../stores/readerStore";
import { useThemeStore } from "../stores/themeStore";
import { useToast } from "../hooks/useToast";
import { showErrorToast } from "../lib/toastHelper";
import api from "../lib/api";
import PerspectiveUnlock from "../components/PerspectiveUnlock";

export default function ProtagonistReader({
  volumeId,
  footer,
  onClose,
  scrollContainerId,
  chapterId,
  onPurchasePerspective,
  isPurchasing,
  perspective,
}: {
  volumeId?: string;
  footer?: React.ReactNode;
  onClose?: () => void;
  scrollContainerId?: string;
  chapterId?: string;
  onPurchasePerspective?: (volumeNumber: number) => void;
  isPurchasing?: boolean;
  perspective?: 'NARRATOR' | 'PROTAGONIST';
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
    updateSettings,
  } = useReaderStore();
  const { isDark, toggleTheme } = useThemeStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    const perspectiveKey = perspective === 'PROTAGONIST' ? 'protagonist' : 'narrator';
    const loadKey = `${volumeId}-${perspectiveKey}`;

    if (volumeId && loadedVolumeIdRef.current !== loadKey) {
      loadedVolumeIdRef.current = loadKey;
      currentAttemptVolumeIdRef.current = volumeId;
      loadAttemptIdRef.current = `${volumeId}-${Date.now()}`;
      shownErrorForAttemptRef.current = null;
      console.log(`[ProtagonistReader] Starting new volume load: ${volumeId} with perspective: ${perspective}`);
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
        perspective: perspective || 'PROTAGONIST',
      });
      lastProgressSentRef.current = progress;
    } catch (error: any) {
      console.error(`[ProtagonistReader] PROGRESS_UPDATE_FAILED`, {
        volumeId: currentVolume?.id,
        volumeNumber: currentVolume?.volumeNumber,
        chapterId: chapterId ?? currentVolume?.chapterId,
        perspective: perspective || 'PROTAGONIST',
        progress,
        errorMessage: error?.message,
        errorCode: error?.code,
        cause: 'Failed to save reading progress to API (PROTAGONIST perspective)',
        timestamp: new Date().toISOString()
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
      shownErrorForAttemptRef.current !== currentAttemptId
    ) {
      if (error && isLoading === false) {
        console.log(`[ProtagonistReader] DISPLAYING_ERROR_TOAST`, {
          volumeId,
          error,
          currentAttemptId,
          attemptVolumeId,
          isLoading,
          cause: `API returned explicit error message: "${error}" (PROTAGONIST perspective)`,
          timestamp: new Date().toISOString()
        });
        shownErrorForAttemptRef.current = currentAttemptId;
        showErrorToast(toast, error);
      } else if (!currentVolume && isLoading === false) {
        console.log(`[ProtagonistReader] DISPLAYING_GENERIC_LOAD_ERROR`, {
          volumeId,
          currentAttemptId,
          currentVolumeExists: !!currentVolume,
          isLoading,
          cause: 'Volume failed to load without returning explicit error (PROTAGONIST perspective) - API may have returned null/undefined',
          timestamp: new Date().toISOString()
        });
        shownErrorForAttemptRef.current = currentAttemptId;
        showErrorToast(toast, "LOAD_ERROR");
      }
    } else if (currentAttemptId && attemptVolumeId !== volumeId) {
      console.log(`[ProtagonistReader] SKIPPING_ERROR_DISPLAY_WRONG_VOLUME`, {
        expectedVolumeId: volumeId,
        attemptVolumeId,
        currentAttemptId,
        cause: 'Error is for different volume than currently requested (PROTAGONIST perspective)'
      });
    }
  }, [error, currentVolume, isLoading, volumeId, toast]);

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

  // Handle font size changes
  const increaseFontSize = () => {
    if (settings.fontSize < 24) {
      updateSettings({ fontSize: settings.fontSize + 2 });
    }
  };

  const decreaseFontSize = () => {
    if (settings.fontSize > 14) {
      updateSettings({ fontSize: settings.fontSize - 2 });
    }
  };

  const increaseLineHeight = () => {
    if (settings.lineHeight < 2.5) {
      updateSettings({ lineHeight: settings.lineHeight + 0.1 });
    }
  };

  const decreaseLineHeight = () => {
    if (settings.lineHeight > 1.5) {
      updateSettings({ lineHeight: settings.lineHeight - 0.1 });
    }
  };

  const changeFontFamily = (fontFamily: "serif" | "sans-serif" | "mono") => {
    updateSettings({ fontFamily });
  };

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
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center py-6 px-10 pointer-events-none">
        <header className="flex w-full max-w-[960px] items-center justify-between whitespace-nowrap border border-rose-400/50 bg-white/70 dark:bg-background-dark/70 backdrop-blur-sm px-6 py-2 rounded-full pointer-events-auto shadow-lg shadow-rose-500/10">
          <div className="flex items-center gap-4 text-rose-500">
            <div className="size-6">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 42c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-14c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0-18C12.95 10 4 18.95 4 30c0 7.732 5.001 14.331 12 17.011V38c0-1.657 1.343-3 3-3s3 1.343 3 3v9.011C32.999 44.331 38 37.732 38 30c0-11.05-8.95-20-20-20z"
                  fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest hidden md:block font-ornate text-rose-600">
              Point de vue intime
            </h2>
          </div>

          <div className="relative flex gap-4 items-center">
            {onClose && (
              <>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center rounded-lg h-8 px-4 hover:bg-rose-500/20 text-rose-500 border border-rose-400/40 transition-all text-[10px] font-bold uppercase tracking-widest font-ornate">
                  Retour au chapitre
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-lg h-8 w-8 hover:bg-rose-500/10 text-rose-500 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center rounded-lg h-8 w-8 hover:bg-rose-500/10 text-rose-500 transition-colors">
              <span className="material-symbols-outlined">tune</span>
            </button>

            {/* Settings Menu Popup */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[60]"
                  onClick={() => setIsMenuOpen(false)}></div>

                <div className="fixed right-4 top-16 z-[70] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-rose-400/30 p-6 w-80 max-w-[calc(100vw-2rem)]">
                  <h3 className="text-lg font-serif mb-4 text-gray-900 dark:text-white">
                    Paramètres de lecture
                  </h3>

                  {/* Font Size */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Taille du texte
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={decreaseFontSize}
                        disabled={settings.fontSize <= 14}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined">
                          remove
                        </span>
                      </button>
                      <span className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
                        {settings.fontSize}px
                      </span>
                      <button
                        onClick={increaseFontSize}
                        disabled={settings.fontSize >= 24}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Line Height */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Espacement des lignes
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={decreaseLineHeight}
                        disabled={settings.lineHeight <= 1.5}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined">
                          remove
                        </span>
                      </button>
                      <span className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
                        {settings.lineHeight.toFixed(1)}
                      </span>
                      <button
                        onClick={increaseLineHeight}
                        disabled={settings.lineHeight >= 2.5}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Police de caractères
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => changeFontFamily("serif")}
                        className={`p-2 rounded-lg text-sm ${
                          settings.fontFamily === "serif"
                            ? "bg-rose-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}>
                        Serif
                      </button>
                      <button
                        onClick={() => changeFontFamily("sans-serif")}
                        className={`p-2 rounded-lg text-sm ${
                          settings.fontFamily === "sans-serif"
                            ? "bg-rose-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}>
                        Sans
                      </button>
                      <button
                        onClick={() => changeFontFamily("mono")}
                        className={`p-2 rounded-lg text-sm ${
                          settings.fontFamily === "mono"
                            ? "bg-rose-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}>
                        Mono
                      </button>
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Thème
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => isDark && toggleTheme()}
                        className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                          !isDark
                            ? "bg-rose-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}>
                        <span className="material-symbols-outlined text-sm">
                          light_mode
                        </span>
                        Clair
                      </button>
                      <button
                        onClick={() => !isDark && toggleTheme()}
                        className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                          isDark
                            ? "bg-rose-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}>
                        <span className="material-symbols-outlined text-sm">
                          dark_mode
                        </span>
                        Sombre
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>
      </div>

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
                    style={{
                      color: isFirstParagraph ? "rgb(236, 72, 153)" : undefined,
                    }}>
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

          {/* Footer Navigation */}
          {footer ? (
            footer
          ) : (
            <div className="mt-24 mb-12 flex justify-between items-center border-t border-rose-400/20 pt-10">
              <button
                onClick={() => navigate(`/chapter/${currentVolume.chapterId}`)}
                className="flex items-center gap-2 text-charcoal/50 dark:text-white/50 hover:text-rose-500 transition-colors group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  arrow_back
                </span>
                <span className="text-sm font-semibold uppercase tracking-widest font-ornate">
                  Retour au chapitre
                </span>
              </button>
              <button
                onClick={() => navigate(`/chapter/${currentVolume.chapterId}`)}
                className="flex items-center gap-2 text-rose-500 hover:scale-105 transition-transform group">
                <span className="text-sm font-semibold uppercase tracking-widest font-ornate">
                  Volume suivant
                </span>
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          )}
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
