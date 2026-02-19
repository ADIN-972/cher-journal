import { useEffect, useState } from "react";
import api from "../lib/api";
import { useToast } from "../hooks/useToast";
import { useReaderStore } from "../stores/readerStore";
import { showSuccessToast, showErrorToast, showWarningToast } from "../lib/toastHelper";
import EndOfVolumeUI from "./EndOfVolumeUI";
import Reader from "../pages/Reader";

interface ReaderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  volumeId: string;
  chapterId: string;
  volumeNumber: number;
  perspective?: 'NARRATOR' | 'PROTAGONIST';
  nextVolume?: {
    id?: string;
    volumeNumber?: number;
    isAccessible?: boolean;
    blockageType?: string;
    blockageInfo?: any;
  } | null;
  onReadNext?: (volumeId: string, volumeNumber: number) => void;
}

export default function ReaderDrawer({
  isOpen,
  onClose,
  volumeId,
  chapterId,
  volumeNumber,
  perspective,
  nextVolume,
  onReadNext,
  onPurchasePerspective,
}: ReaderDrawerProps & {
  onPurchasePerspective?: (volumeNumber: number) => void;
}) {
  const toast = useToast();
  const { currentVolume, isLoading, error } = useReaderStore();
  const [isPerspectivePurchasing, setIsPerspectivePurchasing] = useState(false);

  const handlePerspectivePurchase = (volumeNumber: number) => {
    if (onPurchasePerspective) {
      setIsPerspectivePurchasing(true);
      onPurchasePerspective(volumeNumber);
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

  // Close drawer if content failed to load (only if there's an actual error)
  useEffect(() => {
    if (isOpen && !isLoading && !currentVolume && volumeId && error) {
      // Loading finished but no content AND there's an error - close the drawer
      onClose();
    }
  }, [isOpen, isLoading, currentVolume, volumeId, error, onClose]);

  const handleStartWait = async () => {
    try {
      await api.startWait({ chapterId, volumeNumber: volumeNumber + 1 });
      showSuccessToast(toast, 'WAIT_STARTED');
      onClose();
    } catch (err: any) {
      console.error("Failed to start wait:", err);
      if (err.message?.includes("MAX_PENDING_CHAPTERS_REACHED")) {
        showWarningToast(toast, 'WAIT_MAX_TIMERS_REACHED');
      } else if (err.message?.includes("WAIT_ALREADY_ACTIVE")) {
        showWarningToast(toast, 'WAIT_ALREADY_ACTIVE');
      } else {
        showErrorToast(toast, 'WAIT_START_FAILED');
      }
    }
  };

  const handlePurchase = async (type: "freeToRead" | "paywall" | "epilogue") => {
    if (!nextVolume?.id) {
      showErrorToast(toast, 'CHECKOUT_SESSION_FAILED');
      return;
    }

    try {
      let orderType: 'CHAPTER' | 'VOLUME';

      if (type === 'freeToRead') {
        // Individual volume purchase (volumes 1-8)
        orderType = 'VOLUME';
      } else {
        // Paywall or epilogue: purchase full chapter
        orderType = 'CHAPTER';
      }

      const { url } = await api.createCheckoutSession({
        chapterId,
        type: orderType,
        volumeNumber: type === 'freeToRead' ? nextVolume.volumeNumber : undefined,
        versionScope: "BASE",
        successUrl: `${window.location.origin}/chapters/${chapterId}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${chapterId}?purchase=cancelled`,
      });

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session:", err);
      showErrorToast(toast, 'CHECKOUT_SESSION_FAILED');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="reader-drawer"
      className="fixed inset-0 z-50 overflow-y-auto">
      <Reader
        volumeId={volumeId}
        chapterId={chapterId}
        perspective={perspective}
        onClose={onClose}
        scrollContainerId="reader-drawer"
        onPurchasePerspective={handlePerspectivePurchase}
        isPurchasing={isPerspectivePurchasing}
        footer={
          <EndOfVolumeUI
            volumeNumber={volumeNumber}
            chapterId={chapterId}
            nextVolume={nextVolume}
            onClose={onClose}
            onStartWait={handleStartWait}
            onPurchase={handlePurchase}
            onReadNext={onReadNext}
          />
        }
      />
    </div>
  );
}
