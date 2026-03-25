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
import PerspectiveSelector from "../components/PerspectiveSelector";
import ChapterHeader from "../components/ChapterHeader";
import { NotificationService } from "../lib/notifications";
import MobilePerspectiveSelectorV2 from "../components/MobilePerspectiveSelector_V2";
import ChapterTableOfContents_V3 from "../components/chapter/ChapterTableOfContents_V3";
import ColoringGallery from "../components/chapter/ColoringGallery";

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
  const [clubInfo, setClubInfo] = useState<{ priceCents: number; discountPercent: number } | null>(null);
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
    api.getClubInfo().then(setClubInfo).catch(() => {});
  }, [id, fetchChapter]);

  // Update selectedPerspective when URL parameter changes
  useEffect(() => {
    if (urlPerspective) {
      const validPerspectives = ["narrateur", "protagonist", "coloriage"];
      if (validPerspectives.includes(urlPerspective)) {
        setSelectedPerspective(
          urlPerspective as "narrateur" | "protagonist" | "coloriage",
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
      const perspectiveKey =
        selectedPerspective === "protagonist" ? "PROTAGONIST" : "NARRATOR";
      const accessInfo = volume.accessByPerspective?.[perspectiveKey];
      const enrichedVolume = {
        ...volume,
        blockageInfo: accessInfo?.blockageInfo,
        canStartWait: accessInfo?.blockageType === "WAIT_OR_PAY",
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
        scopes: ["BASE"],
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
          scopes: ["BASE"],
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
          scopes: ["BASE"],
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
        scopes: ["BASE"],
        successUrl: `${window.location.origin}/chapters/${id}/protagonist?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });
      window.location.href = result.url;
    } catch (err: any) {
      console.error(
        "Failed to create complete experience checkout session:",
        err,
      );
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

  // Handle purchase/unlock
  const handleUnlock = async () => {
    if (!id) return;

    // If user already has access, open last accessible volume in drawer
    if (currentChapter?.hasAccess) {
      const accessibleVolumes =
        currentChapter.volumes?.filter((v) => isVolumeAccessible(v)) || [];

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

      const chapterScopes =
        selectedPerspective === "protagonist" ? ["BASE", "POV"] : ["BASE"];
      const { url } = await api.createCheckoutSession({
        chapterId: id,
        type: "CHAPTER",
        scopes: chapterScopes,
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
    currentChapter?.volumes?.filter((v) => isVolumeAccessible(v)) || [];
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
      {/* <PerspectiveSelector
        selectedPerspective={selectedPerspective ?? "narrateur"}
        onSelectPerspective={handleSelectPerspective}
        protagonistName={currentChapter.protagonistName}
      /> */}
      {!currentChapter.isPrivateLocked && (
        <MobilePerspectiveSelectorV2
          selectedPerspective={selectedPerspective}
          onSelectPerspective={handleSelectPerspective}
          protagonistName={currentChapter.protagonistName}
        />
      )}
      {/* Chapters List, Coloring Gallery, or Private Lock Block */}
      {currentChapter.isPrivateLocked ? (
        <section className="flex justify-center">
          <div className=" inset-0 flex flex-col items-center justify-start px-6">
            {/* <!-- Ceremonial Seal/Icon --> */}
            <div className="relative mb-12 group">
              
              <div className="relative w-32 h-32 md:w-28 md:h-28 flex items-center justify-center border-2 border-accent-gold/40 rounded-full bg-white dark:bg-background-dark shadow-[0_0_60px_rgba(212,175,55,0.15)] ring-8 ring-white dark:ring-background-dark">
                <span className="material-symbols-outlined text-6xl md:text-5xl text-accent-gold gold-fill animate-pulse">
                  key
                </span>
              </div>
            </div>
            {/* <!-- Invitation Message --> */}
            <div className="max-w-3xl w-full text-center space-y-8 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-8 md:p-12 rounded-[2rem] border border-white/5 gold-glow">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-4xl font-display italic text-off-white leading-tight newsreader">
                  Certains secrets ne se partagent qu'entre initiés
                </h2>
                <div className="h-px w-24 bg-accent-gold/40 mx-auto"></div>
              </div>
              <p className="text-xl md:text-2xl text-off-white/70 font-light leading-relaxed max-w-2xl mx-auto italic  newsreader">
                L'accès à l'intégralité de ce récit, aux scènes les plus
                charnelles et aux confidences manuscrites de{" "}
                <span className="text-accent-gold font-medium">
                {currentChapter.protagonistName ? currentChapter.protagonistName : "l'héroïne"}
                </span>{" "}
                est réservé aux membres de notre Club Privé.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                <div className="flex flex-row gap-2 items-center justify-center text-center text-nowrap">
                  <span className="material-symbols-outlined text-accent-gold block">
                    history_edu
                  </span>
                  <p className="text-[11px] uppercase tracking-widest text-off-white/40">
                    Manuscrits Inédits
                  </p>
                </div>
                <div className="flex flex-row gap-2 items-center justify-center text-center text-nowrap">
                  <span className="material-symbols-outlined text-accent-gold block">
                    all_inclusive
                  </span>
                  <p className="text-[11px] uppercase tracking-widest text-off-white/40">
                    Contenu Non-Censuré
                  </p>
                </div>
                <div className="flex flex-row gap-2 items-center justify-center text-center text-nowrap">
                  <span className="material-symbols-outlined text-accent-gold block">
                    workspace_premium
                  </span>
                  <p className="text-[11px] uppercase tracking-widest text-off-white/40">
                    Échanges Privés
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-8">
                <button
                  onClick={async () => {
                    try {
                      const session = await api.createSubscriptionCheckout(
                        `${window.location.origin}/account/subscription?success=true`,
                        `${window.location.origin}/chapters/${id}`
                      );
                      if (session.url) {
                        window.location.href = session.url;
                      }
                    } catch (err) {
                      console.error('Failed to create subscription checkout:', err);
                    }
                  }}
                  className="premium-shimmer text-white px-16 py-6 rounded-full font-bold text-2xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(128,0,32,0.4)] border border-white/10 group">
                  <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">
                    stars
                  </span>
                  <span className="tracking-wide">Rejoindre le Club Privé</span>
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-accent-gold uppercase tracking-[0.4em] font-black mb-1">
                    Abonnement Prestige
                  </span>
                  <span className="text-4xl font-display font-bold text-off-white">
                    {clubInfo ? `${(clubInfo.priceCents / 100).toFixed(2).replace('.', ',')} €` : '...'}{" "}
                    <small className="text-sm font-light text-off-white/40">
                      / mois
                    </small>
                  </span>
                </div>
                <a
                  href="/account/subscription"
                  className="text-accent-gold/60 hover:text-accent-gold text-xs underline underline-offset-4 transition-colors mt-2"
                >
                  Découvrir tous les avantages du Club Privé
                </a>
              </div>
              <p className="text-off-white/30 text-xs italic mt-12">
                "Une immersion sans compromis dans l'érotisme littéraire
                d'exception."
              </p>
            </div>
          </div>
        </section>
      ) : selectedPerspective === "coloriage" ? (
        <ColoringGallery
          // chapterId={id!}
          chapter={currentChapter}
        />
      ) : (
        <ChapterTableOfContents_V3
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
      )}

      {/* Pricing Section - Only show if user hasn't purchased everything and chapter is not private-locked */}
      {currentChapter.pricing && !currentChapter.isPrivateLocked && (
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

      {/* Reader Drawer - Only show for narrator/protagonist perspectives */}
      {selectedVolume &&
        currentChapter &&
        selectedPerspective !== "coloriage" && (
          <ReaderDrawer
            isOpen={readerOpen}
            onClose={() => {
              setReaderOpen(false);
              if (id) fetchChapter(id);
            }}
            volumeId={selectedVolume.id}
            chapterId={id!}
            volumeNumber={selectedVolume.volumeNumber}
            perspective={
              selectedPerspective === "protagonist" ? "PROTAGONIST" : "NARRATOR"
            }
            chapter={currentChapter}
            onPurchasePerspective={handlePurchasePerspective}
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
