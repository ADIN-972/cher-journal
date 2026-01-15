import React from "react";

type ActionButtonVariant = "blue" | "green" | "red" | "gray" | "indigo";
type ActionButtonSize = "sm" | "md";

type ActionButtonProps = {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  className?: string;
};

const variantClasses: Record<ActionButtonVariant, string> = {
  blue: "bg-blue-50 border-blue-400 text-blue-600 hover:text-blue-800",
  indigo:
    "bg-indigo-50 border-indigo-400 text-indigo-600 hover:text-indigo-800",
  green: "bg-green-50 border-green-400 text-green-600 hover:text-green-800",
  red: "bg-red-50 border-red-400 text-red-600 hover:text-red-800",
  gray: "bg-gray-50 border-gray-300 text-gray-600 hover:text-gray-800",
};

const sizeClasses: Record<ActionButtonSize, string> = {
  sm: "p-2 text-sm",
  md: "p-2.5 text-base",
};

/**
 * Small icon-only action button with consistent styling across tables and cards.
 */
export default function ActionButton({
  icon,
  onClick,
  title,
  ariaLabel,
  disabled = false,
  variant = "gray",
  size = "sm",
  className = "",
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || ariaLabel}
      aria-label={ariaLabel || title}
      disabled={disabled}
      className={`border rounded-md inline-flex items-center justify-center gap-1 ${
        variantClasses[variant]
      } ${sizeClasses[size]} font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`.trim()}>
      <span className="inline-block leading-none">{icon}</span>
    </button>
  );
}
