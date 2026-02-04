import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950 to-gray-950 flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-gray-950/95 border-b border-amber-500/20 shadow-lg shadow-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center group">
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-bold text-lg">✦</span>
                <h1 className="text-lg font-serif font-bold tracking-wide text-amber-100 group-hover:text-rose-300 transition-colors duration-300">
                  {t('home.brand_name')}
                </h1>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative w-full max-w-7xl mx-auto">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-950/40 via-gray-950 to-purple-950/30 rounded-3xl blur-3xl" />

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="text-amber-300 text-sm font-medium tracking-wider">{t('home.badge_text')}</span>
            </div>

            {/* Main Title - Sensual & Poetic */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold italic text-white mb-2 leading-tight">
              {t('home.hero_prefix')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-pink-400">
                {t('home.hero_highlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-amber-100/70 mb-10 max-w-2xl mx-auto italic leading-relaxed font-light">
              {t('home.hero_subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/catalogue"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-300 hover:scale-105"
              >
                <span>{t('home.cta_explore')}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/library"
                className="inline-flex items-center gap-2 text-white hover:text-rose-300 px-8 py-4 rounded-full font-semibold border-2 border-white/20 hover:border-rose-400/50 transition-all duration-300"
              >
                <span>{t('home.cta_library')}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">100+</div>
                <div className="text-gray-500 text-sm">{t('home.stats_stories')}</div>
              </div>
              <div className="text-center border-x border-gray-800">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-gray-500 text-sm">{t('home.stats_chapters')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-gray-500 text-sm">{t('home.stats_access')}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Inspirational Quote */}
      <section className="py-16 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent relative overflow-hidden border-t border-amber-500/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-rose-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 text-3xl text-rose-400/70">❝❞</div>
          <p className="text-xl sm:text-2xl font-serif italic text-white mb-6 leading-relaxed max-w-3xl mx-auto">
            {t('home.quote_text')}
          </p>
          <p className="text-xs font-semibold tracking-wider text-rose-400 uppercase">{t('home.quote_author')}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-400/20 bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center md:text-left text-sm text-gray-500">
              {t('home.footer_copyright')}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{t('home.footer_credit')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
