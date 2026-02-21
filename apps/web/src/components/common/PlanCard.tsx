interface PlanCardProps {
  badge?: {
    text: string;
    show: boolean;
  };
  icon: string;
  title: string;
  description: string;
  originalPrice?: number;
  price: number;
  savingsText?: string;
  buttonText: string;
  onPurchase: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export default function PlanCard({
  badge,
  icon,
  title,
  description,
  originalPrice,
  price,
  savingsText,
  buttonText,
  onPurchase,
  isLoading = false,
  isDisabled = false,
}: PlanCardProps) {
  const formatPrice = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  return (
    <div className="border-gold/40 border p-10 bg-white dark:bg-white/10 rounded-2xl flex flex-col items-center text-center silk-shadow relative overflow-hidden group">
      {badge?.show && (
        <div className="absolute top-0 right-0">
          <div className="bg-rose-gold bg-opacity-20 text-rose-gold text-[10px] font-bold p-1 mt-[2rem] mr-0 w-[120px] rotate-45 translate-x-6 -translate-y-2 uppercase tracking-widest border-b border-gold/40">
            {badge.text}
          </div>
        </div>
      )}
      <div className="mb-6 w-16 h-16 rounded-full bg-parchment flex items-center justify-center border border-gold-fine/30">
        <span className="material-symbols-outlined text-gold text-3xl">
          {icon}
        </span>
      </div>
      <h3 className="text-2xl font-display italic text-umber dark:text-white mb-4">
        {title}
      </h3>
      <p className="text-umber-light text-sm italic mb-8 max-w-xs leading-relaxed">
        {description}
      </p>
      <div className="mt-auto">
        <div className="mb-4">
          {originalPrice && (
            <span className="text-gold/40 line-through text-sm mr-2">
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className="text-3xl font-display font-bold text-umber dark:text-gold">
            {formatPrice(price)}
          </span>
        </div>
        {savingsText && (
          <p className="text-[10px] text-terracotta font-bold uppercase tracking-widest mb-6 italic">
            {savingsText}
          </p>
        )}
        <button
          onClick={onPurchase}
          disabled={isLoading || isDisabled}
          className="bg-powder-pink dark:bg-opacity-40 hover:bg-powder-pink/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.05] shadow-md border border-powder-pink/50">
          {isLoading ? "Chargement..." : buttonText}
        </button>
      </div>
    </div>
  );
}
