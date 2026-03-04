import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import WaitTimer from "../WaitTimer";
import { useToast } from "../../hooks/useToast";
import { showErrorToast } from "../../lib/toastHelper";

interface Wait {
  chapterId: string;
  chapterTitle: string;
  protagonistName: string;
  volumeNumber: number;
  unlocksAt: string;
  remainingMs?: number;
  volumePrice?: number;
  chapterPrice?: number;
  coverImageUrl?: string | null;
  volumeIllustrationUrl?: string | null;
}

const formatPrice = (cents: number): string => {
  return `${(cents / 100).toFixed(2)}€`;
};

export default function ActiveWaitsSection() {
  const toast = useToast();
  const [waits, setWaits] = useState<Wait[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingVolume, setLoadingVolume] = useState<string | null>(null);

  const handleBuyVolume = async (wait: Wait) => {
    setLoadingVolume(`${wait.chapterId}-${wait.volumeNumber}`);
    try {
      const { url } = await api.createCheckoutSession({
        chapterId: wait.chapterId,
        type: "VOLUME",
        volumeNumber: wait.volumeNumber,
        scopes: ["BASE"],
        successUrl: `${window.location.origin}/chapters/${wait.chapterId}?purchase=success`,
        cancelUrl: window.location.href,
      });
      window.location.href = url;
    } catch (err) {
      showErrorToast(toast, 'CHECKOUT_SESSION_FAILED');
      console.error("Checkout error:", err);
    } finally {
      setLoadingVolume(null);
    }
  };

  const handleBuyChapter = async (wait: Wait) => {
    setLoadingVolume(`${wait.chapterId}-chapter`);
    try {
      const { url } = await api.createCheckoutSession({
        chapterId: wait.chapterId,
        type: "CHAPTER",
        scopes: ["BASE"],
        successUrl: `${window.location.origin}/chapters/${wait.chapterId}?purchase=success`,
        cancelUrl: window.location.href,
      });
      window.location.href = url;
    } catch (err) {
      showErrorToast(toast, 'CHECKOUT_SESSION_FAILED');
      console.error("Checkout error:", err);
    } finally {
      setLoadingVolume(null);
    }
  };

  useEffect(() => {
    fetchActiveWaits();
  }, []);

  const fetchActiveWaits = async () => {
    try {
      setIsLoading(true);
      const data = await api.getActiveWaits();
      setWaits(data);
    } catch (err) {
      console.error("Failed to fetch active waits:", err);
      // Silently fail - don't show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh waits every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchActiveWaits, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return null;
  }

  if (waits.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-[#c5a059] text-2xl font-display italic font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">schedule</span>
        Timers en Cours
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
        {waits.map((wait) => (
          <div
            key={`${wait.chapterId}-${wait.volumeNumber}`}
            className="bg-gradient-to-br from-[#c5a059]/10 to-[#c5a059]/5 border border-[#c5a059]/30 rounded-xl p-4 flex flex-col gap-3">
            {/* Chapter Title */}
            <div className="flex-1">
              <p className="text-charcoal dark:text-white/80 font-display italic text-sm">
                <span className="font-bold">{wait.protagonistName}</span> :{" "}
                {wait.chapterTitle}
              </p>
              <p className="text-charcoal dark:text-white/50 text-xs mt-1">
                Volume {wait.volumeNumber}
              </p>
            </div>

            <div className="flex flex-row items-center gap-3">
              {/* Cover Image */}
              {(wait.volumeIllustrationUrl || wait.coverImageUrl) && (
                <div className="rounded-lg overflow-hidden h-40 bg-black/20">
                  <img
                    src={
                      wait.volumeIllustrationUrl ||
                      wait.coverImageUrl ||
                      undefined
                    }
                    alt={`${wait.chapterTitle} Volume ${wait.volumeNumber}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="">
                {/* Timer */}
                <div className="bg-white/5 rounded-lg p-3 flex justify-center">
                  <WaitTimer
                    remainingMs={
                      wait.remainingMs ||
                      Math.max(
                        0,
                        new Date(wait.unlocksAt).getTime() - Date.now(),
                      )
                    }
                    variant="badge"
                    chapterTitle={wait.chapterTitle}
                    volumeNumber={wait.volumeNumber}
                    onComplete={fetchActiveWaits}
                  />
                </div>
                {/* Status Badge */}
                <div className="flex items-center gap-2 text-[#c5a059]">
                  <span className="material-symbols-outlined text-base animate-pulse">
                    schedule
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Déverrouillage en cours
                  </span>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#c5a059]/20">
              <button
                type="button"
                onClick={() => handleBuyVolume(wait)}
                disabled={
                  loadingVolume === `${wait.chapterId}-${wait.volumeNumber}`
                }
                className="bg-[#c5a059]/20 hover:bg-[#c5a059]/30 disabled:bg-gray-500/20 text-[#c5a059] disabled:text-gray-500 border border-[#c5a059]/40 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between gap-2">
                <span className="">
                  <span className="material-symbols-outlined text-sm">
                    {loadingVolume === `${wait.chapterId}-${wait.volumeNumber}`
                      ? "hourglass_empty"
                      : "shopping_cart"}
                  </span>
                  Acheter Vol. {wait.volumeNumber}
                </span>
                <span className="">
                  {wait.volumePrice !== undefined && (
                    <span className="text-[#c5a059] font-bold">
                      {formatPrice(wait.volumePrice)}
                    </span>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleBuyChapter(wait)}
                disabled={loadingVolume === `${wait.chapterId}-chapter`}
                className="bg-primary/20 hover:bg-primary/30 disabled:bg-gray-500/20 text-white disabled:text-gray-500 border border-primary/40 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between gap-2">
                <span className="">
                  <span className="material-symbols-outlined text-sm">
                    {loadingVolume === `${wait.chapterId}-chapter`
                      ? "hourglass_empty"
                      : "collections_bookmark"}
                  </span>
                  Acheter L'Intégrale
                </span>
                <span className="">
                  {wait.chapterPrice !== undefined && (
                    <span className="text-white font-bold">
                      {formatPrice(wait.chapterPrice)}
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-charcoal dark:text-white/50 text-xs mt-4 italic">
        💡 Les timers se terminent automatiquement. Revenez bientôt pour
        découvrir la suite!
      </p>
    </div>
  );
}
