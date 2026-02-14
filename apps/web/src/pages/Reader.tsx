import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReaderStore } from "../stores/readerStore";
import { useThemeStore } from "../stores/themeStore";
import { useToast } from "../hooks/useToast";
import { showErrorToast } from "../lib/toastHelper";
import api from "../lib/api";

export default function Reader({
  volumeId,
  footer,
  onClose,
  scrollContainerId,
  chapterId,
}: {
  volumeId?: string;
  footer?: React.ReactNode;
  onClose?: () => void;
  scrollContainerId?: string;
  chapterId?: string;
}) {
  //const { volumeId } = useParams<{ volumeId: string }>();
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

  const coverImageUrl = currentVolume?.illustrationUrl
    ? `${import.meta.env.VITE_API_URL ?? ""}${currentVolume.illustrationUrl}`
    : undefined;
  // Load volume on mount or when volumeId changes
  useEffect(() => {
    if (volumeId && !isLoading) {
      // Generate new attempt ID to track this load attempt
      loadAttemptIdRef.current = `${volumeId}-${Date.now()}`;
      loadVolume(volumeId);
    }
  }, [volumeId, isLoading, loadVolume]);

  // Send progress to API (debounced)
  const sendProgressToAPI = async (progress: number) => {
    if (!currentVolume) return;

    // Only send if progress increased by at least 5% or reached 100%
    const progressDiff = progress - lastProgressSentRef.current;
    if (progressDiff < 5 && progress < 100) return;

    try {
      await api.updateProgress({
        chapterId: chapterId ?? currentVolume.chapterId,
        volumeNumber: currentVolume.volumeNumber,
        progress,
      });
      lastProgressSentRef.current = progress;
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  // Handle error state with toast notification
  // Toast is shown independently from page navigation behavior
  // User can close the toast and navigate freely
  // Guarantees one toast per load attempt using attempt ID
  useEffect(() => {
    const currentAttemptId = loadAttemptIdRef.current;

    if (currentAttemptId && shownErrorForAttemptRef.current !== currentAttemptId) {
      if (error) {
        shownErrorForAttemptRef.current = currentAttemptId;
        showErrorToast(toast, error);
      } else if (!currentVolume && isLoading === false) {
        // Volume failed to load without explicit error
        shownErrorForAttemptRef.current = currentAttemptId;
        showErrorToast(toast, "LOAD_ERROR");
      }
    }
  }, [error, currentVolume, isLoading]);

  // Calculate scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      // Use scrollContainer if provided, otherwise use window
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

        // Save progress locally
        if (currentVolume) {
          saveProgress(currentVolume.id, scrollTop);
        }

        // Debounce API call - send after 2 seconds of no scrolling
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
      handleScroll(); // Initial calculation

      return () => {
        scrollTarget.removeEventListener("scroll", handleScroll);
        // Clear timeout on unmount
        if (progressUpdateTimeoutRef.current) {
          clearTimeout(progressUpdateTimeoutRef.current);
        }
      };
    }

    return () => {}; // Return empty cleanup function if no scrollTarget
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
      <div className="min-h-screen flex items-center justify-center bg-parchment dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-charcoal dark:text-white font-light">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!currentVolume) {
    return null;
  }

  // Split content into paragraphs
  const paragraphs = currentVolume.content
    .split("\n\n")
    .filter((p) => p.trim().length > 0);

  return (
    <div className="font-display transition-colors duration-500 overflow-x-auto  bg-background-light dark:bg-background-dark">
      {/* Book Curtains and Frame */}
      <div className="curtain-left hidden xl:block"></div>
      <div className="curtain-right hidden xl:block"></div>
      <div className="frame-top hidden xl:block"></div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center py-6 px-10 pointer-events-none">
        <header className="flex w-full max-w-[960px] items-center justify-between whitespace-nowrap border border-gold bg-white/60 dark:bg-background-dark/60 px-6 py-2 rounded-full pointer-events-auto shadow-sm">
          <div className="flex items-center gap-4 text-gold ">
            <div className="size-6">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                  fill="currentColor"
                  fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest hidden md:block font-ornate">
              Éros & Plume
            </h2>
          </div>

          <div className="relative flex gap-4 items-center">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center rounded-lg h-8 w-8 hover:bg-gold/10 text-gold  transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center rounded-lg h-8 w-8 hover:bg-gold/10 text-gold  transition-colors">
              <span className="material-symbols-outlined">tune</span>
            </button>

            {/* Settings Menu Popup */}
            {isMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[60]"
                  onClick={() => setIsMenuOpen(false)}></div>

                {/* Menu */}
                <div className="fixed right-4 top-16 z-[70] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gold/20 p-6 w-80 max-w-[calc(100vw-2rem)]">
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
                            ? "bg-primary text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}>
                        Serif
                      </button>
                      <button
                        onClick={() => changeFontFamily("sans-serif")}
                        className={`p-2 rounded-lg text-sm ${
                          settings.fontFamily === "sans-serif"
                            ? "bg-primary text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}>
                        Sans
                      </button>
                      <button
                        onClick={() => changeFontFamily("mono")}
                        className={`p-2 rounded-lg text-sm ${
                          settings.fontFamily === "mono"
                            ? "bg-primary text-white"
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
                            ? "bg-primary text-white"
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
                            ? "bg-primary text-white"
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
        className="flex flex-col items-center w-full min-h-screen pt-32 pb-48 px-6 bg-parchment dark:bg-background-dark">
        <div className="reading-container flex flex-col max-w-[800px] w-full  rounded-lg ">
          {/* Header Section */}
          <div className="mb-16">
            <div className="flex flex-col items-center">
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-gold to-transparent mb-4"></div>
              <p className="text-charcoal/60 dark:text-white/60 text-sm font-normal leading-normal uppercase tracking-[0.25em] font-ornate">
                {currentVolume.chapterTitle}
              </p>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-gold to-transparent mt-4"></div>
            </div>

            {/* Volume Illustration */}
            {/* {coverImageUrl && (
              <div className="flex justify-center my-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 rounded-lg blur opacity-75"></div>
                  <img
                    src={coverImageUrl}
                    alt={currentVolume.title}
                    className="relative rounded-lg shadow-2xl max-w-full h-auto max-h-[400px] object-cover border-2 border-gold/30"
                  />
                </div>
              </div>
            )} */}

            <h1 className="text-slate-900 dark:text-white font-ornate tracking-wide text-[26px] md:text-[40px] font-medium leading-tight text-center pb-6 pt-2 ">
              Vol {currentVolume.volumeNumber}: {currentVolume.title}
            </h1>
          </div>

          {/* Body Text */}
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
                          className="w-full h-full object-cover vignette-mask opacity-80 mix-blend-multiply transition-opacity duration-700 hover:opacity-100 shadow-md rounded-md"
                          src={coverImageUrl}
                        />
                      </div>
                    </div>
                  )}
                  <p
                    className={`text-justify text-slate-800 dark:text-slate-200  drop-cap   ${isFirstParagraph ? "first-letter-ornate" : ""}`}>
                    {paragraph}
                  </p>
                  {shouldAddSeparator && (
                    <div className="py-12 flex justify-center">
                      <div className="flex items-center gap-3">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40"></div>
                        <span className="material-symbols-outlined text-gold text-lg">
                          favorite
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </article>

          {/* Custom footer or default navigation */}
          {footer ? (
            footer
          ) : (
            <div className="mt-24 mb-12 flex justify-between items-center border-t border-gold/20 pt-10">
              <button
                onClick={() => navigate(`/chapter/${currentVolume.chapterId}`)}
                className="flex items-center gap-2 text-charcoal/50 dark:text-white/50 hover:text-gold transition-colors group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  arrow_back
                </span>
                <span className="text-sm font-semibold uppercase tracking-widest font-ornate">
                  Retour au chapitre
                </span>
              </button>
              <button
                onClick={() => navigate(`/chapter/${currentVolume.chapterId}`)}
                className="flex items-center gap-2 text-gold hover:scale-105 transition-transform group">
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

      {/* Bottom Progress Indicator */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-charcoal-600 dark:bg-black/30 backdrop-blur px-6 py-4 flex flex-col items-center">
        <div className="w-full max-w-[800px] flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase tracking-widest text-charcoal/60 dark:text-white/60 font-bold font-ornate">
            Lecture en cours
          </span>
          <span className="text-[10px] uppercase tracking-widest text-gold font-bold font-ornate">
            {scrollProgress}% complété
          </span>
        </div>
        <div className="w-full max-w-[800px] h-1 bg-gold/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold/60 rounded-full shadow-[0_0_8px_rgba(197,160,89,0.5)] transition-all duration-300"
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
