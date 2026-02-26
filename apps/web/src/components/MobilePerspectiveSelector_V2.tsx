interface MobilePerspectiveSelectorV2Props {
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
    description: "La voix du récit",
    icon: "auto_stories",
    accentColor: "from-blue-600 to-blue-500",
    borderColor: "border-blue-400/60 dark:border-blue-600/60",
    bgHover: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
  },
  {
    id: "protagonist" as const,
    label: (name?: string) => name || "Protagoniste",
    description: "Perspective intime",
    icon: "favorite",
    accentColor: "from-purple-600 to-purple-500",
    borderColor: "border-purple-400/60 dark:border-purple-600/60",
    bgHover: "hover:bg-purple-50 dark:hover:bg-purple-950/30",
  },
  {
    id: "coloriage" as const,
    label: "Coloriage",
    description: "Expression créative",
    icon: "palette",
    accentColor: "from-emerald-600 to-emerald-500",
    borderColor: "border-emerald-400/60 dark:border-emerald-600/60",
    bgHover: "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
  },
];

export default function MobilePerspectiveSelectorV2({
  selectedPerspective,
  onSelectPerspective,
  protagonistName,
}: MobilePerspectiveSelectorV2Props) {
  return (
    <section className=" px-4 py-8 mb-8">
      <div className="max-w-sm md:max-w-full mx-auto space-y-3">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="font-serif text-sm font-semibold tracking-wider uppercase text-boudoir-600 dark:text-boudoir-300 mb-1">
            Sélectionnez votre perspective
          </h3>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-eros-gold/50 to-transparent mx-auto" />
        </div>

        {/* Perspective Cards */}
        <div className="w-full md:grid md:grid-cols-3 gap-2.5">
          {perspectives.map((perspective) => {
            const isSelected = selectedPerspective === perspective.id;
            const label =
              typeof perspective.label === "function"
                ? perspective.label(protagonistName ?? undefined)
                : perspective.label;
            const description =
              typeof perspective.description === "function"
                ? perspective.description(protagonistName ?? undefined)
                : perspective.description;

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
                className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${perspective.bgHover} ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-background-dark shadow-lg"
                    : "border border-boudoir-200/30 dark:border-boudoir-800/40"
                } ${isSelected ? perspective.borderColor : ""}`}>
                {/* Background gradient on select */}
                {isSelected && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${perspective.accentColor} opacity-5`}
                    aria-hidden="true"
                  />
                )}

                {/* Left vertical accent bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                    isSelected ? `bg-gradient-to-b ${perspective.accentColor}` : "bg-boudoir-200/20 dark:bg-boudoir-700/20"
                  }`}
                  aria-hidden="true"
                />

                {/* Content */}
                <div className="relative flex items-center gap-4 px-5 py-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? `bg-gradient-to-br ${perspective.accentColor} text-white shadow-md`
                        : "bg-boudoir-100/50 dark:bg-boudoir-900/40 text-boudoir-600 dark:text-boudoir-300 group-hover:bg-boudoir-100 dark:group-hover:bg-boudoir-900/60"
                    }`}>
                    <span className="material-symbols-outlined text-xl">
                      {perspective.icon}
                    </span>
                  </div>

                  {/* Text content */}
                  <div className="flex-1 text-left">
                    <div
                      className={`font-serif font-semibold transition-colors duration-300 ${
                        isSelected
                          ? "text-boudoir-900 dark:text-white"
                          : "text-boudoir-700 dark:text-boudoir-200 group-hover:text-boudoir-900 dark:group-hover:text-boudoir-100"
                      }`}>
                      {label}
                    </div>
                    <div
                      className={`text-xs transition-colors duration-300 ${
                        isSelected
                          ? "text-boudoir-600 dark:text-boudoir-300"
                          : "text-boudoir-500/70 dark:text-boudoir-400/70 group-hover:text-boudoir-600 dark:group-hover:text-boudoir-300"
                      }`}>
                      {description}
                    </div>
                  </div>

                  {/* Checkmark indicator */}
                  {isSelected && (
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${perspective.accentColor} flex items-center justify-center text-white`}>
                      <span className="material-symbols-outlined text-sm">
                        check
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer divider */}
        <div className="mt-6 pt-4 border-t border-boudoir-200/30 dark:border-boudoir-800/40">
          <p className="text-xs text-center text-boudoir-500 dark:text-boudoir-400 italic">
            Changez de perspective à tout moment
          </p>
        </div>
      </div>
    </section>
  );
}
