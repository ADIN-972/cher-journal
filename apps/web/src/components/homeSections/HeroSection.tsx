import { Link } from "react-router-dom";
import ChapterCover from "../common/ChapterCover";
import type { Chapter } from "../../stores/catalogStore";

interface HeroSectionProps {
  chapters: Chapter[];
  heroData: {
    title: string;
    subtitle: string;
    description: string;
    imageUrl?: string;
    id: string;
    hasStartedReading?: boolean;
  };
}

export default function HeroSection({ chapters, heroData }: HeroSectionProps) {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 bg-cover bg-center homeBanner" />
      <div className="absolute inset-0 bg-gradient-to-r dark:from-boudoir-950/80  dark:via-boudoir-950/60 to-transparent" />

      {/* Hero Content */}
      <div className="relative h-full max-w-[1280px] mx-auto px-6 flex flex-col justify-center items-start">
        <div className="max-w-4xl space-y-6">
          {/* Badge */}
          <span className="inline-block bg-primary text-white text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-1.5 rounded">
            La sélection du moment
          </span>
          <div className="grid grid-cols-[150px_1fr] w-full gap-2">
            <div>
              <div className="aspect-[3/4] shrink-0 rounded-lg overflow-hidden relative bg-gradient-to-br from-boudoir-200 to-boudoir-300 dark:from-boudoir-800 dark:to-boudoir-900 shadow-sm">
                {heroData.imageUrl ? (
                  <ChapterCover
                    imageUrl={heroData.imageUrl}
                    title={heroData.subtitle}
                    showPremiumBadge={false}
                    showLimitedEditionBadge={false}
                    showBookmarkIcon={false}
                    textSize={"2xl"}
                    hasGrayscaleEffect={true}
                  />
                ) : (
                  <div
                    className="absolute w-full h-full object-cover grayscale opacity-50 inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('/assets/images/404_bg.png')`,
                    }}
                  />
                )}
              </div>
            </div>
            <div>
              {/* Main Title */}
              <h2 className="text-4xl md:text-7xl leading-none text-charcoal dark:text-white handwriting">
                <span className="text-charcoal dark:text-white italic">
                  {heroData.title}
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-xl text-charcoal dark:text-white/70 max-w-md leading-relaxed mt-4 italic Newsreader">
                {heroData.description}
              </p>
            </div>
          </div>
          {/* CTA Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Link
              to={`/chapters/${heroData.id}`}
              className="bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-lg font-bold tracking-wide transition-all transform hover:scale-105">
              S'IMMERGER
            </Link>
            <Link
              to="/catalogue"
              className="border border-charcoal dark:border-white/20 hover:bg-white/5 text-charcoal dark:text-white px-8 py-4 rounded-lg font-bold tracking-wide transition-all whitespace-nowrap">
              LE CATALOGUE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
