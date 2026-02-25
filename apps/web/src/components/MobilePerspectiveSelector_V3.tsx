interface MobilePerspectiveSelectorV3Props {
  selectedPerspective: "narrateur" | "protagonist" | "coloriage" | null;
  onSelectPerspective: (
    perspective: "narrateur" | "protagonist" | "coloriage"
  ) => void;
  protagonistName?: string | null;
}

const perspectives = [
  {
    id: "narrateur" as const,
    label: "Narrateur",
    icon: "auto_stories",
    accentHue: "0",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/20",
    textLight: "text-blue-600",
    textDark: "dark:text-blue-400",
    borderLight: "border-blue-200/40",
    borderDark: "dark:border-blue-800/40",
  },
  {
    id: "protagonist" as const,
    label: (name?: string) => name || "Protagoniste",
    icon: "favorite",
    accentHue: "1",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/20",
    textLight: "text-purple-600",
    textDark: "dark:text-purple-400",
    borderLight: "border-purple-200/40",
    borderDark: "dark:border-purple-800/40",
  },
  {
    id: "coloriage" as const,
    label: "Coloriage",
    icon: "palette",
    accentHue: "2",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/20",
    textLight: "text-emerald-600",
    textDark: "dark:text-emerald-400",
    borderLight: "border-emerald-200/40",
    borderDark: "dark:border-emerald-800/40",
  },
];

export default function MobilePerspectiveSelectorV3({
  selectedPerspective,
  onSelectPerspective,
  protagonistName,
}: MobilePerspectiveSelectorV3Props) {
  return (
    <section className="md:hidden px-4 py-8 mb-8">
      <div className="max-w-xl mx-auto">
        {/* Content */}
        <div className="grid grid-cols-3 gap-3">
          {perspectives.map((perspective, index) => {
            const isSelected = selectedPerspective === perspective.id;
            const label =
              typeof perspective.label === "function"
                ? perspective.label(protagonistName ?? undefined)
                : perspective.label;

            return (
              <button
                key={perspective.id}
                type="button"
                onClick={() =>
                  onSelectPerspective(
                    perspective.id as
                      | "narrateur"
                      | "protagonist"
                      | "coloriage"
                  )
                }
                title={`Version ${label}`}
                className={`group relative pt-4 pb-3 px-3 rounded-2xl transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? `${perspective.bgLight} ${perspective.bgDark} border border-boudoir-300/60 dark:border-boudoir-700/60 shadow-lg`
                    : `border border-boudoir-200/40 dark:border-boudoir-800/40 hover:border-boudoir-300/60 dark:hover:border-boudoir-700/40`
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}>
                {/* Diagonal accent lines */}
                <div
                  className={`absolute -top-8 -right-8 w-24 h-24 rounded-full transition-all duration-300 ${
                    isSelected ? "opacity-30 scale-100" : "opacity-0 scale-75"
                  }`}
                  style={{
                    background: `radial-gradient(circle, var(--accent-color), transparent)`,
                  }}
                  aria-hidden="true"
                />

                {/* Icon */}
                <div className="relative flex justify-center mb-3">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                      isSelected
                        ? `${perspective.textLight} ${perspective.textDark} scale-110`
                        : `text-boudoir-400 dark:text-boudoir-500 group-hover:text-boudoir-500 dark:group-hover:text-boudoir-400`
                    }`}>
                    <span className="material-symbols-outlined text-2xl">
                      {perspective.icon}
                    </span>
                  </div>
                </div>

                {/* Label */}
                <div className="relative text-center mb-2">
                  <p
                    className={`font-serif text-xs font-semibold transition-colors duration-300 ${
                      isSelected
                        ? `${perspective.textLight} ${perspective.textDark}`
                        : "text-boudoir-600 dark:text-boudoir-300 group-hover:text-boudoir-700 dark:group-hover:text-boudoir-200"
                    }`}>
                    {label}
                  </p>
                </div>

                {/* Animated bottom line indicator */}
                <div className="relative h-0.5 bg-boudoir-200/30 dark:bg-boudoir-700/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSelected
                        ? `${perspective.textLight} ${perspective.textDark} w-full`
                        : "w-0 group-hover:w-1/2"
                    }`}
                    style={{
                      boxShadow: isSelected
                        ? `0 0 8px currentColor`
                        : "none",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Decorative bottom divider */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-boudoir-200/40 dark:via-boudoir-800/40 to-transparent" />
          <span className="material-symbols-outlined text-sm text-boudoir-400 dark:text-boudoir-600">
            bookmark
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-boudoir-200/40 dark:via-boudoir-800/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
