import { Link } from "react-router-dom";
import ChapterCover from "../common/ChapterCover";
import type { Chapter } from "../../stores/catalogStore";

interface CarouselItem {
  id: string;
  title: string;
  volumeCount: number;
  imageUrl?: string;
  fallbackTitle: string;
  protagonistName?: string;
  hasStartedReading?: boolean;
}

interface NouveautésSectionProps {
  chapters: Chapter[];
  items: CarouselItem[];
}

export default function NouveautésSection({
  chapters,
  items,
}: NouveautésSectionProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-12">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-3xl font-bold text-accent-gold mb-2 italic">
            Nouveautés
          </h3>
          <p className="text-xs text-charcoal dark:text-white/70 italic">
            Écrits à la lumière de la bougie...
          </p>
        </div>
        <Link
          to="/catalogue"
          className="text-xs uppercase tracking-[0.15em] text-gold hover:text-gold-light transition-colors flex items-center gap-2">
          Catalogue
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((item, index) => (
          <Link
            key={item.id}
            to={`/chapters/${item.id}`}
            className="group">
            <div className="aspect-[3/4] min-w-[150px] overflow-hidden mb-3 relative bg-gradient-to-br from-boudoir-800 to-boudoir-900">
              {item.imageUrl ? (
                <ChapterCover
                  imageUrl={item.imageUrl}
                  title={item.protagonistName || item.title}
                  showPremiumBadge={false}
                  showLimitedEditionBadge={false}
                  showBookmarkIcon={item.hasStartedReading}
                  hasGrayscaleEffect={true}
                  textSize="auto"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-${
                      [
                        "1507003211169-0a1dd7228f2d",
                        "1518531933037-91b2f5f229cc",
                        "1544457070-4cd773b4d71e",
                        "1516450360452-9312f5e86fc7",
                      ][index]
                    }?w=400&q=80')`,
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-boudoir-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            </div>
            <h4 className=" text-sm font-bold text-charcoal dark:text-white/70 group-hover:text-gold transition-colors newsreader">
              {item.title || item.fallbackTitle}
            </h4>
            <p className="text-sm text-charcoal dark:text-white/70 flex items-center gap-2 italic">
              <span className="material-symbols-outlined text-xs">
                library_books
              </span>
              {item.volumeCount > 0
                ? `${item.volumeCount} ${item.volumeCount === 1 ? "volume" : "volumes"}`
                : " "}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
