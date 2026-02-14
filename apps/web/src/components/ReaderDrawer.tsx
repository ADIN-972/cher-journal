import { useEffect } from "react";
import api from "../lib/api";
import { useToast } from "../hooks/useToast";
import { showSuccessToast, showErrorToast, showWarningToast } from "../lib/toastHelper";
import EndOfVolumeUI from "./EndOfVolumeUI";
import Reader from "../pages/Reader";

interface ReaderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  volumeId: string;
  chapterId: string;
  volumeNumber: number;
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
  nextVolume,
  onReadNext,
}: ReaderDrawerProps) {
  const toast = useToast();

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

  const handlePurchase = (type: "freeToRead" | "paywall" | "epilogue") => {
    // TODO: Implement Stripe checkout for each type
    toast.info(`Paiement ${type} à implémenter`);
    console.log("Purchase type:", type, "for chapter:", chapterId);
  };

  if (!isOpen) return null;

  return (
    <div id="reader-drawer" className="fixed inset-0 z-50 overflow-y-auto">
      <Reader
        volumeId={volumeId}
        onClose={onClose}
        scrollContainerId="reader-drawer"
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
