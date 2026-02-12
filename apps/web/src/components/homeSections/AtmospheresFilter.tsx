import type { Chapter } from "../../stores/catalogStore";

interface Atmosphere {
  id: string;
  label: string;
}

interface AtmospheresFilterProps {
  chapters: Chapter[];
  atmospheres: Atmosphere[];
  selectedAtmosphere: string | null;
  onSelectAtmosphere: (id: string) => void;
}

export default function AtmospheresFilter({
  chapters,
  atmospheres,
  selectedAtmosphere,
  onSelectAtmosphere,
}: AtmospheresFilterProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-6">
      <div className="flex flex-wrap items-center gap-3">
        {atmospheres.map((atm) => (
          <button
            key={atm.id}
            type="button"
            onClick={() =>
              onSelectAtmosphere(atm.id === "all" ? "all" : atm.id)
            }
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              atm.id === "all"
                ? `text-accent-gold border-none bg-transparent uppercase ${
                    selectedAtmosphere === "all"
                      ? "text-gold font-bold"
                      : "text-gold/60 hover:text-gold"
                  }`
                : selectedAtmosphere === atm.id
                  ? "bg-primary text-white"
                  : "bg-boudoir-100 dark:bg-boudoir-900/50 border border-boudoir-200 dark:border-boudoir-800 text-charcoal dark:text-white/70 hover:border-gold/50 dark:hover:border-gold/50"
            }`}>
            {atm.label}
          </button>
        ))}
      </div>
    </section>
  );
}
