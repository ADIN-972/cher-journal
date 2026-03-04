import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";
import { useToast } from "../hooks/useToast";
import { useReaderStore } from "../stores/readerStore";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../lib/toastHelper";
import EndOfVolumeUI from "./EndOfVolumeUI";
import Reader from "../pages/Reader";
import ProtagonistReader from "../pages/ProtagonistReader";
import { Chapter } from "../stores/catalogStore";

interface ReaderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  volumeId: string;
  chapterId: string;
  volumeNumber: number;
  perspective?: "NARRATOR" | "PROTAGONIST";
  chapter: Chapter;
  onPurchasePerspective?: (volumeNumber: number) => void;
}

export default function ReaderDrawer({
  isOpen,
  onClose,
  volumeId,
  chapterId,
  volumeNumber,
  perspective,
  chapter,
  onPurchasePerspective,
}: ReaderDrawerProps) {
  const toast = useToast();
  const { currentVolume, isLoading, error } = useReaderStore();
  const [isPerspectivePurchasing, setIsPerspectivePurchasing] = useState(false);

  // ── Internal navigation state ─────────────────────────────────────────────
  const [currentVolumeId, setCurrentVolumeId] = useState(volumeId);
  const [currentVolumeNumber, setCurrentVolumeNumber] = useState(volumeNumber);

  // Reset when drawer opens with a new entry volume
  useEffect(() => {
    if (isOpen) {
      setCurrentVolumeId(volumeId);
      setCurrentVolumeNumber(volumeNumber);
    }
  }, [isOpen, volumeId, volumeNumber]);

  const perspectiveKey = perspective === "PROTAGONIST" ? "PROTAGONIST" : "NARRATOR";

  // ── Compute prev/next from chapter volumes ────────────────────────────────
  const prevVolume = useMemo(() => {
    const vol = chapter.volumes?.find(
      (v) => v.volumeNumber === currentVolumeNumber - 1,
    );
    if (!vol) return null;
    const access = vol.accessByPerspective?.[perspectiveKey];
    return {
      id: vol.id,
      volumeNumber: vol.volumeNumber,
      isAccessible: access?.isAccessible ?? false,
    };
  }, [chapter.volumes, currentVolumeNumber, perspectiveKey]);

  const nextVolume = useMemo(() => {
    const vol = chapter.volumes?.find(
      (v) => v.volumeNumber === currentVolumeNumber + 1,
    );
    if (!vol) return null;
    const access = vol.accessByPerspective?.[perspectiveKey];
    return {
      ...vol,
      isAccessible: access?.isAccessible ?? false,
      blockageType: access?.blockageType ?? undefined,
      blockageInfo: access?.blockageInfo,
    };
  }, [chapter.volumes, currentVolumeNumber, perspectiveKey]);

  // ── All accessible volumes (ordered) — passed to Reader for bulk loading ──
  const allAccessibleVolumeIds = useMemo(() => {
    if (!chapter.volumes) return [];
    return chapter.volumes
      .filter((v) => {
        const access = v.accessByPerspective?.[perspectiveKey];
        return access?.isAccessible === true;
      })
      .sort((a, b) => a.volumeNumber - b.volumeNumber)
      .map((v) => ({ id: v.id, volumeNumber: v.volumeNumber }));
  }, [chapter.volumes, perspectiveKey]);

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalVolumes = chapter.volumes?.length ?? 0;

  const allVolumesOwned = useMemo(() => {
    return (
      chapter.volumes?.every((vol) => {
        const access = vol.accessByPerspective?.[perspectiveKey];
        return access?.isAccessible === true && !access?.blockageType;
      }) ?? false
    );
  }, [chapter.volumes, perspectiveKey]);

  const chapterPrice = useMemo(() => {
    if (perspective === "PROTAGONIST") {
      const inaccessibleNonFreeVolumes =
        chapter.volumes?.filter((vol) => {
          const access = vol.accessByPerspective?.[perspectiveKey];
          return !vol.isFree && !access?.isAccessible;
        }) ?? [];
      const pricePerVolume = chapter.pricing?.priceProtagonistUnlock ?? 99;
      return inaccessibleNonFreeVolumes.length * pricePerVolume;
    } else {
      return chapter.pricing?.bundleDiscountedPrice;
    }
  }, [chapter.volumes, chapter.pricing, perspectiveKey, perspective]);

  // ── Navigation handlers ───────────────────────────────────────────────────
  const handleReadNext = (nextId: string, nextNumber: number) => {
    setCurrentVolumeId(nextId);
    setCurrentVolumeNumber(nextNumber);
  };

  const handleReadPrev = (prevId: string, prevNumber: number) => {
    setCurrentVolumeId(prevId);
    setCurrentVolumeNumber(prevNumber);
  };

  const handlePerspectivePurchase = (vNumber: number) => {
    if (onPurchasePerspective) {
      setIsPerspectivePurchasing(true);
      onPurchasePerspective(vNumber);
    }
  };

  // Block body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close drawer if content failed to load
  useEffect(() => {
    if (isOpen && !isLoading && !currentVolume && currentVolumeId && error) {
      onClose();
    }
  }, [isOpen, isLoading, currentVolume, currentVolumeId, error, onClose]);

  const handleStartWait = async () => {
    try {
      await api.startWait({ chapterId, volumeNumber: currentVolumeNumber + 1 });
      showSuccessToast(toast, "WAIT_STARTED");
      onClose();
    } catch (err: any) {
      console.error("Failed to start wait:", err);
      if (err.message?.includes("MAX_PENDING_CHAPTERS_REACHED")) {
        showWarningToast(toast, "WAIT_MAX_TIMERS_REACHED");
      } else if (err.message?.includes("WAIT_ALREADY_ACTIVE")) {
        showWarningToast(toast, "WAIT_ALREADY_ACTIVE");
      } else {
        showErrorToast(toast, "WAIT_START_FAILED");
      }
    }
  };

  const handlePurchase = async (
    type:
      | "freeToRead"
      | "protagonistVolume"
      | "paywall"
      | "epilogue"
      | "narratorChapter"
      | "protagonistChapter",
  ) => {
    if (!nextVolume?.id) {
      showErrorToast(toast, "CHECKOUT_SESSION_FAILED");
      return;
    }

    try {
      let url: string;

      if (type === "protagonistChapter") {
        const result = await api.createProtagonistCheckoutSession({
          chapterId,
          type: "CHAPTER",
          successUrl: `${window.location.origin}/chapters/${chapterId}/protagonist?purchase=success`,
          cancelUrl: `${window.location.origin}/chapters/${chapterId}/protagonist?purchase=cancelled`,
        });
        url = result.url;
      } else if (type === "protagonistVolume") {
        const result = await api.createProtagonistCheckoutSession({
          chapterId,
          type: "VOLUME",
          volumeNumber: nextVolume.volumeNumber,
          successUrl: `${window.location.origin}/chapters/${chapterId}/protagonist?purchase=success`,
          cancelUrl: `${window.location.origin}/chapters/${chapterId}/protagonist?purchase=cancelled`,
        });
        url = result.url;
      } else if (type === "narratorChapter") {
        const result = await api.createCheckoutSession({
          chapterId,
          type: "CHAPTER",
          scopes: ["BASE"],
          successUrl: `${window.location.origin}/chapters/${chapterId}?purchase=success`,
          cancelUrl: `${window.location.origin}/chapters/${chapterId}?purchase=cancelled`,
        });
        url = result.url;
      } else {
        const orderType: "CHAPTER" | "VOLUME" =
          type === "freeToRead" ? "VOLUME" : "CHAPTER";
        const result = await api.createCheckoutSession({
          chapterId,
          type: orderType,
          volumeNumber:
            type === "freeToRead" ? nextVolume.volumeNumber : undefined,
          scopes: ["BASE"],
          successUrl: `${window.location.origin}/chapters/${chapterId}?purchase=success`,
          cancelUrl: `${window.location.origin}/chapters/${chapterId}?purchase=cancelled`,
        });
        url = result.url;
      }

      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session:", err);
      showErrorToast(toast, "CHECKOUT_SESSION_FAILED");
    }
  };

  if (!isOpen) return null;

  const sharedProps = {
    volumeId: currentVolumeId,
    chapterId,
    perspective,
    onClose,
    scrollContainerId: "reader-drawer",
    onPurchasePerspective: handlePerspectivePurchase,
    isPurchasing: isPerspectivePurchasing,
    hasPrevAccess: !!(prevVolume?.isAccessible && prevVolume?.id),
    hasNextAccess: !!(nextVolume?.isAccessible && nextVolume?.id),
    onNavigatePrev: () => {
      if (prevVolume?.id && prevVolume?.volumeNumber) {
        handleReadPrev(prevVolume.id, prevVolume.volumeNumber);
      }
    },
    onNavigateNext: () => {
      if (nextVolume?.id && nextVolume?.volumeNumber) {
        handleReadNext(nextVolume.id, nextVolume.volumeNumber);
      }
    },
    footer: (
      <>
        <EndOfVolumeUI
          volumeNumber={currentVolumeNumber}
          chapterId={chapterId}
          perspective={perspective}
          nextVolume={nextVolume}
          onClose={onClose}
          onStartWait={handleStartWait}
          onPurchase={handlePurchase}
          onReadNext={handleReadNext}
          totalVolumes={totalVolumes}
          allVolumesOwned={allVolumesOwned}
          chapterPrice={chapterPrice}
        />
      </>
    ),
  };

  return (
    <div
      id="reader-drawer"
      className="fixed inset-0 z-50 overflow-y-auto">
      {perspective === "PROTAGONIST" ? (
        <ProtagonistReader {...sharedProps} />
      ) : (
        <Reader
          {...sharedProps}
          allVolumeIds={allAccessibleVolumeIds}
        />
      )}
    </div>
  );
}
