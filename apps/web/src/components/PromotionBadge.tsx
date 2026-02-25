import React from 'react';

interface PromotionBadgeProps {
  discountPercentage?: number;
  discountAmount?: number; // in cents
  type?: 'PERCENT' | 'FIXED' | 'FREE';
  originalPrice?: number; // in cents
  finalPrice?: number; // in cents
  size?: 'small' | 'medium' | 'large';
  showPrice?: boolean;
}

export default function PromotionBadge({
  discountPercentage,
  discountAmount,
  type = 'PERCENT',
  originalPrice,
  finalPrice,
  size = 'medium',
  showPrice = false,
}: PromotionBadgeProps) {
  if (type === 'FREE') {
    return (
      <div className="relative inline-block">
        <div className={`
          absolute -top-3 -right-3
          bg-red-600 text-white font-black
          flex items-center justify-center
          rounded-full transform
          ${size === 'small' ? 'w-12 h-12 text-sm' : ''}
          ${size === 'medium' ? 'w-16 h-16 text-lg' : ''}
          ${size === 'large' ? 'w-20 h-20 text-2xl' : ''}
          shadow-lg z-10
          -rotate-12
        `}>
          <span className="text-center">
            GRATUIT
          </span>
        </div>
      </div>
    );
  }

  const displayDiscount = type === 'PERCENT' ?
    discountPercentage :
    (discountAmount ? (discountAmount / 100).toFixed(2) : '0.00');
  const unit = type === 'PERCENT' ? '%' : '€';

  return (
    <div className="relative inline-block">
      <div className={`
        absolute -top-3 -right-3
        bg-red-600 text-white font-black
        flex flex-col items-center justify-center
        rounded-full transform
        ${size === 'small' ? 'w-12 h-12 text-xs leading-3' : ''}
        ${size === 'medium' ? 'w-16 h-16 text-sm leading-4' : ''}
        ${size === 'large' ? 'w-20 h-20 text-base leading-5' : ''}
        shadow-lg z-10
        -rotate-12
        border-2 border-red-700
      `}>
        <span className="font-black">{displayDiscount}</span>
        <span className="text-[10px] font-bold opacity-90">
          {unit === '%' ? 'off' : 'off'}
        </span>
      </div>

      {/* Price display if showPrice is true */}
      {showPrice && (
        <div className="text-center">
          {originalPrice && (
            <div className="text-sm text-gray-500 line-through">
              {(originalPrice / 100).toFixed(2)}€
            </div>
          )}
          {finalPrice && (
            <div className="text-2xl font-bold text-green-600">
              {(finalPrice / 100).toFixed(2)}€
            </div>
          )}
        </div>
      )}
    </div>
  );
}
