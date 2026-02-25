import BookClosed from "./BookClosed";

interface PerspectiveSelectorProps {
  selectedPerspective: string;
  onSelectPerspective: (perspective: string) => void;
  protagonistName?: string;
}

const perspectives = [
  {
    id: "narrateur",
    label: "Version Narrateur",
    color: "#3e5977",
  },
  {
    id: "protagonist",
    label: (name?: string) => `Version ${name || "Protagoniste"}`,
    color: "#6e3e77",
  },
  {
    id: "coloriage",
    label: "Livre de coloriage",
    color: "#3e774f",
  },
];

export default function PerspectiveSelector({
  selectedPerspective,
  onSelectPerspective,
  protagonistName,
}: PerspectiveSelectorProps) {
  return (
    <section className="flex flex-row gap-2 mb-20 text-center h-[250px]">
      {/* Perspective Cards */}
      {perspectives.map((perspective) => (
        <div
          key={perspective.id}
          onClick={() => onSelectPerspective(perspective.id)}
          className={`relative cursor-pointer transition-all ${
            selectedPerspective === perspective.id
              ? "w-[200px] h-[300px]"
              : "w-[195px] h-[250px]"
          }`}>
          <BookClosed
            className=""
            color={perspective.color}
            selected={selectedPerspective === perspective.id}
          />
          <div
            className={`absolute grid grid-rows-[1fr_auto] top-0 ${
              selectedPerspective === perspective.id
                ? "w-[185px] text-2xl leading-6"
                : "w-[150px] text-md"
            } pl-8 pr-2 aspect-[3/4] items-center justify-center newsreader font-bold leading-4 mr-8 cursor-pointer rounded-lg transition-all text-white`}
            onClick={() => onSelectPerspective(perspective.id)}>
            <div className="">
              {typeof perspective.label === "function"
                ? perspective.label(protagonistName)
                : perspective.label}
            </div>
          </div>
        </div>
      ))}

      {/* Courriers Placeholder */}
      <div className="grid aspect-[3/4] p-2 bg-gold/50 border-gold border rounded-md shadow-md items-center justify-center h-[150px]">
        Courriers
      </div>
    </section>
  );
}
