import React from "react";

type ToggleButtonVariant =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";

type ToggleButtonProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
  variant?: ToggleButtonVariant;
  className?: string;
  description?: string;
  label?: React.ReactNode;
  labelPosition?: "left" | "right";
  uncheckedColor?: "gray" | "red";
};

const variantClasses: Record<
  ToggleButtonVariant,
  { active: string; ring: string }
> = {
  slate: {
    active: "peer-checked:bg-slate-600",
    ring: "peer-focus:ring-slate-300",
  },
  gray: {
    active: "peer-checked:bg-gray-600",
    ring: "peer-focus:ring-gray-300",
  },
  zinc: {
    active: "peer-checked:bg-zinc-600",
    ring: "peer-focus:ring-zinc-300",
  },
  neutral: {
    active: "peer-checked:bg-neutral-600",
    ring: "peer-focus:ring-neutral-300",
  },
  stone: {
    active: "peer-checked:bg-stone-600",
    ring: "peer-focus:ring-stone-300",
  },
  red: { active: "peer-checked:bg-red-600", ring: "peer-focus:ring-red-300" },
  orange: {
    active: "peer-checked:bg-orange-500",
    ring: "peer-focus:ring-orange-300",
  },
  amber: {
    active: "peer-checked:bg-amber-500",
    ring: "peer-focus:ring-amber-300",
  },
  yellow: {
    active: "peer-checked:bg-yellow-500",
    ring: "peer-focus:ring-yellow-300",
  },
  lime: {
    active: "peer-checked:bg-lime-500",
    ring: "peer-focus:ring-lime-300",
  },
  green: {
    active: "peer-checked:bg-green-600",
    ring: "peer-focus:ring-green-300",
  },
  emerald: {
    active: "peer-checked:bg-emerald-600",
    ring: "peer-focus:ring-emerald-300",
  },
  teal: {
    active: "peer-checked:bg-teal-600",
    ring: "peer-focus:ring-teal-300",
  },
  cyan: {
    active: "peer-checked:bg-cyan-500",
    ring: "peer-focus:ring-cyan-300",
  },
  sky: { active: "peer-checked:bg-sky-500", ring: "peer-focus:ring-sky-300" },
  blue: {
    active: "peer-checked:bg-blue-600",
    ring: "peer-focus:ring-blue-300",
  },
  indigo: {
    active: "peer-checked:bg-indigo-600",
    ring: "peer-focus:ring-indigo-300",
  },
  violet: {
    active: "peer-checked:bg-violet-600",
    ring: "peer-focus:ring-violet-300",
  },
  purple: {
    active: "peer-checked:bg-purple-600",
    ring: "peer-focus:ring-purple-300",
  },
  fuchsia: {
    active: "peer-checked:bg-fuchsia-600",
    ring: "peer-focus:ring-fuchsia-300",
  },
  pink: {
    active: "peer-checked:bg-pink-600",
    ring: "peer-focus:ring-pink-300",
  },
  rose: {
    active: "peer-checked:bg-rose-600",
    ring: "peer-focus:ring-rose-300",
  },
};

/**
 * Small toggle switch styled like the Settings page switches.
 */
export default function ToggleButton({
  checked,
  onChange,
  ariaLabel,
  disabled = false,
  variant = "indigo",
  className = "",
  description,
  label,
  labelPosition = "right",
  uncheckedColor = "gray",
}: ToggleButtonProps) {
  const theme = variantClasses[variant] ?? variantClasses.indigo;
  const bgUnchecked = uncheckedColor === "red" ? "bg-red-200" : "bg-gray-200";

  const toggleSwitch = (
    <label
      className={`relative inline-flex items-center ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`.trim()}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
        disabled={disabled}
      />
      <div
        className={`w-11 h-6 ${bgUnchecked} peer-focus:outline-none ${theme.ring} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${theme.active}`}
      />
    </label>
  );

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <div className="flex items-center gap-3">
        {label && labelPosition === "left" && (
          <span className="text-sm text-gray-700">{label}</span>
        )}
        {toggleSwitch}
        {label && labelPosition === "right" && (
          <span className="text-sm text-gray-700">{label}</span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 italic">{description}</p>
      )}
    </div>
  );
}
