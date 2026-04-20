import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Chapter } from "../../stores/catalogStore";
import ChapterCover from "../common/ChapterCover";

interface CarouselItem {
  id: string;
  title: string;
  volumeCount: number;
  imageUrl?: string;
  fallbackTitle: string;
  protagonistName?: string;
  hasStartedReading?: boolean;
  accroche_classic?: string;
  accroche_dark?: string;
  accroche_dark_collection?: string;
  accroche_love?: string;
  accroche_marketing?: string;
  description?: string;
  genres?: { genre: string }[];
  niveau_danger?: number;
  niveau_douceur?: number;
  niveau_intensite?: number;
  niveau_transformation?: number;
  isPrivate?: boolean;
}

interface NouveautesSectionV2Props {
  chapters: Chapter[];
  items: CarouselItem[];
}

// ── Animation timing ──────────────────────────────────────────────────────────
const OPEN_MS = 1000000; // how long cover stays visible
const ANIM_MS = 900; // open/close rotation duration (must match .bsv2-book transition)
const PAUSE_MS = 380; // gap between close and next open
const SWEEP_MS = 400; // shelf slide-out / slide-in duration

// ── Book geometry (must match values in .bsv2-* CSS classes) ─────────────────
const SPINE_W = 38; // px – spine face width
const BOOK_GAP = 7; // px – gap between book slots

// ── Rotation angles (CSS custom property --deg on each slot) ─────────────────
// 0°   → spine face (front) faces the viewer
// -85° → cover face (side) faces the viewer
const DEG_CLOSED = 0;
const DEG_OPEN = -85;

// ── Spread geometry (must match .bsv2-cover width in CSS) ────────────────────
const COVER_W = 220; // px – cover face width (matches .bsv2-cover)
const SPREAD_R = COVER_W - SPINE_W; // px – right books slide this far when cover opens
const SPREAD_L = 0; // px – left books nudge slightly left

const BOOK_W = SPINE_W;
const BOOK_H = 274;
const BOOK_COVER_W = 220;

// ── Spine/cover palette ───────────────────────────────────────────────────────
const SPINE_COLORS = [
  { bg: "linear-gradient(175deg, #6B1E2A 0%, #3a0a12 100%)", fb: "#4a0d18" },
  { bg: "linear-gradient(175deg, #2D1620 0%, #1a0a0e 100%)", fb: "#1a0a0e" },
  { bg: "linear-gradient(175deg, #1E2B4A 0%, #0a1220 100%)", fb: "#0d1a2e" },
  { bg: "linear-gradient(175deg, #2A1E2D 0%, #140a18 100%)", fb: "#180d1f" },
  { bg: "linear-gradient(175deg, #1E2A20 0%, #0a1410 100%)", fb: "#0d1a11" },
  { bg: "linear-gradient(175deg, #3A2010 0%, #1e0e05 100%)", fb: "#261508" },
];

