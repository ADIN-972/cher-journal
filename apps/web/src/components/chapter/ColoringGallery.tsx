import { useEffect, useState } from 'react';

interface ColoringPage {
  id: string;
  title: string;
  pageNumber: number;
  thumbnailUrl?: string;
  isAvailable: boolean;
}

interface ColoringGalleryProps {
  chapterId: string;
}

export default function ColoringGallery({ chapterId }: ColoringGalleryProps) {
  const [coloringPages, setColoringPages] = useState<ColoringPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch coloring pages from API once implemented
    // For now, we'll show a coming soon message
    setIsLoading(false);
  }, [chapterId]);

  return (
    <div className="w-full py-24 px-4 sm:px-6 lg:px-8">
      {/* Coming Soon Section - Boudoir Style */}
      <div className="max-w-5xl mx-auto">
        {/* Background Decorative Elements */}
        <div className="relative">
          {/* Light Mode Gradient */}
          <div className="hidden dark:hidden absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>

          {/* Dark Mode Gradient */}
          <div className="hidden dark:block absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-900 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-900 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>

          {/* Main Card */}
          <div className="relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-red-200/40 dark:border-red-900/40 overflow-hidden shadow-2xl">
            {/* Decorative Top Border */}
            <div className="h-1 bg-gradient-to-r from-red-500 via-red-400 to-amber-400 dark:from-red-600 dark:via-red-500 dark:to-amber-600"></div>

            <div className="p-12 sm:p-20 text-center">
              {/* Decorative Symbol */}
              <div className="mb-8 flex justify-center">
                <svg
                  className="w-16 h-16 text-red-400 dark:text-red-500 opacity-70"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L15.09 8.26H21.77L16.84 12.74L18.93 19.74L12 15.26L5.07 19.74L7.16 12.74L2.23 8.26H8.91L12 2Z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-4xl sm:text-5xl font-light tracking-wide text-gray-900 dark:text-white mb-4">
                Livre de Coloriage
              </h2>

              {/* Subtitle */}
              <div className="w-16 h-1 bg-gradient-to-r from-red-400 to-amber-400 dark:from-red-600 dark:to-amber-600 mx-auto mb-8"></div>

              {/* Description */}
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed font-light">
                Une expérience artistique et sensuelle vous attend. Des compositions délicates inspirées par l'intimité de ce chapitre, conçues pour vous offrir un moment de détente créatif et personnel.
              </p>

              {/* Secondary Text */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-10 italic">
                Collection exclusive – Bientôt disponible
              </p>

              {/* CTA Badge */}
              <div className="inline-block">
                <div className="px-8 py-3 bg-gradient-to-r from-red-500/20 to-amber-500/20 dark:from-red-600/30 dark:to-amber-600/30 border border-red-300/50 dark:border-red-700/50 rounded-full backdrop-blur-sm hover:from-red-500/30 hover:to-amber-500/30 dark:hover:from-red-600/40 dark:hover:to-amber-600/40 transition-all duration-300">
                  <span className="text-red-700 dark:text-red-300 font-semibold text-sm tracking-wide">
                    À venir
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-amber-500/0 group-hover:from-red-500/10 group-hover:to-amber-500/10 dark:group-hover:from-red-600/10 dark:group-hover:to-amber-600/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/50 transition-all duration-300 shadow-lg hover:shadow-xl">
              {/* Icon */}
              <div className="text-5xl mb-5 text-red-400 dark:text-red-500">🎨</div>

              {/* Title */}
              <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-3 tracking-wide">
                Designs Exclusifs
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                Compositions délicates et refinées, spécialement créées pour ce chapitre
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-amber-500/0 group-hover:from-red-500/10 group-hover:to-amber-500/10 dark:group-hover:from-red-600/10 dark:group-hover:to-amber-600/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/50 transition-all duration-300 shadow-lg hover:shadow-xl">
              {/* Icon */}
              <div className="text-5xl mb-5 text-red-400 dark:text-red-500">💎</div>

              {/* Title */}
              <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-3 tracking-wide">
                Téléchargement Premium
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                Haute résolution pour impression et archivage de vos créations
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-amber-500/0 group-hover:from-red-500/10 group-hover:to-amber-500/10 dark:group-hover:from-red-600/10 dark:group-hover:to-amber-600/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-200/50 dark:hover:border-red-800/50 transition-all duration-300 shadow-lg hover:shadow-xl">
              {/* Icon */}
              <div className="text-5xl mb-5 text-red-400 dark:text-red-500">✨</div>

              {/* Title */}
              <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-3 tracking-wide">
                Galerie Personnelle
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                Conservez et organisez votre collection d'œuvres coloriées
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Text */}
        <div className="mt-16 text-center">
          <p className="text-xs tracking-widest text-gray-500 dark:text-gray-500 uppercase font-light">
            ✦ Une Expérience Sensorielle et Créative ✦
          </p>
        </div>
      </div>
    </div>
  );
}
