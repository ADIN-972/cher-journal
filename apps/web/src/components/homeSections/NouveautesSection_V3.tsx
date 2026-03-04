import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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

interface NouveautesSectionV3Props {
  chapters: Chapter[];
  items: CarouselItem[];
}

// ── Animation timing ─────────────────────────────────────────────────────────
const OPEN_MS = 3200; // how long cover stays visible
const ANIM_MS = 820; // open/close rotation duration
const PAUSE_MS = 380; // gap between close and next open
const SWEEP_MS = 420; // shelf slide-out / slide-in duration

// ── Book geometry ─────────────────────────────────────────────────────────────
const SPINE_W = 46; // px – visible spine width
const COVER_W = 178; // px – full cover width
const BOOK_H = 272; // px – book height
const BOOK_GAP = 6; // px – gap between book slots

// ── 3-D rotation angles ───────────────────────────────────────────────────────
const DEG_CLOSED = 82; // nearly edge-on: spine faces viewer
const DEG_OPEN = 12; // mostly face-on: cover faces viewer (slight tilt for depth)

// ── Spine gradients (one per book slot, cycling) ──────────────────────────────
const SPINE_GRADIENTS = [
  "linear-gradient(175deg, #6B1E2A 0%, #3a0a12 100%)",
  "linear-gradient(175deg, #2D1620 0%, #1a0a0e 100%)",
  "linear-gradient(175deg, #1E2B4A 0%, #0a1220 100%)",
  "linear-gradient(175deg, #2A1E2D 0%, #140a18 100%)",
  "linear-gradient(175deg, #1E2A20 0%, #0a1410 100%)",
  "linear-gradient(175deg, #3A2010 0%, #1e0e05 100%)",
];

