import { useEffect, useRef, useState, useCallback } from "react";
import { useReaderStore } from "../stores/readerStore";
import { useToast } from "../hooks/useToast";
import { showErrorToast } from "../lib/toastHelper";
import api from "../lib/api";
import ReaderHeader from "../components/reader/ReaderHeader";
import FlipBook, { type VolumeLayer } from "../components/reader/FlipBook";

// Shape returned by api.getVolumeText
interface PreloadedVolume {
  id: string;
  volumeId: string;
  title: string;
  chapterId: string;
  chapterTitle: string;
  volumeNumber: number;
  content: string;
  illustrationUrl: string | null;
}

export default function Reader({
  volumeId,
  allVolumeIds,
  footer,
  onClose,
  chapterId,
  onPurchasePerspective,
  isPurchasing,
  perspective,
  hasPrevAccess,
  hasNextAccess,
  onNavigatePrev,
  onNavigateNext,
  scrollContainerId: _scrollContainerId,
}: {
  volumeId?: string;
  /** Ordered list of ALL accessible volume IDs in this chapter. */
  allVolumeIds?: { id: string; volumeNumber: number }[];
  footer?: React.ReactNode;
  onClose?: () => void;
  chapterId?: string;
  onPurchasePerspective?: (volumeNumber: number) => void;
  isPurchasing?: boolean;
  perspective?: "NARRATOR" | "PROTAGONIST";
  hasPrevAccess?: boolean;
  hasNextAccess?: boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  scrollContainerId?: string;
}) {
  const toast = useToast();
  const { currentVolume, isLoading, error, settings, loadVolume } =
    useReaderStore();

  const loadAttemptIdRef = useRef<string | null>(null);
  const shownErrorForAttemptRef = useRef<string | null>(null);
  const loadedVolumeIdRef = useRef<string | null>(null);
  const currentAttemptVolumeIdRef = useRef<string | null>(null);
  const lastProgressSentRef = useRef<number>(0);
  const progressUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [pageProgress, setPageProgress] = useState(0);

  // ── Volume cache — keyed by `${id}-${perspective}` ───────────────────────
  const volumeCacheRef = useRef<Record<string, PreloadedVolume>>({});

  // ── All loaded volumes (ordered by volumeNumber) ──────────────────────────
  const [loadedVolumes, setLoadedVolumes] = useState<VolumeLayer[]>([]);

  // Helper to add/update a volume in the ordered array
  const addToLoaded = useCallback((data: PreloadedVolume, illustrationUrl: string | null) => {
    const layer: VolumeLayer = {
      id: data.volumeId || data.id,
      content: data.content,
      chapterTitle: data.chapterTitle,
      volumeTitle: data.title,
      volumeNumber: data.volumeNumber,
      coverImageUrl: illustrationUrl
        ? `${import.meta.env.VITE_API_URL ?? ""}${illustrationUrl}`
        : null,
    };
    setLoadedVolumes((prev) => {
      // Replace if already exists, insert sorted by volumeNumber otherwise
      const idx = prev.findIndex((v) => v.id === layer.id);
      if (idx >= 0) {
        if (prev[idx].content === layer.content) return prev; // no change
        const next = [...prev];
        next[idx] = layer;
        return next;
      }
      const inserted = [...prev, layer].sort(
        (a, b) => (a.volumeNumber ?? 0) - (b.volumeNumber ?? 0),
      );
      return inserted;
    });
  }, []);

  // ── Load current volume via store ─────────────────────────────────────────
  useEffect(() => {
    const perspectiveKey =
      perspective === "PROTAGONIST" ? "protagonist" : "narrator";
    const loadKey = `${volumeId}-${perspectiveKey}`;

    if (volumeId && loadedVolumeIdRef.current !== loadKey) {
      loadedVolumeIdRef.current = loadKey;
      currentAttemptVolumeIdRef.current = volumeId;
      loadAttemptIdRef.current = `${volumeId}-${Date.now()}`;
      shownErrorForAttemptRef.current = null;
      lastProgressSentRef.current = 0;
      loadVolume(volumeId, perspectiveKey);
    }
  }, [volumeId, loadVolume, perspective]);

  // When the store delivers the current volume, add it to our loaded list
  useEffect(() => {
    if (!currentVolume) return;
    addToLoaded(currentVolume as unknown as PreloadedVolume, currentVolume.illustrationUrl ?? null);
  }, [currentVolume, addToLoaded]);

  // ── Reading session heartbeat ──────────────────────────────────────────────
  const readingSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentVolume) return;

    // Start reading session
    api.post('/reader/reading-session/start', {
      chapterId: currentVolume.chapterId,
      volumeNumber: currentVolume.volumeNumber,
      perspective: perspective === 'PROTAGONIST' ? 'PROTAGONIST' : 'NARRATOR',
    }).then((res: any) => {
      readingSessionIdRef.current = res.data?.sessionId || null;
    }).catch(() => {});

    // Send heartbeat every 30 seconds
    const interval = setInterval(() => {
      if (readingSessionIdRef.current) {
        api.post('/reader/reading-session/heartbeat', {
          sessionId: readingSessionIdRef.current,
          elapsedSeconds: 10,
          progress: 0,
        }).catch(() => {});
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      readingSessionIdRef.current = null;
    };
  }, [currentVolume?.volumeId, perspective]);

  // ── Load all volumes in the chapter progressively ─────────────────────────
  useEffect(() => {
    if (!allVolumeIds?.length) return;

    const perspectiveUpper =
      perspective === "PROTAGONIST" ? "PROTAGONIST" : "NARRATOR";

    // Skip current volume (already loaded via store) and already-cached ones
    const toFetch = allVolumeIds.filter((v) => {
      if (v.id === volumeId) return false; // handled by store
      const cacheKey = `${v.id}-${perspectiveUpper}`;
      return !volumeCacheRef.current[cacheKey];
    });

    // Fetch remaining volumes with a small stagger to avoid hammering the API
    toFetch.forEach((v, i) => {
      setTimeout(() => {
        const cacheKey = `${v.id}-${perspectiveUpper}`;
        if (volumeCacheRef.current[cacheKey]) return; // double-check

        api
          .getVolumeText(v.id, perspectiveUpper)
          .then((data) => {
            const preloaded = data as PreloadedVolume;
            volumeCacheRef.current[cacheKey] = preloaded;
            addToLoaded(preloaded, preloaded.illustrationUrl);
          })
          .catch((err) => {
            console.warn(`[Reader] PRELOAD_FAILED vol ${v.id}`, err?.message);
          });
      }, i * 200); // 200 ms stagger between each fetch
    });
  }, [allVolumeIds, volumeId, perspective, addToLoaded]);

  // ── Progress reporting ────────────────────────────────────────────────────
  const handlePageProgress = useCallback(
    (pct: number) => {
      setPageProgress(pct);
      if (!currentVolume) return;
      const diff = pct - lastProgressSentRef.current;
      if (diff < 5 && pct < 100) return;

      if (progressUpdateTimeoutRef.current)
        clearTimeout(progressUpdateTimeoutRef.current);
      progressUpdateTimeoutRef.current = setTimeout(async () => {
        try {
          await api.updateProgress({
            chapterId: chapterId ?? currentVolume.chapterId,
            volumeNumber: currentVolume.volumeNumber,
            progress: pct,
            perspective: perspective || "NARRATOR",
          });
          lastProgressSentRef.current = pct;
        } catch (err: any) {
          console.error("[Reader] PROGRESS_UPDATE_FAILED", err?.message);
        }
      }, 2000);
    },
    [currentVolume, chapterId, perspective],
  );

  // ── Error toast ───────────────────────────────────────────────────────────
  useEffect(() => {
    const currentAttemptId = loadAttemptIdRef.current;
    const attemptVolumeId = currentAttemptVolumeIdRef.current;

    if (
      currentAttemptId &&
      attemptVolumeId === volumeId &&
      shownErrorForAttemptRef.current !== currentAttemptId &&
      error &&
      !isLoading
    ) {
      shownErrorForAttemptRef.current = currentAttemptId;
      showErrorToast(toast, error);
    }
  }, [error, isLoading, volumeId, toast]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading && loadedVolumes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-charcoal dark:text-white font-light">
            Chargement…
          </p>
        </div>
      </div>
    );
  }

  if (loadedVolumes.length === 0 || !volumeId) return null;

  return (
    <div className="font-display transition-colors duration-500 bg-background-light dark:bg-background-dark">
      <div className="curtain-left hidden xl:block" />
      <div className="curtain-right hidden xl:block" />
      <div className="frame-top hidden xl:block" />

      <ReaderHeader
        onClose={onClose}
        perspective={perspective}
      />

      <FlipBook
        volumes={loadedVolumes}
        currentVolumeId={volumeId}
        fontSize={settings.fontSize}
        fontFamily={settings.fontFamily}
        lineHeight={settings.lineHeight}
        footer={footer}
        hasPrevAccess={hasPrevAccess}
        hasNextAccess={hasNextAccess}
        onNavigatePrev={onNavigatePrev}
        onNavigateNext={onNavigateNext}
        onPageProgress={handlePageProgress}
      />
    </div>
  );
}
