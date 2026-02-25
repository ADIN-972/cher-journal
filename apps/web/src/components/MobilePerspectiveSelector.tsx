interface MobilePerspectiveSelectorProps {
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
    lightBg: "bg-blue-50",
    darkBg: "dark:bg-slate-900/40",
    lightText: "text-blue-700",
    darkText: "dark:text-blue-300",
    shadowColor: "shadow-blue-200/50 dark:shadow-blue-900/30",
    ringColor: "ring-blue-200/50 dark:ring-blue-800/50",
  },
  {
    id: "protagonist" as const,
    label: (name?: string) => name || "Protagoniste",
    lightBg: "bg-purple-50",
    darkBg: "dark:bg-purple-900/30",
    lightText: "text-purple-700",
    darkText: "dark:text-purple-300",
    shadowColor: "shadow-purple-200/50 dark:shadow-purple-900/30",
    ringColor: "ring-purple-200/50 dark:ring-purple-800/50",
  },
  {
    id: "coloriage" as const,
    label: "Coloriage",
    lightBg: "bg-emerald-50",
    darkBg: "dark:bg-emerald-900/30",
    lightText: "text-emerald-700",
    darkText: "dark:text-emerald-300",
    shadowColor: "shadow-emerald-200/50 dark:shadow-emerald-900/30",
    ringColor: "ring-emerald-200/50 dark:ring-emerald-800/50",
  },
];

export default function MobilePerspectiveSelector({
  selectedPerspective,
  onSelectPerspective,
  protagonistName,
}: MobilePerspectiveSelectorProps) {
  return (
    <section className="md:hidden px-4 py-6 mb-8">
      <div className="flex justify-center">
        <div
          className="inline-flex gap-0 rounded-2xl p-1 bg-boudoir-50/50 dark:bg-boudoir-950/40 border border-boudoir-200/30 dark:border-boudoir-800/40 backdrop-blur-sm"
          aria-label="Sélection de perspective">
          {perspectives.map((perspective) => {
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
                className={`relative px-5 py-3 rounded-xl font-serif font-medium text-sm transition-all duration-300 ease-out ${
                  isSelected
                    ? `${perspective.lightBg} ${perspective.darkBg} ${perspective.lightText} ${perspective.darkText} shadow-md ring-1 ${perspective.ringColor}`
                    : `text-boudoir-600 dark:text-boudoir-300 hover:text-boudoir-700 dark:hover:text-boudoir-200 hover:${perspective.lightBg} dark:hover:bg-boudoir-900/20`
                }`}>
                {isSelected && (
                  <span
                    className="absolute inset-0 rounded-xl opacity-40"
                    aria-hidden="true"
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