export default function NouveautesSectionV3({
  chapters: _chapters,
  items,
}: NouveautesSectionV3Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const shelfRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const killTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const after = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  /**
   * Slide the shelf off to the right, teleport to the left, slide back to center.
   * Uses direct DOM style manipulation so the 3-step animation runs outside React's
   * render cycle (avoids the need for 3 separate state phases).
   */
  const sweepToStart = (onDone: () => void) => {
    const el = shelfRef.current;
    if (!el) {
      onDone();
      return;
    }

    // 1. Slide out → right
    el.style.transition = `transform ${SWEEP_MS}ms cubic-bezier(0.4, 0, 1, 1)`;
    el.style.transform = "translateX(110%)";

    after(() => {
      // 2. Jump to left (no transition – books are "offscreen")
      el.style.transition = "none";
      el.style.transform = "translateX(-110%)";
      void el.offsetWidth; // force reflow so the jump takes effect immediately

      // 3. Slide in ← center
      el.style.transition = `transform ${SWEEP_MS}ms cubic-bezier(0, 0, 0.2, 1)`;
      el.style.transform = "translateX(0)";

      after(onDone, SWEEP_MS);
    }, SWEEP_MS);
  };

  // ── Main animation loop ───────────────────────────────────────────────────────
  useEffect(() => {
    if (items.length === 0) return;

    killTimers();

    // Open the active book
    after(() => setIsOpen(true), 50);

    // Close it after OPEN_MS
    after(() => setIsOpen(false), 50 + OPEN_MS);

    // After close animation, advance
    after(
      () => {
        const next = (activeIndex + 1) % items.length;
        const isLoop = next === 0 && items.length > 1;

        if (isLoop) {
          sweepToStart(() => setActiveIndex(0));
        } else {
          setActiveIndex(next);
        }
      },
      50 + OPEN_MS + ANIM_MS + PAUSE_MS,
    );

    return killTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, items.length]);

  // ── Dot click ─────────────────────────────────────────────────────────────────
  const handleDotClick = (index: number) => {
    killTimers();
    setIsOpen(false);
    // Reset shelf position in case sweep was in progress
    if (shelfRef.current) {
      shelfRef.current.style.transition = "none";
      shelfRef.current.style.transform = "translateX(0)";
    }
    // Delay slightly so close state renders before switching
    after(() => setActiveIndex(index), 120);
  };

  if (items.length === 0) return null;

  const totalW = items.length * SPINE_W + (items.length - 1) * BOOK_GAP;

  return (
    <section className="max-w-[1280px] mx-auto px-6 md:px-8 py-16 md:py-24">
      {/* ── Section header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline gap-4 mb-10 md:mb-16">
        <div>
          <h3 className="text-3xl md:text-4xl font-display italic text-stone-100">
            Nouveautés
          </h3>
          <p className="handwriting text-xl md:text-2xl text-primary-caramel mt-1">
            Écrits à la lumière de la bougie...
          </p>
        </div>
        <Link
          to="/catalogue"
          className="text-[10px] uppercase tracking-[0.2em] text-soft-gold hover:text-stone-100 flex items-center gap-3 transition-colors group">
          Voir l'intégralité
          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>

      {/* ── Shelf ───────────────────────────────────────────────────────────── */}
      <div className="gap-8 md:gap-10">
        <div className="carousel-track flex justify-center items-end h-[500px] w-full">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const deg = isActive && isOpen ? DEG_OPEN : DEG_CLOSED;
            const spineBg = SPINE_GRADIENTS[index % SPINE_GRADIENTS.length];
            const spineLabel =
              item.protagonistName || item.title || item.fallbackTitle;

            return (
              <div
                key={index}
                className={`book-container book-animate-${index + 1}`}>
                <div className="book-content">
                  <div className="book-spine">
                    <span className="[writing-mode:vertical-lr] text-soft-gold uppercase tracking-[0.3em] font-bold text-xs">
                      {spineLabel}
                    </span>
                  </div>
                  <div
                    className="book-cover"
                    style={{
                      backgroundImage: `url('${item.imageUrl}')`,
                      backgroundPosition: "0% center",
                    }}></div>
                </div>
              </div>
            );
          })}

          {/* <!-- Book 1 --> */}
          {/* <div className="book-container book-animate-1">
            <div className="book-content">
              <div className="book-spine">
                <span className="[writing-mode:vertical-lr] text-soft-gold uppercase tracking-[0.3em] font-bold text-xs">
                  Sunshine
                </span>
              </div>
              <div
                className="book-cover"
                style="background-image: url('{{DATA:IMAGE:IMAGE_115}}'); background-position: 0% center;"></div>
            </div>
          </div> */}
          {/* <!-- Book 2 --> */}
          {/* <div className="book-container book-animate-2">
            <div className="book-content">
              <div className="book-spine">
                <span className="[writing-mode:vertical-lr] text-soft-gold uppercase tracking-[0.3em] font-bold text-xs">
                  Pauline
                </span>
              </div>
              <div
                className="book-cover"
                style="background-image: url('{{DATA:IMAGE:IMAGE_115}}'); background-position: 33% center;"></div>
            </div>
          </div> */}
          {/* <!-- Book 3 --> */}
          {/* <div className="book-container book-animate-3">
            <div className="book-content">
              <div className="book-spine">
                <span className="[writing-mode:vertical-lr] text-soft-gold uppercase tracking-[0.3em] font-bold text-xs">
                  Anna
                </span>
              </div>
              <div
                className="book-cover"
                style="background-image: url('{{DATA:IMAGE:IMAGE_115}}'); background-position: 66% center;"></div>
            </div>
          </div> */}
          {/* <!-- Book 4 --> */}
          {/* <div className="book-container book-animate-4">
            <div className="book-content">
              <div className="book-spine">
                <span className="[writing-mode:vertical-lr] text-soft-gold uppercase tracking-[0.3em] font-bold text-xs">
                  Elodie
                </span>
              </div>
              <div
                className="book-cover"
                style="background-image: url('{{DATA:IMAGE:IMAGE_115}}'); background-position: 100% center;"></div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
