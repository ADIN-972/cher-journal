import { Link } from "react-router-dom";
import ChapterCard from "../common/ChapterCard";
import type { Chapter } from "../../stores/catalogStore";

interface PopularItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  subtitle: string;
  description?: string;
  genres: any[];
  imageUrl?: string;
}

interface MostPassionateSectionProps {
  chapters: Chapter[];
  items: PopularItem[];
}

export default function MostPassionateSection({
  chapters,
  items,
}: MostPassionateSectionProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-16">
      {/* Section Header */}
      <div className="mb-10">
        <h3 className="text-3xl font-bold text-accent-gold mb-2 italic">
          Les plus passionnants
        </h3>
      </div>

      {/* Popular Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item: any, index: number) => (
          <Link key={item.id} to={`/chapters/${item.id}`}>
            <ChapterCard
              imageUrl={item.imageUrl}
              title={item.title}
              badge={item.badge}
              badgeColor={item.badgeColor}
              subtitle={item.subtitle}
              description={item.accroche_marketing || item.description}
              genres={item.genres}
              fallbackImageIndex={index}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
