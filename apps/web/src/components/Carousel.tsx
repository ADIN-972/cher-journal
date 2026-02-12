import { useRef } from 'react';
import { Link } from 'react-router-dom';

interface CarouselItem {
  id: string;
  title: string;
  readingTime: number;
  badge?: string;
  imageUrl?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  title: string;
  showViewAll?: boolean;
}

export default function Carousel({ items, title, showViewAll = true }: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="max-w-[1280px] mx-auto px-6 py-12">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h3 className="text-3xl font-bold dark:text-accent-gold mb-2 italic">{title}</h3>
          <div className="h-1 w-20 bg-primary"></div>
        </div>
        {showViewAll && (
          <Link to="/catalogue" className="text-sm font-medium hover:text-primary flex items-center gap-2">
            Tout explorer
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto custom-scrollbar pb-6 scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          {items.map((item) => (
            <div key={item.id} className="min-w-[300px] group cursor-pointer">
              {/* Card Image */}
              <Link to={`/chapters/${item.id}`} className="block">
                <div className="aspect-[1/1] overflow-hidden rounded-lg mb-4 relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: item.imageUrl
                        ? `url(${item.imageUrl})`
                        : 'linear-gradient(135deg, rgb(239, 68, 68), rgb(217, 119, 6))'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all"></div>
                  {item.badge && (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary/90 text-[10px] text-white px-2 py-1 rounded uppercase tracking-tighter">
                        {item.badge}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Card Info */}
              <h4 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
              <p className="text-sm text-gray-500 flex items-center gap-2 italic">
                <span className="material-symbols-outlined text-xs">schedule</span>
                {item.readingTime} min de lecture
              </p>
            </div>
          ))}
        </div>

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-white/10 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
          title="Scroll left"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-white/10 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
          title="Scroll right"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </section>
  );
}
