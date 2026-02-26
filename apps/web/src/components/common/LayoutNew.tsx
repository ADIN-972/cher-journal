import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore, initializeTheme } from "../../stores/themeStore";

interface LayoutNewProps {
  children: ReactNode;
}

export default function LayoutNew({ children }: LayoutNewProps) {
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <div className="dark:bg-boudoir-950 dark:text-white bg-light-background dark:bg-background-dark text-light-text min-h-screen flex flex-col">
      {/* Header / TopNavBar */}
      <header className="fixed top-0 w-full   text-soft-gold bg-opacity-70 z-50  dark:bg-background-dark bg-light-surface backdrop-blur-md dark:border-b dark:border-[#c5a059]/30 border-b border-light-border glass-effect">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center gap-10 text-white">
            {/* Mobile Hamburger Button (visible only on mobile/tablet) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-boudoir-900/50 rounded-full transition-colors text-charcoal dark:text-white/70 hover:text-gold"
              aria-label="Menu de navigation"
              aria-expanded={isMobileMenuOpen ? "true" : "false"}>
              <span className="material-symbols-outlined text-xl">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group">
              <span className="text-gold text-xl text-soft-gold">✦</span>
              <h1 className="font-script text-md whitespace-nowrap lg:text-2xl text-gold tracking-wide handwriting text-soft-gold">
                Cher Journal
              </h1>
            </Link>

            {/* Desktop Center Navigation (hidden on mobile/tablet) */}
            <nav className="hidden lg:flex items-center gap-2 text-soft-gold">
              <Link
                to="/"
                className="p-2 hover:bg-boudoir-900/50 rounded-full transition-colors text-charcoal dark:text-white/70 hover:text-gold"
                title="Nouveautés">
                <span className="material-symbols-outlined text-xl">
                  new_releases
                </span>
              </Link>
              <Link
                to="/catalogue"
                className="p-2 hover:bg-boudoir-900/50 rounded-full transition-colors text-charcoal dark:text-white/70 hover:text-gold"
                title="Collections">
                <span className="material-symbols-outlined text-xl">
                  auto_stories
                </span>
              </Link>
              <Link
                to="/profile"
                className="p-2 hover:bg-boudoir-900/50 rounded-full transition-colors text-charcoal dark:text-white/70 hover:text-gold"
                title="À propos">
                <span className="material-symbols-outlined text-xl">info</span>
              </Link>
            </nav>

          </div>

          {/* Right Section - Search & User Actions */}

          {/* Right Section - Search & User Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-charcoal dark:text-white/70 text-sm">
                search
              </span>
              <input
                className="bg-white dark:bg-velvet-brown/50 border border-primary-caramel/30 rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-1 focus:ring-soft-gold focus:border-soft-gold outline-none transition-all placeholder:text-stone-600"
                placeholder="Chercher un récit..."
                type="text"
              />
            </div>
            <div className="hidden md:flex items-center gap-4">
              <nav className="flex items-center gap-8   text-soft-gold"></nav>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2  text-soft-gold">
              <button
                className="p-2 hover:bg-boudoir-900/50 rounded-full transition-colors text-charcoal dark:text-white/70 hover:text-gold"
                onClick={toggleTheme}
                title={isDark ? "Mode clair" : "Mode sombre"}>
                <span className="material-symbols-outlined text-xl">
                  {isDark ? "light_mode" : "dark_mode"}
                </span>
              </button>
              <Link
                to="/library"
                className="p-2 hover:bg-boudoir-900/50 rounded-full transition-colors text-charcoal dark:text-white/70 hover:text-gold"
                title="Ma bibliothèque">
                <span className="material-symbols-outlined text-xl">
                  bookmark
                </span>
              </Link>
              <Link
                to="/timers"
                className="p-2 hover:bg-boudoir-900/50 rounded-full transition-colors text-charcoal dark:text-white/70 hover:text-gold"
                title="Mes timers actifs">
                <span className="material-symbols-outlined text-xl">
                  schedule
                </span>
              </Link>
              <Link
                to="/account"
                className="p-2 hover:bg-boudoir-900/50 rounded-full transition-colors text-charcoal dark:text-white/70 hover:text-gold"
                title={user?.firstName || "Mon compte"}>
                <span className="material-symbols-outlined text-xl">
                  person
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay Backdrop */}
          <div
            className="fixed inset-0 top-16 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu */}
          <nav className="fixed top-16 left-0 right-0 bg-boudoir-950 dark:bg-boudoir-950 border-b border-boudoir-800 z-40 lg:hidden max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {/* Nouveautés */}
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-boudoir-900/50 transition-colors">
                <span className="material-symbols-outlined text-xl text-gold">new_releases</span>
                <span className="font-serif text-base">Nouveautés</span>
              </Link>

              {/* Collections */}
              <Link
                to="/catalogue"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-boudoir-900/50 transition-colors">
                <span className="material-symbols-outlined text-xl text-gold">auto_stories</span>
                <span className="font-serif text-base">Collections</span>
              </Link>

              {/* Library (restored) */}
              <Link
                to="/library"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-boudoir-900/50 transition-colors">
                <span className="material-symbols-outlined text-xl text-gold">bookmark</span>
                <span className="font-serif text-base">Ma Bibliothèque</span>
              </Link>

              {/* Mes Timers Actifs */}
              <Link
                to="/timers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-boudoir-900/50 transition-colors">
                <span className="material-symbols-outlined text-xl text-gold">schedule</span>
                <span className="font-serif text-base">Mes Timers Actifs</span>
              </Link>

              {/* À Propos / Profile */}
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-boudoir-900/50 transition-colors">
                <span className="material-symbols-outlined text-xl text-gold">info</span>
                <span className="font-serif text-base">À Propos</span>
              </Link>

              {/* Account / Mon Compte */}
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-boudoir-900/50 transition-colors">
                <span className="material-symbols-outlined text-xl text-gold">person</span>
                <span className="font-serif text-base">Mon Compte</span>
              </Link>

              {/* Divider */}
              <div className="my-3 border-t border-boudoir-800" />

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-boudoir-900/50 transition-colors">
                <span className="material-symbols-outlined text-xl text-gold">
                  {isDark ? "light_mode" : "dark_mode"}
                </span>
                <span className="font-serif text-base">{isDark ? "Mode Clair" : "Mode Sombre"}</span>
              </button>
            </div>
          </nav>
        </>
      )}

      {/* Main Content */}
      <main className="pt-16 flex-1 text-white">{children}</main>

      {/* Footer */}
      <footer className="border-t pt-16 pb-8 bg-boudoir-200 border-boudoir-400 text-white/70 dark:bg-boudoir-950 dark:border-boudoir-900 dark:text-white/70">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gold">✦</span>
                <h2 className="font-script text-2xl text-gold handwriting">
                  Cher Journal
                </h2>
              </div>
              <p className="text-sm  text-slate-500 dark:text-white/70 font-light leading-relaxed">
                Une bibliothèque numérique d'exception pour les esprits
                audacieux. Des récits élégants, poétiques et artistiques pensés
                comme des écrins de sens.
              </p>
            </div>

            {/* Navigation Links */}
            <div>
              <h6 className="text-xs uppercase tracking-[0.2em] text-charcoal dark:text-white/70 font-semibold mb-6">
                Navigation
              </h6>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-slate-500 dark:text-white/70 hover:text-gold transition-colors">
                    Nouveautés
                  </Link>
                </li>
                <li>
                  <Link
                    to="/catalogue"
                    className="text-slate-500 dark:text-white/70 hover:text-gold transition-colors">
                    Collections Thématiques
                  </Link>
                </li>
                <li>
                  <Link
                    to="/timers"
                    className="text-slate-500 dark:text-white/70 hover:text-gold transition-colors">
                    Mes Timers Actifs
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-white/70 hover:text-gold transition-colors">
                    Le Club Privé
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-white/70 hover:text-gold transition-colors">
                    Abonnements
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h6 className="text-xs uppercase tracking-[0.2em] text-charcoal dark:text-white/70 font-semibold mb-6">
                Légal
              </h6>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-white/70 hover:text-gold transition-colors">
                    Conditions d'Utilisation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-white/70 hover:text-gold transition-colors">
                    Confidentialité
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-white/70 hover:text-gold transition-colors">
                    Vérification d'Âge
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h6 className="text-xs uppercase tracking-[0.2em]  text-charcoal dark:text-white/70 font-semibold mb-6">
                La Lettre Secrète
              </h6>
              <p className="text-xs text-slate-500 dark:text-white/70 mb-4 font-light">
                Recevez un chapitre exclusif chaque mois dans votre boîte aux
                lettres numérique.
              </p>
              <form className="flex flex-col gap-2">
                <input
                  className="bg-boudoir-900/50 border border-boudoir-800 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-gold/50 outline-none transition-all placeholder:text-white/70 dark:placeholder:text-charcoal dark:text-white/70"
                  placeholder="Votre adresse mail"
                  type="email"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-white py-2.5 rounded-lg font-semibold text-sm tracking-wide transition-all">
                  M'INSCRIRE
                </button>
              </form>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-boudoir-900 pt-8 gap-4">
            <p className="text-[10px] text-charcoal dark:text-white/70 uppercase tracking-widest">
              © 2026 Cher journal. Interdit aux mineurs.
            </p>
            <div className="flex gap-4">
              <a
                className="text-charcoal dark:text-white/70 hover:text-gold transition-colors"
                href="#">
                <span className="material-symbols-outlined text-lg">
                  photo_camera
                </span>
              </a>
              <a
                className="text-charcoal dark:text-white/70 hover:text-gold transition-colors"
                href="#">
                <span className="material-symbols-outlined text-lg">edit</span>
              </a>
              <a
                className="text-charcoal dark:text-white/70 hover:text-gold transition-colors"
                href="#">
                <span className="material-symbols-outlined text-lg">mail</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
