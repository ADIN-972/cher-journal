import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useCatalogStore } from "../stores/catalogStore";
import api from "../lib/api";
import ReaderDrawer from "../components/ReaderDrawer";
import PurchaseDrawer from "../components/PurchaseDrawer";
import ErrorMessage from "../components/common/ErrorMessage";
import ChapterCover from "../components/common/ChapterCover";
import PricingSection from "../components/PricingSection";
import ReviewsSection from "../components/ReviewsSection";
import { useToast } from "../hooks/useToast";
import WaitTimer from "../components/WaitTimer";
import { NotificationService } from "../lib/notifications";

export default function Chapter() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentChapter, isLoading, error, fetchChapter } = useCatalogStore();
  const { showToast, ToastContainer } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isStartingWait, setIsStartingWait] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<{
    id: string;
    volumeNumber: number;
  } | null>(null);
  const [selectedVolumeForPurchase, setSelectedVolumeForPurchase] =
    useState<any>(null);
  const [activeWaitsCount, setActiveWaitsCount] = useState(0);
  const [maxWaitsAllowed, setMaxWaitsAllowed] = useState(2); // Default fallback

  // Fetch active waits count
  const fetchActiveWaitsCount = async () => {
    try {
      const response = await api.get("/wait/active");
      if (response.success && response.data) {
        setActiveWaitsCount(response.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch active waits:", error);
    }
  };

  // Fetch wait configuration
  const fetchWaitConfig = async () => {
    try {
      const config = await api.getWaitConfig();
      setMaxWaitsAllowed(config.maxSimultaneousTimers);
    } catch (error) {
      console.error("Failed to fetch wait config:", error);
      // Keep default value of 2 on error
    }
  };

  useEffect(() => {
    if (id) {
      fetchChapter(id);
      fetchActiveWaitsCount();
      fetchWaitConfig();
    }
  }, [id, fetchChapter]);

  // Handle payment return (success or cancelled)
  useEffect(() => {
    const purchaseStatus = searchParams.get("purchase");

    if (purchaseStatus === "success") {
      showToast({
        message:
          "Paiement effectué avec succès ! Vous avez maintenant accès au contenu.",
        type: "success",
      });
      // Remove the query parameter from URL
      setSearchParams({});
      // Refresh chapter data to get updated access
      if (id) {
        fetchChapter(id);
      }
    } else if (purchaseStatus === "cancelled") {
      showToast({
        message:
          "Le paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.",
        type: "info",
      });
      // Remove the query parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, showToast, id, fetchChapter]);

  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Handle opening volume in reader drawer
  const handleOpenVolume = (volume: any) => {
    if (volume.isAccessible || volume.isUnlocked) {
      setSelectedVolume({
        id: volume.id,
        volumeNumber: volume.volumeNumber,
      });
      setReaderOpen(true);
    } else {
      // Open purchase drawer for locked volumes
      setSelectedVolumeForPurchase(volume);
      setPurchaseDrawerOpen(true);
    }
  };

  // Handle purchase of single volume
  const handlePurchaseVolume = async () => {
    if (!id || !selectedVolumeForPurchase) return;

    try {
      setIsPurchasing(true);
      const { url } = await api.createCheckoutSession({
        chapterId: id,
        type: "VOLUME",
        volumeNumber: selectedVolumeForPurchase.volumeNumber,
        versionScope: "BASE",
        successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session for volume:", err);
      const errorMessage = err.response?.data?.error?.message || "Erreur lors de la création de la session de paiement.";
      showToast({
        message: errorMessage,
        type: "error",
      });
      setIsPurchasing(false);
    }
  };

  // Handle purchase of full chapter
  const handlePurchaseFullChapter = async () => {
    if (!id) return;

    try {
      setIsPurchasing(true);
      const { url } = await api.createCheckoutSession({
        chapterId: id,
        type: "CHAPTER",
        versionScope: "BASE",
        successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session:", err);
      showToast({
        message:
          "Erreur lors de la création de la session de paiement. Veuillez réessayer.",
        type: "error",
      });
      setIsPurchasing(false);
    }
  };

  const getReadingTime = (characterCount: number) => {
    const wordsPerMinute = 200;
    const averageWordLength = 5;
    const words = characterCount / averageWordLength;
    return Math.round(words / wordsPerMinute);
  };

  // Handle reading next volume from EndOfVolumeUI
  const handleReadNext = (nextVolumeId: string, nextVolumeNumber: number) => {
    setSelectedVolume({
      id: nextVolumeId,
      volumeNumber: nextVolumeNumber,
    });
    // Reader will automatically load the new volume since volumeId prop changed
  };

  // Handle purchase/unlock
  const handleUnlock = async () => {
    if (!id) return;

    // If user already has access, open last accessible volume in drawer
    if (currentChapter?.hasAccess) {
      const accessibleVolumes =
        currentChapter.volumes?.filter((v) => v.isAccessible || v.isUnlocked) ||
        [];

      // Find the last accessible volume
      const lastAccessibleVolume =
        accessibleVolumes[accessibleVolumes.length - 1];

      if (lastAccessibleVolume) {
        handleOpenVolume(lastAccessibleVolume);
        return;
      }
    }

    // Otherwise, redirect to Stripe checkout
    try {
      setIsPurchasing(true);

      const { url } = await api.createCheckoutSession({
        chapterId: id,
        type: "CHAPTER",
        versionScope: "BASE", // Default to narrator perspective only
        successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session:", err);
      showToast({
        message:
          "Erreur lors de la création de la session de paiement. Veuillez réessayer.",
        type: "error",
      });
      setIsPurchasing(false);
    }
  };

  // Handle start wait-to-read timer
  const handleStartWait = async (volumeNumber: number) => {
    if (!id) return;

    try {
      setIsStartingWait(true);

      // Request notification permission when starting a timer
      await NotificationService.requestPermission();

      await api.startWait({
        chapterId: id,
        volumeNumber,
      });

      // Refresh chapter data to get updated unlock status
      await fetchChapter(id);
      await fetchActiveWaitsCount();

      showToast({
        message: "Compte à rebours démarré avec succès !",
        type: "success",
      });

      setIsStartingWait(false);
    } catch (err: any) {
      console.error("Failed to start wait timer:", err);

      if (err.message?.includes("MAX_PENDING_CHAPTERS_REACHED")) {
        showToast({
          message:
            "Vous avez déjà 2 chapitres en attente. Veuillez patienter avant d'en démarrer un nouveau.",
          type: "warning",
        });
      } else if (err.message?.includes("WAIT_ALREADY_ACTIVE")) {
        showToast({
          message: "Un compte à rebours est déjà actif pour ce chapitre.",
          type: "info",
        });
      } else {
        showToast({
          message:
            "Erreur lors du démarrage du compte à rebours. Veuillez réessayer.",
          type: "error",
        });
      }

      setIsStartingWait(false);
    }
  };

  // Determine button text based on accessible volumes
  const accessibleVolumes =
    currentChapter?.volumes?.filter((v) => v.isAccessible || v.isUnlocked) ||
    [];
  const onlyFirstVolumeAccessible =
    accessibleVolumes.length === 1 && accessibleVolumes[0]?.volumeNumber === 1;
  const readButtonText = onlyFirstVolumeAccessible
    ? "Commencer la lecture"
    : "Continuer la lecture";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-charcoal dark:text-white/70 font-light">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (error || !currentChapter) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          to="/catalogue"
          className="text-primary hover:underline mb-4 inline-block">
          ← Retour au catalogue
        </Link>
        <ErrorMessage
          title="Erreur de chargement"
          message={error || "Chapitre introuvable"}
          onRetry={() => id && fetchChapter(id)}
          variant="inline"
        />
      </div>
    );
  }

  const coverImageUrl = currentChapter.coverAsset?.url
    ? `${import.meta.env.VITE_API_URL ?? ""}${currentChapter.coverAsset.url}`
    : null;

  // Calculate total reading time (rough estimate)
  const totalReadingTime =
    currentChapter.volumes?.reduce(
      (acc, vol) => acc + (vol.wordCount || 0),
      0,
    ) || 0;
  const readingHours = Math.floor(totalReadingTime / 200 / 60); // ~200 words per minute
  const readingMinutes = Math.floor((totalReadingTime / 200) % 60);

  // Calculate average rating (placeholder)
  const rating = 4.9;
  const reviewCount = 124;

  return (
    <>
      <ToastContainer />
      <main className="max-w-7xl mx-auto px-6 py-10 text-charcoal dark:text-white/70 dark:text-white">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link
            className="hover:text-primary transition-colors"
            to="/">
            Accueil
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <Link
            className="hover:text-primary transition-colors"
            to="/catalogue">
            Catalogue
          </Link>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="text-gray-900 dark:text-gray-100">
            {currentChapter.title}
          </span>
        </div>

        {/* Product Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-12 gap-12 mb-16">
          {/* Cover Image */}
          <div className="lg:col-span-4">
            <ChapterCover
              imageUrl={coverImageUrl}
              title={currentChapter.title}
              showPremiumBadge={true}
              showLimitedEditionBadge={true}
            />
          </div>
          {/* Details Section */}
          <div className="lg:col-span-8 flex flex-col justify-center ">
            <div className="flex gap-4 mb-4">
              <span className="flex items-center gap-1 text-accent-gold text-sm font-semibold italic">
                <span className="material-symbols-outlined text-sm gold-fill">
                  star
                </span>
                {rating} ({reviewCount} avis)
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-400">
                Temps de lecture :{" "}
                {getReadingTime(currentChapter.totalCharacterCount || 0)} min
              </span>
            </div>

            <h1
              className="text-umber dark:text-white text-5xl lg:text-7xl font-medium mb-6 leading-tight italic"
              style={{ fontFamily: "newsreader, serif" }}>
              {currentChapter.title}
            </h1>

            <div className="space-y-6 max-w-2xl">
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed italic newsreader">
                Plongez dans un récit où la passion rencontre le mystère. Dans
                le silence feutré d'un manoir oublié, deux âmes s'apprivoisent
                entre secrets interdits et caresses volées.
              </p>
              <p className="text-base text-gray-500 dark:text-gray-400  newsreader">
                Ce conte vous transporte à travers des paysages oniriques et des
                rencontres d'une intensité rare, écrit avec une plume délicate
                et envoûtante par {currentChapter.protagonistName || "l'auteur"}
                .
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <button
                onClick={handleUnlock}
                disabled={isPurchasing}
                className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-transform active:scale-95 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined">
                  {isPurchasing
                    ? "hourglass_empty"
                    : currentChapter.hasAccess
                      ? "auto_stories"
                      : "shopping_cart"}
                </span>
                {isPurchasing
                  ? "Chargement..."
                  : currentChapter.hasAccess
                    ? readButtonText
                    : "Débloquer l'aventure"}
              </button>
              {!currentChapter.hasAccess &&
                currentChapter.pricing?.bundleDiscountedPrice && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                      Prix de l'œuvre
                    </span>
                    <span className="text-2xl font-display font-bold">
                      {(
                        currentChapter.pricing.bundleDiscountedPrice / 100
                      ).toFixed(2)}{" "}
                      €
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 border-b border-white/10 pb-4 newsreader italic">
            Table des Matières
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {currentChapter.volumes && currentChapter.volumes.length > 0 ? (
              (() => {
                // Filter volumes: show all accessible + first non-accessible
                const volumes = currentChapter.volumes || [];
                const firstLockedIndex = volumes.findIndex(
                  (v) => !v.isAccessible,
                );
                const displayedVolumes =
                  firstLockedIndex === -1
                    ? volumes // All volumes are accessible
                    : volumes.slice(0, firstLockedIndex + 1); // All accessible + first locked

                return displayedVolumes.map((volume, index) => {
                  // Use isAccessible from API response
                  const isUnlocked = volume.isAccessible || false;

                  // Determine blockage type from API response
                  const blockageType = volume.blockageType;
                  const blockageInfo = volume.blockageInfo || {};

                  // Map blockage types to UI states
                  const needsUpgrade =
                    blockageType === "PAYWALL" || blockageType === "EPILOGUE";
                  const needsEntitlement = blockageType === "WAIT_OR_PAY";

                  // Check if wait timer is active
                  const hasActiveWait =
                    blockageInfo.waitRemaining &&
                    blockageInfo.waitRemaining > 0;

                  // Backend determines if user can start wait timer
                  const canStartWait = volume.canStartWait || false;
                  const progression = volume.progress || 0;
                  return (
                    <div
                      key={volume.id}
                      onClick={() => handleOpenVolume(volume)}
                      className={`relative grid grid-cols-[1fr_auto] group flex items-center justify-between p-8  border  rounded-xl hover:border-rose-gold/40 hover:bg-rose-gold/[0.02] transition-all silk-shadow overflow-hidden cursor-pointer ${
                        isUnlocked
                          ? "bg-white dark:bg-opacity-10 dark:border-opacity-30 border-silk-border"
                          : "bg-white/40 dark:bg-black/20 border-silk-border/50  grayscale hover:grayscale-0 hover:opacity-100 transition-all"
                      }`}>
                      <div className=" grid grid-cols-[auto_1fr] w-full items-center gap-8">
                        <div
                          className={`text-3xl font-display group-hover:text-rose-gold transition-colors ${isUnlocked ? " text-rose-gold/30" : "text-umber dark:text-gray-400 text-opacity-20 "} `}>
                          {String(volume.volumeNumber).padStart(2, "0")}
                        </div>
                        <div className="">
                          <h3
                            className={`text-lg font-bold group-hover:text-terracotta transition-colors  ${isUnlocked ? "  text-terracotta" : "text-umber dark:text-gray-400 text-opacity-50"}`}>
                            {volume.title}
                          </h3>
                          <p className="text-sm text-gray-400 italic">
                            {isUnlocked
                              ? "Une histoire captivante..."
                              : needsUpgrade
                                ? "Volume Premium - Mise à niveau requise"
                                : needsEntitlement
                                  ? "Déverrouillez pour découvrir ce chapitre secret..."
                                  : hasActiveWait
                                    ? "Compte à rebours en cours..."
                                    : "Volume verrouillé"}
                          </p>
                          {isUnlocked && (
                            <div className="">
                              <div className="w-full bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-gold h-full rounded-full"
                                  style={{ width: `${progression}%` }}></div>
                              </div>
                              <p
                                className={`${progression === 0 ? "text-black/40 dark:text-white/40" : "text-gold"}  text-[10px] uppercase font-bold mt-1 tracking-widest`}>
                                {`${progression >= 100 ? "Terminé" : progression === 0 ? "Pas commencé" : `${progression}% Lu`}`}{" "}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {isUnlocked ? (
                        <span className="material-symbols-outlined rose-gold-fill text-2xl opacity-60">
                          check_circle
                        </span>
                      ) : needsUpgrade ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Navigate to upgrade page
                            alert("Fonctionnalité de mise à niveau à venir");
                          }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition-all">
                          <span className="material-symbols-outlined text-sm">
                            upgrade
                          </span>
                          Mettre à niveau
                        </button>
                      ) : hasActiveWait ? (
                        <div className="flex flex-col gap-2 items-center">
                          <WaitTimer
                            remainingMs={blockageInfo.waitRemaining || 0}
                            variant="badge"
                            onComplete={() => {
                              // Refresh chapter data when timer completes
                              if (id) fetchChapter(id);
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlock();
                            }}
                            disabled={isPurchasing}
                            className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all">
                            <span className="material-symbols-outlined text-sm">
                              {isPurchasing
                                ? "hourglass_empty"
                                : "shopping_cart"}
                            </span>
                            {isPurchasing
                              ? "Chargement..."
                              : `Acheter le volume ${volume.volumeNumber}`}
                          </button>
                        </div>
                      ) : canStartWait ? (
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlock();
                            }}
                            disabled={isPurchasing}
                            className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all">
                            <span className="material-symbols-outlined text-sm">
                              {isPurchasing
                                ? "hourglass_empty"
                                : "shopping_cart"}
                            </span>
                            {isPurchasing
                              ? "Chargement..."
                              : "Acheter le chapitre"}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartWait(volume.volumeNumber);
                            }}
                            disabled={isStartingWait}
                            className="bg-accent-gold hover:bg-accent-gold/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all">
                            <span className="material-symbols-outlined text-sm">
                              {isStartingWait ? "hourglass_empty" : "timer"}
                            </span>
                            {isStartingWait
                              ? "Chargement..."
                              : "Attendre gratuitement"}
                          </button>
                        </div>
                      ) : (
                        <span className="material-symbols-outlined rose-gold-fill text-2xl opacity-60">
                          lock
                        </span>
                      )}
                    </div>
                  );
                });
              })()
            ) : (
              <div className="text-center py-12 text-gray-400">
                Aucun volume disponible pour le moment.
              </div>
            )}
          </div>
        </section>

        {/* Pricing Section - Only show if user hasn't purchased everything */}
        {currentChapter.pricing && (
          <PricingSection
            chapterTitle={currentChapter.title}
            pricing={currentChapter.pricing}
            volumes={currentChapter.volumes}
            onPurchase={handleUnlock}
            isPurchasing={isPurchasing}
          />
        )}

        {/* Reader Reviews */}
        <ReviewsSection
          onWriteReview={() =>
            alert("Fonctionnalité d'écriture d'avis à venir")
          }
        />

        {/* Reader Drawer */}
        {selectedVolume && currentChapter && (
          <ReaderDrawer
            isOpen={readerOpen}
            onClose={() => {
              setReaderOpen(false);
              // Refresh chapter data when drawer closes
              if (id) {
                fetchChapter(id);
              }
            }}
            volumeId={selectedVolume.id}
            chapterId={id!}
            volumeNumber={selectedVolume.volumeNumber}
            nextVolume={
              (() => {
                const vol = currentChapter.volumes?.find(
                  (v) => v.volumeNumber === selectedVolume.volumeNumber + 1,
                );
                return vol ? {
                  ...vol,
                  blockageType: vol.blockageType ?? undefined,
                } : null;
              })()
            }
            onReadNext={handleReadNext}
          />
        )}

        {/* Purchase Drawer */}
        {selectedVolumeForPurchase && currentChapter && (
          <PurchaseDrawer
            isOpen={purchaseDrawerOpen}
            onClose={() => {
              setPurchaseDrawerOpen(false);
              setSelectedVolumeForPurchase(null);
            }}
            volume={selectedVolumeForPurchase}
            chapterTitle={currentChapter.title}
            chapter={currentChapter}
            bundlePrice={currentChapter.pricing?.bundleDiscountedPrice}
            onPurchaseVolume={handlePurchaseVolume}
            onPurchaseChapter={handlePurchaseFullChapter}
            onStartWaitTimer={handleStartWait}
            onRefreshChapter={() => {
              if (id) {
                fetchChapter(id);
                fetchActiveWaitsCount();
              }
            }}
            activeWaitsCount={activeWaitsCount}
            maxWaitsAllowed={maxWaitsAllowed}
          />
        )}
      </main>
    </>
  );
}
