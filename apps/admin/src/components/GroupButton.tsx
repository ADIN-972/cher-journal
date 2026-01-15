import React from "react";

export type GroupButtonOption = {
  value: string;
  label: string;
  title?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type GroupButtonProps = {
  options: GroupButtonOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  buttonClassName?: string;
};

/**
 * Minimal grouped buttons component replicating the provided style.
 * Only renders buttons; consumer handles state and persistence.
 */
export default function GroupButton({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
  buttonClassName = "",
}: GroupButtonProps) {
  return (
    <div
      className={`bg-gray-100 rounded-lg p-1 inline-flex space-x-1 ${className}`}
      role="group"
      aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !option.disabled && onChange(option.value)}
            title={option.title ?? option.label}
            disabled={option.disabled}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            } ${buttonClassName}`.trim()}>
            {option.icon && (
              <span className="mr-1 inline-flex">{option.icon}</span>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
