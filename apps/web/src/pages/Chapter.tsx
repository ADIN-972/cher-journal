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
import ErrorMessage from "../components/common/ErrorMessage";
import ChapterCover from "../components/common/ChapterCover";
import PricingSection from "../components/PricingSection";
import ReviewsSection from "../components/ReviewsSection";
import ChapterTableOfContents from "../components/chapter/ChapterTableOfContents";
import { NotificationService } from "../lib/notifications";
import BookStore from "../components/common/BookStore";
import BookShadow from "../components/common/BookShadow";
import BookClosed from "../components/common/BookClosed";

export default function Chapter() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentChapter, isLoading, error, fetchChapter } = useCatalogStore();
  const toast = useToast();
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
  const [selectedPerspective, setSelectedPerspective] = useState<
    "narrateur" | "protagonist" | "coloriage" | null
  >("narrateur");
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
      // Open purchase drawer for locked volumes
      setSelectedVolumeForPurchase(volume);
      setPurchaseDrawerOpen(true);
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
      // Use perspective-specific versionScope
      const chapterVersionScope =
        selectedPerspective === "protagonist" ? "ALL" : "BASE";
      const { url } = await api.createCheckoutSession({
        chapterId: id,
        type: "CHAPTER",
        versionScope: chapterVersionScope,
        successUrl: `${window.location.origin}/chapters/${id}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${id}?purchase=cancelled`,
      });
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session:", err);
      toast.error(
        "Erreur lors de la création de la session de paiement. Veuillez réessayer.",
      );
      setIsPurchasing(false);
    }
  };

  const getReadingTime = (characterCount: number) => {
    const wordsPerMinute = 200;
    const averageWordLength = 5;
    const words = characterCount / averageWordLength;
    return Math.round(words / wordsPerMinute);
  };

  // Handle perspective selection
  const handleSelectPerspective = (
    perspective: "narrateur" | "protagonist" | "coloriage",
  ) => {
    // Select perspective and scroll to chapters list
    setSelectedPerspective(perspective);

    // Scroll to chapters list section with slight delay
    // setTimeout(() => {
    //   chaptersListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // }, 100);
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

      {/* Product Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        {/* Cover Image */}
        <div className="relative md:col-span-4 lg:w-[300px]  xl:w-[400px] aspect-[3/4]">
          <ChapterCover
            imageUrl={coverImageUrl}
            title={currentChapter.title}
            // showPremiumBadge={true}
            // showLimitedEditionBadge={true}
          />
          <div className="absolute top-[5%] -left-[10%] w-[130%] h-auto z-0">
            <BookStore />
          </div>
        </div>
        {/* Details Section */}
        <div className="md:col-span-8 flex flex-col justify-center ">
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
              {/* Plongez dans un récit où la passion rencontre le mystère. Dans le
              silence feutré d'un manoir oublié, deux âmes s'apprivoisent entre
              secrets interdits et caresses volées. */}
              {currentChapter.accroche_classic}
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400  newsreader">
              {/* Ce conte vous transporte à travers des paysages oniriques et des
              rencontres d'une intensité rare, écrit avec une plume délicate et
              envoûtante par {currentChapter.protagonistName || "l'auteur"}. */}
              {currentChapter.accroche_love}
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
      <section className="flex flex-row gap-2 mb-20 text-center h-[250px]">
        {/* Narrateur */}
        <div
          onClick={() => handleSelectPerspective("narrateur")}
          className={`relative cursor-pointer transition-all  ${selectedPerspective === "narrateur" ? "w-[200px] h-[300px]" : "w-[195px] h-[250px]"}`}>
          <BookClosed
            className=""
            color={"#3e5977"}
            selected={selectedPerspective === "narrateur"}
          />
          <div
            className={`absolute grid grid-rows-[1fr_auto] top-0  ${selectedPerspective === "narrateur" ? "w-[185px] text-2xl leading-6" : "w-[150px] text-md"} pl-8 pr-2 aspect-[3/4] items-center justify-center newsreader font-bold leading-4 mr-8 cursor-pointer rounded-lg transition-all text-white`}
            onClick={() => handleSelectPerspective("narrateur")}>
            <div className="">Version Narrateur</div>

            {/* <button className="border border-gold bg-gold/10 text-gold px-2 py-2 rounded-full font-normal ">
              Voir la version
            </button> */}
          </div>
        </div>

        {/* Protagonist */}
        <div
          onClick={() => handleSelectPerspective("protagonist")}
          className={`relative cursor-pointer transition-all  ${selectedPerspective === "protagonist" ? "w-[200px] h-[300px]" : "w-[195px] h-[250px]"}`}>
          <BookClosed
            className=""
            color={"#6e3e77"}
            selected={selectedPerspective === "protagonist"}
          />
          <div
            className={`absolute grid grid-rows-[1fr_auto] top-0  ${selectedPerspective === "protagonist" ? "w-[185px] text-2xl leading-6" : "w-[150px] text-md"} pl-8 pr-2 aspect-[3/4] items-center justify-center newsreader font-bold leading-4 mr-8 cursor-pointer rounded-lg transition-all text-white`}
            onClick={() => handleSelectPerspective("protagonist")}>
            <div className="">Version {currentChapter.protagonistName}</div>

            {/* <button className="border border-gold bg-gold/10 text-gold px-2 py-2 rounded-full font-normal ">
              Voir la version
            </button> */}
          </div>
        </div>

        {/* Coloriage */}
        <div
          onClick={() => handleSelectPerspective("coloriage")}
          className={`relative cursor-pointer transition-all  ${selectedPerspective === "coloriage" ? "w-[200px] h-[300px]" : "w-[195px] h-[250px]"}`}>
          <BookClosed
            className={` `}
            color={"#3e774f"}
            selected={selectedPerspective === "coloriage"}
          />
          <div
            className={`absolute grid grid-rows-[1fr_auto] top-0  ${selectedPerspective === "coloriage" ? "w-[185px] text-2xl leading-6" : "w-[150px] text-md"} pl-8 pr-2 aspect-[3/4] items-center justify-center newsreader font-bold leading-4 mr-8 cursor-pointer rounded-lg transition-all text-white`}
            onClick={() => handleSelectPerspective("coloriage")}>
            <div className="">Livre de coloriage</div>

            {/* <button className="border border-gold bg-gold/10 text-gold px-2 py-2 rounded-full font-normal ">
              Voir la version
            </button> */}
          </div>
        </div>

        <div className="grid aspect-[3/4] p-2 bg-gold/50 border-gold border rounded-md shadow-md items-center justify-center h-[150px]">
          Courriers
        </div>
        {/* <div className="grid aspect-[3/4] bg-blue-400 border-blue-600 border rounded-md shadow-md items-center justify-center h-[150px]">
          Audio books
        </div> */}
      </section>

      {/* Chapters List */}
      <ChapterTableOfContents
        ref={chaptersListRef}
        chapter={currentChapter}
        selectedPerspective={selectedPerspective}
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
          perspective={selectedPerspective === 'protagonist' ? 'PROTAGONIST' : 'NARRATOR'}
          nextVolume={(() => {
            const vol = currentChapter.volumes?.find(
              (v) => v.volumeNumber === selectedVolume.volumeNumber + 1,
            );
            const perspectiveKey = getPerspectiveKey();
            const blockageType = vol?.accessByPerspective?.[perspectiveKey]?.blockageType;
            return vol
              ? {
                  ...vol,
                  blockageType: blockageType ?? undefined,
                }
              : null;
          })()}
          onReadNext={handleReadNext}
          onPurchasePerspective={handlePurchasePerspective}
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
          selectedPerspective={selectedPerspective}
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
  );
}
