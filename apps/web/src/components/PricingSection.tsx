import PlanCard from "./common/PlanCard";

interface Volume {
  id: string;
  volumeNumber: number;
  title: string;
  price?: number;
  isAccessible?: boolean;
  blockageType?: string | null;
  blockageInfo?: {
    waitRemaining?: number | null;
    priceFreeToRead?: number;
    pricePaywall?: number;
    priceEpilogue?: number;
  } | null;
}

interface Pricing {
  totalVolumes: number;
  bundleOriginalPrice: number;
  bundleDiscountedPrice: number;
  priceFreeToRead: number;
  pricePaywall: number;
  priceEpilogue: number;
  priceProtagonistUnlock?: number;
  priceColoring?: number; // Price for all coloring pages in chapter
}

interface PricingSectionProps {
  chapterTitle: string;
  pricing: Pricing;
  volumes?: Volume[];
  onPurchase: () => void;
  onPurchaseVolume?: (volumeNumber: number) => void;
  onPurchaseProtagonistBundle?: () => void;
  onPurchaseCompleteExperience?: () => void;
  onPurchaseColoring?: () => void;
  isPurchasing: boolean;
}

export default function PricingSection({
  chapterTitle,
  pricing,
  volumes = [],
  onPurchase,
  onPurchaseVolume,
  onPurchaseProtagonistBundle,
  onPurchaseCompleteExperience,
  onPurchaseColoring,
  isPurchasing,
}: PricingSectionProps) {
  // Only show if user hasn't purchased everything
  if (pricing.bundleDiscountedPrice <= 0) {
    return null;
  }

  // Find next locked volume that can be purchased
  const nextLockedVolume = volumes.find(
    (v) => !v.isAccessible && v.blockageType === "WAIT_OR_PAY"
  );

  // Calculate protagonist bundle price
  const protagonistPrice = pricing.priceProtagonistUnlock || 99;
  const protagonistBundleOriginal = protagonistPrice * pricing.totalVolumes;
  const protagonistBundleDiscounted = Math.round(protagonistBundleOriginal * 0.75);

  // Calculate coloring bundle price
  const coloringBundlePrice = pricing.priceColoring || 0; // Will be implemented with coloring feature

  // Calculate complete experience price (narrator + protagonist + coloring)
  const completeExperienceOriginal =
    pricing.bundleDiscountedPrice + protagonistBundleDiscounted + coloringBundlePrice;
  const completeExperienceFinalPrice = Math.round(completeExperienceOriginal * 0.85); // Additional 15% discount for complete experience

  return (
    <section className="mb-24">
      <div className="flex flex-col w-full mb-8">
        <h2 className="text-3xl font-bold italic font-display">
          Prolonger l'Expérience
        </h2>
        <div className="italic opacity-60 font-bold hover:underline">
          Choisissez la formule qui sied à vos envies
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {/* Complete Experience Bundle (NARRATOR + PROTAGONIST + COLORING) - PREMIUM */}
        {onPurchaseCompleteExperience && (
          <PlanCard
            badge={{ text: "Ultime", show: true }}
            icon="auto_awesome"
            title={`L'Expérience Complète`}
            description={`Tous les volumes: Point de vue Narrateur ET Protagoniste. Plus tout le coloriage du chapitre. L'intégralité sous tous les angles.`}
            originalPrice={
              pricing.bundleDiscountedPrice +
              protagonistBundleDiscounted +
              coloringBundlePrice
            }
            price={completeExperienceFinalPrice}
            savingsText="Économisez jusqu'à 40% en une seule transaction"
            buttonText="L'Expérience Ultime"
            onPurchase={onPurchaseCompleteExperience}
            isLoading={isPurchasing}
          />
        )}

        {/* Full Chapter Bundle - NARRATOR */}
        <PlanCard
          badge={{ text: "Conseillé", show: true }}
          icon="collections_bookmark"
          title={`L'Intégrale de ${chapterTitle}`}
          description={`Accédez immédiatement à l'ensemble des ${pricing.totalVolumes} volumes. Une immersion totale sans aucune interruption.`}
          originalPrice={pricing.bundleOriginalPrice}
          price={pricing.bundleDiscountedPrice}
          savingsText="Économisez 25% avec ce bundle complet"
          buttonText="Acheter l'Intégrale"
          onPurchase={onPurchase}
          isLoading={isPurchasing}
        />

        {/* Next Locked Volume */}
        {nextLockedVolume && (
          <PlanCard
            badge={{ text: "", show: false }}
            icon="auto_stories"
            title={`Volume ${nextLockedVolume.volumeNumber} : ${nextLockedVolume.title}`}
            description="Découvrez la suite immédiatement sans attendre. Déverrouillez ce volume et continuez votre lecture."
            price={nextLockedVolume.price || pricing.priceFreeToRead}
            buttonText="Débloquer ce Volume"
            onPurchase={() => {
              if (onPurchaseVolume) {
                onPurchaseVolume(nextLockedVolume.volumeNumber);
              }
            }}
            isLoading={isPurchasing}
          />
        )}

        {/* Full Chapter Bundle - PROTAGONIST */}
        {onPurchaseProtagonistBundle && (
          <PlanCard
            badge={{ text: "Protagoniste", show: true }}
            icon="favorite"
            title={`Point de vue de la Protagoniste`}
            description={`Découvrez les ${pricing.totalVolumes} volumes du point de vue exclusif de la protagoniste. Une perspective intime et captivante.`}
            originalPrice={protagonistBundleOriginal}
            price={protagonistBundleDiscounted}
            savingsText="Économisez 25% avec ce bundle complet"
            buttonText="Débloquer le Protagoniste"
            onPurchase={onPurchaseProtagonistBundle}
            isLoading={isPurchasing}
          />
        )}

        {/* Coloring Book Bundle */}
        {onPurchaseColoring && (
          <PlanCard
            badge={{ text: "Bientôt", show: true }}
            icon="palette"
            title={`Tout le Coloriage de ${chapterTitle}`}
            description="Plongez dans l'univers créatif et relaxant du coloriage. Toutes les illustrations du chapitre pour vous évader."
            price={0}
            buttonText="Bientôt disponible"
            onPurchase={onPurchaseColoring}
            isLoading={isPurchasing}
            isDisabled={true}
          />
        )}
      </div>
    </section>
  );
}
