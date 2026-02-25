import { useEffect, useState, useRef } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useCatalogStore } from "../stores/catalogStore";
import api from "../lib/api";
import { useToast } from "../hooks/useToast";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from "../lib/toastHelper";
import ReaderDrawer from "../components/ReaderDrawer";
import PurchaseDrawer from "../components/PurchaseDrawer";
import ProtagonistPurchaseDrawer from "../components/ProtagonistPurchaseDrawer";
import ErrorMessage from "../components/common/ErrorMessage";
import PricingSection from "../components/PricingSection";
import ReviewsSection from "../components/ReviewsSection";
import ChapterTableOfContents from "../components/chapter/ChapterTableOfContents";
import PerspectiveSelector from "../components/PerspectiveSelector";
import MobilePerspectiveSelector from "../components/MobilePerspectiveSelector";
import ChapterHeader from "../components/ChapterHeader";
import { NotificationService } from "../lib/notifications";

export default function Chapter() {
  const { id, perspective: urlPerspective } = useParams<{
    id: string;
    perspective?: string;
  }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentChapter, isLoading, error, fetchChapter } = useCatalogStore();
  const toast = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isStartingWait, setIsStartingWait] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
  const [protagonistPurchaseDrawerOpen, setProtagonistPurchaseDrawerOpen] =
    useState(false);
  const [selectedVolume, setSelectedVolume] = useState<{
    id: string;
    volumeNumber: number;
  } | null>(null);
  const [selectedVolumeForPurchase, setSelectedVolumeForPurchase] =
    useState<any>(null);
  const [activeWaitsCount, setActiveWaitsCount] = useState(0);
  const [maxWaitsAllowed, setMaxWaitsAllowed] = useState(2); // Default fallback

  // Initialize selectedPerspective from URL parameter, fallback to "narrateur"
  const getInitialPerspective = () => {
    if (
      urlPerspective === "narrateur" ||
      urlPerspective === "protagonist" ||
      urlPerspective === "coloriage"
    ) {
      return urlPerspective;
    }
    return "narrateur";
  };

  const [selectedPerspective, setSelectedPerspective] = useState<
    "narrateur" | "protagonist" | "coloriage" | null
  >(getInitialPerspective());
  const lastPurchaseStatusRef = useRef<string | null>(null);
  const chaptersListRef = useRef<HTMLDivElement>(null);

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

  // Update selectedPerspective when URL parameter changes
  useEffect(() => {
    if (urlPerspective) {
      const validPerspectives = ["narrateur", "protagonist", "coloriage"];
      if (validPerspectives.includes(urlPerspective)) {
        setSelectedPerspective(
          urlPerspective as "narrateur" | "protagonist" | "coloriage"
        );
      }
    }
  }, [urlPerspective]);

  // Handle payment return (success or cancelled)
  useEffect(() => {
    const purchaseStatus = searchParams.get("purchase");

    // Only show toast if this is a new purchase status (prevent duplicate toasts)
    // Use ref to avoid re-renders from triggering the effect again
    if (purchaseStatus && purchaseStatus !== lastPurchaseStatusRef.current) {
      console.log(`[Chapter] Payment status changed: ${purchaseStatus}`);
      lastPurchaseStatusRef.current = purchaseStatus;

      if (purchaseStatus === "success") {
        showSuccessToast(toast, "PURCHASE_SUCCESSFUL");
        // Refresh chapter data to get updated access
        if (id) {
          fetchChapter(id);
        }
      } else if (purchaseStatus === "cancelled") {
        showInfoToast(toast, "PURCHASE_CANCELLED");
      }

      // Remove the query parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast, id, fetchChapter]);

  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Helper to get perspective key from selectedPerspective
  const getPerspectiveKey = (): "NARRATOR" | "PROTAGONIST" => {
    return selectedPerspective === "protagonist" ? "PROTAGONIST" : "NARRATOR";
  };

  // Helper to check if volume is accessible for current perspective
  const isVolumeAccessible = (volume: any): boolean => {
    const perspectiveKey = getPerspectiveKey();
    const perspectiveAccess = volume.accessByPerspective?.[perspectiveKey];
    return perspectiveAccess?.isAccessible || volume.isUnlocked || false;
  };

  // Handle opening volume in reader drawer
  const handleOpenVolume = (volume: any) => {
    if (isVolumeAccessible(volume)) {
      setSelectedVolume({
        id: volume.id,
        volumeNumber: volume.volumeNumber,
      });
      setReaderOpen(true);
    } else {
      // Open purchase drawer for locked volumes based on perspective
      // Enrich volume with blockage info from the current perspective
      const perspectiveKey = selectedPerspective === "protagonist" ? "protagonist" : "narrator";
      const accessInfo = volume.accessByPerspective?.[perspectiveKey];
      const enrichedVolume = {
        ...volume,
        blockageInfo: accessInfo?.blockageInfo,
        canStartWait: accessInfo?.blockageType === 'WAIT_OR_PAY',
      };
      setSelectedVolumeForPurchase(enrichedVolume);
      if (selectedPerspective === "protagonist") {
        setProtagonistPurchaseDrawerOpen(true);
      } else {
        setPurchaseDrawerOpen(true);
      }
    }
  };

  // Handle purchase of single volume (from pricing section)
  const handlePurchaseVolumeFromPricing = async (volumeNumber: number) => {
    if (!id) return;

    try {
      setIsPurchasing(true);
      const { url } = await api.createCheckoutSession({
        chapterId: id,
        type: "VOLUME",
        volumeNumber,
        versionScope: "BASE",
        successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session for volume:", err);
      showErrorToast(toast, "CHECKOUT_SESSION_FAILED");
      setIsPurchasing(false);
    }
  };

  // Handle purchase of single volume (from purchase drawer)
  const handlePurchaseVolume = async () => {
    if (!id || !selectedVolumeForPurchase) return;

    try {
      setIsPurchasing(true);
      let url: string;

      if (selectedPerspective === "protagonist") {
        // Use dedicated PROTAGONIST endpoint (uses priceProtagonistUnlock)
        const result = await api.createProtagonistCheckoutSession({
          chapterId: id,
          type: "VOLUME",
          volumeNumber: selectedVolumeForPurchase.volumeNumber,
          successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
          cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
        });
        url = result.url;
      } else {
        // Use standard endpoint for NARRATOR
        const result = await api.createCheckoutSession({
          chapterId: id,
          type: "VOLUME",
          volumeNumber: selectedVolumeForPurchase.volumeNumber,
          versionScope: "BASE",
          successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
          cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
        });
        url = result.url;
      }

      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session for volume:", err);
      showErrorToast(toast, "CHECKOUT_SESSION_FAILED");
      setIsPurchasing(false);
    }
  };

  // Handle purchase of perspective
  const handlePurchasePerspective = async (volumeNumber: number) => {
    if (!id) return;

    try {
      setIsPurchasing(true);
      const { url } = await api.createCheckoutSession({
        chapterId: id,
        type: "PERSPECTIVE",
        volumeNumber,
        successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session for perspective:", err);
      showErrorToast(toast, "CHECKOUT_SESSION_FAILED");
      setIsPurchasing(false);
    }
  };

  // Handle purchase of full chapter
  const handlePurchaseFullChapter = async () => {
    if (!id) return;

    try {
      setIsPurchasing(true);
      let url: string;

      if (selectedPerspective === "protagonist") {
        // Use dedicated PROTAGONIST endpoint (uses priceProtagonistUnlock)
        const result = await api.createProtagonistCheckoutSession({
          chapterId: id,
          type: "CHAPTER",
          successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
          cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
        });
        url = result.url;
      } else {
        // Use standard endpoint for NARRATOR
        const result = await api.createCheckoutSession({
          chapterId: id,
          type: "CHAPTER",
          versionScope: "BASE",
          successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
          cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
        });
        url = result.url;
      }

      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session:", err);
      toast.error(
        "Erreur lors de la création de la session de paiement. Veuillez réessayer.",
      );
      setIsPurchasing(false);
    }
  };

  // Handle purchase of PROTAGONIST chapter bundle
  const handlePurchaseProtagonistBundle = async () => {
    if (!id) return;

    try {
      setIsPurchasing(true);
      const result = await api.createProtagonistCheckoutSession({
        chapterId: id,
        type: "CHAPTER",
        successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });
      window.location.href = result.url;
    } catch (err: any) {
      console.error("Failed to create protagonist checkout session:", err);
      showErrorToast(toast, "CHECKOUT_SESSION_FAILED");
      setIsPurchasing(false);
    }
  };

  // Handle complete experience purchase (both NARRATOR and PROTAGONIST)
  const handlePurchaseCompleteExperience = async () => {
    if (!id) return;

    try {
      setIsPurchasing(true);
      // For now, we'll create a CHAPTER order with NARRATOR
      // User will need to also purchase PROTAGONIST separately
      // In future, this could be a single transaction for both
      const result = await api.createCheckoutSession({
        chapterId: id,
        type: "CHAPTER",
        versionScope: "BASE",
        successUrl: `${window.location.origin}/chapters/${id}/protagonist?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });
      window.location.href = result.url;
    } catch (err: any) {
      console.error("Failed to create complete experience checkout session:", err);
      showErrorToast(toast, "CHECKOUT_SESSION_FAILED");
      setIsPurchasing(false);
    }
  };

  // Handle coloring purchase (coming soon)
  const handlePurchaseColoring = () => {
    showInfoToast(toast, "FEATURE_COMING_SOON_PURCHASE");
  };

  const getReadingTime = (characterCount: number) => {
    const wordsPerMinute = 200;
    const averageWordLength = 5;
    const words = characterCount / averageWordLength;
    return Math.round(words / wordsPerMinute);
  };

  // Handle perspective selection and update URL
  const handleSelectPerspective = (
    perspective: "narrateur" | "protagonist" | "coloriage",
  ) => {
    // Preserve scroll position during perspective switch
    const scrollPosition = window.scrollY;

    // Update state
    setSelectedPerspective(perspective);

    // Close any open drawers when switching perspectives
    setPurchaseDrawerOpen(false);
    setProtagonistPurchaseDrawerOpen(false);
    setSelectedVolumeForPurchase(null);
    setReaderOpen(false);

    // Update URL to persist perspective
    if (id) {
      navigate(`/chapters/${id}/${perspective}`, { replace: true });
      // Restore scroll position after navigation
      window.requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
      });
    }
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
        currentChapter.volumes?.filter((v) => isVolumeAccessible(v)) ||
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

      const chapterVersionScope =
        selectedPerspective === "protagonist" ? "ALL" : "BASE";
      const { url } = await api.createCheckoutSession({
        chapterId: id,
        type: "CHAPTER",
        versionScope: chapterVersionScope,
        successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session:", err);
      showErrorToast(toast, "CHECKOUT_SESSION_FAILED");
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

      showSuccessToast(toast, "WAIT_STARTED");

      setIsStartingWait(false);
    } catch (err: any) {
      console.error("Failed to start wait timer:", err);

      if (err.message?.includes("MAX_PENDING_CHAPTERS_REACHED")) {
        showWarningToast(toast, "WAIT_MAX_TIMERS_REACHED");
      } else if (err.message?.includes("WAIT_ALREADY_ACTIVE")) {
        showInfoToast(toast, "WAIT_ALREADY_ACTIVE");
      } else {
        showErrorToast(toast, "WAIT_START_FAILED");
      }

      setIsStartingWait(false);
    }
  };

  // Determine button text based on accessible volumes
  const accessibleVolumes =
    currentChapter?.volumes?.filter((v) => isVolumeAccessible(v)) ||
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
    <main className="max-w-7xl mx-auto px-6 py-10 text-charcoal dark:text-white/70 dark:text-white">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <Link
          className="hover:text-primary transition-colors"
          to="/">
          Accueil
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link
          className="hover:text-primary transition-colors"
          to="/catalogue">
          Catalogue
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-gray-900 dark:text-gray-100">
          {currentChapter.title}
        </span>
      </div>

      {/* Chapter Header */}
      <ChapterHeader
        currentChapter={currentChapter}
        imageUrl={coverImageUrl ?? undefined}
        rating={rating}
        reviewCount={reviewCount}
        isPurchasing={isPurchasing}
        readButtonText={readButtonText}
        onUnlock={handleUnlock}
        getReadingTime={getReadingTime}
      />

      {/* Perspective Selector */}
      <PerspectiveSelector
        selectedPerspective={selectedPerspective ?? "narrateur"}
        onSelectPerspective={handleSelectPerspective}
        protagonistName={currentChapter.protagonistName}
      />
      <MobilePerspectiveSelector
        selectedPerspective={selectedPerspective}
        onSelectPerspective={handleSelectPerspective}
        protagonistName={currentChapter.protagonistName}
      />

      {/* Chapters List */}
      <ChapterTableOfContents
        ref={chaptersListRef}
        chapter={currentChapter}
        selectedPerspective={selectedPerspective ?? "narrateur"}
        isPurchasing={isPurchasing}
        isStartingWait={isStartingWait}
        onOpenVolume={handleOpenVolume}
        onStartWait={handleStartWait}
        onUnlock={handleUnlock}
        onFetchChapter={() => {
          if (id) fetchChapter(id);
        }}
        chapterId={id!}
      />

      {/* Pricing Section - Only show if user hasn't purchased everything */}
      {currentChapter.pricing && (
        <PricingSection
          chapterTitle={currentChapter.title}
          pricing={currentChapter.pricing}
          volumes={currentChapter.volumes}
          onPurchase={handleUnlock}
          onPurchaseVolume={handlePurchaseVolumeFromPricing}
          onPurchaseProtagonistBundle={handlePurchaseProtagonistBundle}
          onPurchaseCompleteExperience={handlePurchaseCompleteExperience}
          onPurchaseColoring={handlePurchaseColoring}
          isPurchasing={isPurchasing}
        />
      )}

      {/* Reader Reviews */}
      <ReviewsSection
        onWriteReview={() =>
          showInfoToast(toast, "FEATURE_COMING_SOON_REVIEWS")
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
          perspective={
            selectedPerspective === "protagonist" ? "PROTAGONIST" : "NARRATOR"
          }
          nextVolume={(() => {
            const vol = currentChapter.volumes?.find(
              (v) => v.volumeNumber === selectedVolume.volumeNumber + 1,
            );
            const perspectiveKey = getPerspectiveKey();
            const access = vol?.accessByPerspective?.[perspectiveKey];
            return vol
              ? {
                  ...vol,
                  isAccessible: access?.isAccessible ?? false,
                  blockageType: access?.blockageType ?? undefined,
                  blockageInfo: access?.blockageInfo,
                }
              : null;
          })()}
          onReadNext={handleReadNext}
          onPurchasePerspective={handlePurchasePerspective}
          totalVolumes={currentChapter.volumes?.length ?? 10}
          allVolumesOwned={(() => {
            const perspectiveKey = getPerspectiveKey();
            return (
              currentChapter.volumes?.every((vol) => {
                const access = vol.accessByPerspective?.[perspectiveKey];
                return access?.isAccessible === true && !access?.blockageType;
              }) ?? false
            );
          })()}
          chapterPrice={(() => {
            if (selectedPerspective === "protagonist") {
              // PROTAGONIST: Calculate total price = (count of non-free, non-accessible volumes) × priceProtagonistUnlock
              const perspectiveKey = getPerspectiveKey();
              const inaccessibleNonFreeVolumes =
                currentChapter.volumes?.filter((vol) => {
                  const access = vol.accessByPerspective?.[perspectiveKey];
                  return !vol.isFree && !access?.isAccessible;
                }) ?? [];
              const pricePerVolume =
                currentChapter.pricing?.priceProtagonistUnlock ?? 99;
              return inaccessibleNonFreeVolumes.length * pricePerVolume;
            } else {
              // NARRATOR: Use bundle discounted price (remaining volumes to purchase)
              return currentChapter.pricing?.bundleDiscountedPrice;
            }
          })()}
        />
      )}

      {/* Purchase Drawer - NARRATOR */}
      {selectedVolumeForPurchase &&
        currentChapter &&
        selectedPerspective !== "protagonist" && (
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

      {/* Purchase Drawer - PROTAGONIST */}
      {selectedVolumeForPurchase &&
        currentChapter &&
        selectedPerspective === "protagonist" && (
          <ProtagonistPurchaseDrawer
            isOpen={protagonistPurchaseDrawerOpen}
            onClose={() => {
              setProtagonistPurchaseDrawerOpen(false);
              setSelectedVolumeForPurchase(null);
            }}
            volume={selectedVolumeForPurchase}
            chapterTitle={currentChapter.title}
            chapter={currentChapter}
            onPurchaseVolume={handlePurchaseVolume}
            onPurchaseChapter={handlePurchaseFullChapter}
          />
        )}
    </main>
  );
}
