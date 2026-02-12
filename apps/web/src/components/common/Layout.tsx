import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950 to-gray-950 flex flex-col">
      {/* Header / Navigation - L'Écrin des Désirs Style */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-gray-950/95 border-b border-amber-500/20 shadow-lg shadow-gray-900/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand - Minimal Style */}
            <Link to="/" className="flex items-center group">
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-bold text-lg">✦</span>
                <h1 className="text-lg font-serif font-bold tracking-wide text-amber-100 group-hover:text-rose-300 transition-colors duration-300">
                  CHER JOURNAL
                </h1>
              </div>
            </Link>

            {/* Center Navigation Links - Like Reference */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-300 hover:text-amber-300 font-medium text-sm transition-colors duration-300"
              >
                Nouveautés
              </Link>
              <Link
                to="/library"
                className="text-gray-300 hover:text-amber-300 font-medium text-sm transition-colors duration-300"
              >
                Collections
              </Link>
              <Link
                to="/profile"
                className="text-gray-300 hover:text-amber-300 font-medium text-sm transition-colors duration-300"
              >
                À propos
              </Link>
            </div>

            {/* Right Side - Search & User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 border border-gray-800 rounded-full">
                <span className="text-gray-500 text-sm">🔍</span>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-rose-300 transition-colors duration-300 font-medium text-sm"
                  title={user?.firstName}
                >
                  👤
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer - Boudoir Moderne */}
      <footer className="border-t border-pink-400/20 bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-slate-900/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Column */}
            <div>
              <h3 className="text-lg font-serif font-bold bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent mb-2">
                Cher Journal
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Découvrez des histoires captivantes, sensuelles et immersives dans notre bibliothèque exclusive.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="text-pink-300 font-serif font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/" className="hover:text-pink-300 transition-colors">
                    Catalogue
                  </Link>
                </li>
                <li>
                  <Link to="/library" className="hover:text-pink-300 transition-colors">
                    Bibliothèque
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-pink-300 transition-colors">
                    Profil
                  </Link>
                </li>
              </ul>
            </div>

            {/* Info Column */}
            <div>
              <h4 className="text-pink-300 font-serif font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-pink-300 transition-colors">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-pink-300 transition-colors">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-pink-300 transition-colors">
                    Nous contacter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Divider */}
          <div className="border-t border-pink-400/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-center md:text-left text-sm text-gray-500">
                © 2026 Cher Journal. Tous droits réservés. 🌹
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Designed with ✨ for romance lovers</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