export default function NouveautesSectionV2({
  chapters: _chapters,
  items,
}: NouveautesSectionV2Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const shelfRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const killTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const after = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  // Slide shelf right → teleport left → slide back (DOM-driven, no extra state).
  const sweepToStart = (onDone: () => void) => {
    const el = shelfRef.current;
    if (!el) {
      onDone();
      return;
    }
    el.style.transition = `transform ${SWEEP_MS}ms cubic-bezier(0.4,0,1,1)`;
    el.style.transform = "translateX(110%)";
    after(() => {
      el.style.transition = "none";
      el.style.transform = "translateX(-110%)";
      void el.offsetWidth; // force reflow
      el.style.transition = `transform ${SWEEP_MS}ms cubic-bezier(0,0,0.2,1)`;
      el.style.transform = "translateX(0)";
      after(onDone, SWEEP_MS);
    }, SWEEP_MS);
  };

  // ── Animation loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (items.length === 0) return;
    killTimers();

    after(() => setIsOpen(true), 50);
    after(() => setIsOpen(false), 50 + OPEN_MS);

    after(
      () => {
        const next = (activeIndex + 1) % items.length;
        const isLoop = next === 0 && items.length > 1;
        if (isLoop) sweepToStart(() => setActiveIndex(0));
        else setActiveIndex(next);
      },
      50 + OPEN_MS + ANIM_MS + PAUSE_MS,
    );

    return killTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, items.length]);

  const handleDotClick = (index: number) => {
    killTimers();
    setIsOpen(false);
    if (shelfRef.current) {
      shelfRef.current.style.transition = "none";
      shelfRef.current.style.transform = "translateX(0)";
    }
    after(() => setActiveIndex(index), 120);
  };

  if (items.length === 0) return null;

  const totalW =
    items.length * BOOK_W + (items.length - 1) * BOOK_GAP + BOOK_COVER_W;

  return (
    <section className="lg:hidden max-w-[1280px] mx-auto px-6 md:px-6 py-16 md:py-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline gap-4 mb-10 md:mb-16">
        <div className="">
          <h3 className="text-3xl md:text-4xl font-display italic text-stone-700 dark:text-stone-100 newsreader">
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

      {/* Shelf */}
      <div className="flex flex-col items-center">
        {/* Clip – prevents sweep bleed */}
        <div
          className="bsv2-clip "
          style={{ width: `${totalW + 160}px` }}>
          {/* Row – translated by sweepToStart() via ref */}
          <div
            ref={shelfRef}
            className="bsv2-shelf-row"
            style={{
              height: "274px",
              // width: `${totalW}px`
            }}>
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              const deg = isActive && isOpen ? DEG_OPEN : DEG_CLOSED;
              const palette = SPINE_COLORS[index % SPINE_COLORS.length];
              const spineLabel =
                item.protagonistName || item.title || item.fallbackTitle;
              const coverImg = item.imageUrl ? `url(${item.imageUrl})` : "";

              const spreadX = isOpen
                ? index < activeIndex
                  ? -SPREAD_L
                  : index > activeIndex
                    ? SPREAD_R
                    : 0
                : 0;
              return (
                // Dynamic values as CSS custom properties – consumed by .bsv2-* rules.
                // Static layout/perspective/3D handled entirely by CSS classes.
                <div
                  key={item.id}
                  className={`bsv2-slot ${isActive ? " bsv2-active" : ""}`}
                  style={
                    {
                      width: `${BOOK_W}px`,
                      height: `${BOOK_H}px`,
                      left: `${index * (SPINE_W + BOOK_GAP)}px`,
                      "--deg": `${deg}deg`,
                      "--spine-bg": palette.bg,
                      "--cover-img": coverImg,
                      "--cover-fb": palette.fb,
                      "--spread-x": `${spreadX}px`,
                    } as React.CSSProperties
                  }>
                  {/* ── 3-D book ─────────────────────────────────────────────
                   *  .bsv2-book reads --deg to apply rotateY() and uses
                   *  transform-style: preserve-3d so both child faces share
                   *  the same 3-D context established by the slot's perspective.
                   * ────────────────────────────────────────────────────────── */}
                  <div
                    className="bsv2-book"
                    style={{ width: `${BOOK_W}px`, height: `${BOOK_H}px` }}>
                    {/* Face 1 – Spine (front, reads --spine-bg) */}
                    <div
                      className="bsv2-spine handwriting text-3xl"
                      onClick={() => handleDotClick(index)}>
                      <div className="bsv2-spine-rule bsv2-spine-rule-top" />
                      <span className="bsv2-spine-title">{spineLabel}</span>
                      <div className="bsv2-spine-rule bsv2-spine-rule-bottom" />
                    </div>

                    {/* Face 2 – Cover (side face, rotateY 90° in CSS) */}
                    <Link
                      to={`/chapters/${item.id}`}
                      className="bsv2-cover"
                      style={{
                        left: `${BOOK_W}px`,
                        width: `${BOOK_COVER_W}px`,
                        height: `${BOOK_H}px`,
                      }}>
                      {
                        item.imageUrl ? (
                          <ChapterCover
                            imageUrl={item.imageUrl}
                            title={item.protagonistName || item.title}
                            showPremiumBadge={false}
                            showLimitedEditionBadge={false}
                            showBookmarkIcon={item.hasStartedReading}
                            roundedLeft={false}
                            bordered={true}
                            // hasGrayscaleEffect={true}
                            textSize="auto"
                            isAccesClub={item.isPrivate}
                          /> /* reads --cover-img */
                        ) : (
                          <div className="bsv2-cover-fallback" />
                        ) /* reads --cover-fb  */
                      }
                      <div className="bsv2-cover-shadow-l" />
                      {/* <div className="bsv2-cover-shadow-r" /> */}
                      {/* <div className="bsv2-cover-info">
                        <p className="bsv2-cover-title">
                          {item.title || item.fallbackTitle}
                        </p>
                        {item.volumeCount > 0 && (
                          <p className="bsv2-cover-volumes">
                            {item.volumeCount} VOLUME{item.volumeCount > 1 ? 'S' : ''}
                          </p>
                        )}
                      </div> */}
                    </Link>
                  </div>
                </div>
              );
            })}
            <div className="absolute hidden md:grid right-0 w-2/6 h-full items-center justify-center overflow-hidden">
              <div
                className={`grid grid-[auto_1fr] gap-3 text-charcoal dark:text-white/70 w-full h-full overflow-hidden text-ellipsis leading-relaxed mt-4 p-3 italic Newsreader `}>
                <div className="text-xl font-bold">
                  {items[activeIndex].title}
                </div>
                <div className="grid h-full w-full text- overflow-hidden text-ellipsis   text-sm">
                  {items[activeIndex].accroche_classic}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shelf ledge */}
        <div
          className="bsv2-ledge"
          style={{ width: `${90}%` }}
        />
        <div
          className="bsv2-ledge-shadow"
          style={{ width: `${80}%` }}
        />

        {/* Progress dots – width toggled via class, no inline style */}
        <div className="flex items-center gap-2 mt-2">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleDotClick(index)}
              aria-label={`Livre ${index + 1}`}
              className={`bsv2-dot${index === activeIndex ? " bsv2-dot--active" : ""} !bg-gold`}
            />
          ))}
        </div>
        <div className="grid md:hidden">
          {items.map((item, index) => {
            return (
              <div
                key={item.id}
                className={`${index === activeIndex ? "" : "hidden"} text-charcoal dark:text-white/70 max-w-md leading-relaxed mt-4 italic Newsreader`}>
                <div className="text-xl font-bold"> {item.title}</div>
                <div className="py-4"> {item.accroche_classic}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
