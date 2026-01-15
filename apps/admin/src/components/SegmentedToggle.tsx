import React from "react";

interface ToggleOption {
  value: string;
  label?: string;
  icon?: React.ReactNode;
}

interface SegmentedToggleProps {
  value: string;
  options: ToggleOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

/**
 * Segmented toggle styled like the promotions view switch.
 */
export function SegmentedToggle({
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedToggleProps) {
  return (
    <div
      className="flex gap-1 bg-gray-100 rounded-lg p-1"
      aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`p-2 rounded-md transition-all ${
            value === opt.value
              ? "bg-white text-rose-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          title={opt.label || opt.value}>
          {opt.icon}
          {opt.label && !opt.icon && (
            <span className="text-sm">{opt.label}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default SegmentedToggle;
