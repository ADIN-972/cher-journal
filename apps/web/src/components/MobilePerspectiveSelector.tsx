interface MobilePerspectiveSelectorProps {
  selectedPerspective: "narrateur" | "protagonist" | "coloriage" | null;
  onSelectPerspective: (
    perspective: "narrateur" | "protagonist" | "coloriage"
  ) => void;
  protagonistName?: string | null;
}

export default function MobilePerspectiveSelector({
  selectedPerspective,
  onSelectPerspective,
  protagonistName,
}: MobilePerspectiveSelectorProps) {
  return (
    <section className="flex my-10 md:hidden">
      <div
        className="flex mx-auto gap-1 bg-gray-100 rounded-lg p-1"
        aria-label="Sélection de perspective">
        {/* Narrateur Button */}
        <button
          type="button"
          onClick={() => onSelectPerspective("narrateur")}
          className={`p-2 rounded-md transition-all ${
            selectedPerspective === "narrateur"
              ? "bg-white text-rose-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          title="Version Narrateur">
          Version Narrateur
        </button>

        {/* Protagonist Button */}
        <button
          type="button"
          onClick={() => onSelectPerspective("protagonist")}
          className={`p-2 rounded-md transition-all ${
            selectedPerspective === "protagonist"
              ? "bg-white text-rose-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          title="Version Protagoniste">
          Version {protagonistName || "Protagoniste"}
        </button>

        {/* Coloring Button */}
        <button
          type="button"
          onClick={() => onSelectPerspective("coloriage")}
          className={`p-2 rounded-md transition-all ${
            selectedPerspective === "coloriage"
              ? "bg-white text-rose-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          title="Livre de coloriage">
          Coloriage
        </button>
      </div>
    </section>
  );
}
