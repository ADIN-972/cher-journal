import { useToast } from "../hooks/useToast";
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
}

interface PricingSectionProps {
  chapterTitle: string;
  pricing: Pricing;
  volumes?: Volume[];
  onPurchase: () => void;
  isPurchasing: boolean;
}

export default function PricingSection({
  chapterTitle,
  pricing,
  volumes = [],
  onPurchase,
  isPurchasing,
}: PricingSectionProps) {
  const toast = useToast();

  // Only show if user hasn't purchased everything
  if (pricing.bundleDiscountedPrice <= 0) {
    return null;
  }

  // Find next locked volume that can be purchased
  const nextLockedVolume = volumes.find(
    (v) => !v.isAccessible && v.blockageType === "WAIT_OR_PAY"
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Full Chapter Bundle */}
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
              toast.info(
                "Fonctionnalité de déverrouillage de volume individuel à venir"
              );
            }}
            isLoading={isPurchasing}
          />
        )}
      </div>
    </section>
  );
}
