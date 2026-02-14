import { useEffect } from "react";
import api from "../lib/api";
import { useToast } from "../hooks/useToast";
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
      toast.success(
        "Compte à rebours démarré ! Le volume suivant se débloquera automatiquement.",
      );
      onClose();
    } catch (err: any) {
      console.error("Failed to start wait:", err);
      if (err.message?.includes("MAX_PENDING_CHAPTERS_REACHED")) {
        toast.warning(
          "Vous avez déjà 2 chapitres en attente. Veuillez patienter avant d'en démarrer un nouveau.",
        );
      } else if (err.message?.includes("WAIT_ALREADY_ACTIVE")) {
        toast.warning("Un compte à rebours est déjà actif pour ce chapitre.");
      } else {
        toast.error(
          "Erreur lors du démarrage du compte à rebours. Veuillez réessayer.",
        );
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
