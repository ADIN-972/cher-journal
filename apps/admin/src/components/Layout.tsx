import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "../lib/i18n";
import { useDebugInterface } from "../hooks/useDebugInterface";
import { useState } from "react";
import {
  MdDashboard,
  MdPeople,
  MdShoppingCart,
  MdChevronLeft,
  MdLogout,
  MdMenu,
  MdNotifications,
  MdSettings,
  MdSearch,
  MdBugReport,
  MdLocalOffer,
  MdAttachMoney,
} from "react-icons/md";
import { ImAddressBook } from "react-icons/im";
import { MdTune } from "react-icons/md";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const { isSuperAdmin, debugMode, toggleDebugMode } = useDebugInterface();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const getPageTitle = () => {
    if (location.pathname === "/") return t("navigation.dashboard");
    if (location.pathname.startsWith("/chapters"))
      return t("navigation.chapters");
    if (location.pathname === "/users") return t("navigation.users");
    if (location.pathname === "/orders") return t("navigation.orders");
    if (location.pathname === "/promotions") return "Promotions";
    if (location.pathname === "/prices") return "Tarification";
    if (location.pathname.startsWith("/pricing")) return "Tarification V2";
    if (location.pathname === "/settings") return t("navigation.settings");
    return "Admin";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white transition-all duration-300 shadow-2xl z-40 border-r border-gray-700/50 ${
          sidebarOpen ? "w-72" : "w-20"
        }`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-700/50 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/20">
              CJ
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-lg block">Cher Journal</span>
                <span className="text-xs text-white/70">Administration</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {/* Dashboard */}
          <Link
            to="/"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdDashboard
              className={`w-5 h-5 ${!isActive("/") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <span className="font-medium">{t("navigation.dashboard")}</span>
            )}
            {isActive("/") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Chapters */}
          <Link
            to="/chapters"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/chapters") || location.pathname.includes("/chapters/")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <ImAddressBook
              className={`w-5 h-5 ${!(isActive("/chapters") || location.pathname.includes("/chapters/")) && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <span className="font-medium">{t("navigation.chapters")}</span>
            )}
            {(isActive("/chapters") ||
              location.pathname.includes("/chapters/")) &&
              sidebarOpen && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
          </Link>

          {/* Users */}
          <Link
            to="/users"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/users")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdPeople
              className={`w-5 h-5 ${!isActive("/users") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <span className="font-medium">{t("navigation.users")}</span>
            )}
            {isActive("/users") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Orders */}
          <Link
            to="/orders"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/orders")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdShoppingCart
              className={`w-5 h-5 ${!isActive("/orders") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <span className="font-medium">{t("navigation.orders")}</span>
            )}
            {isActive("/orders") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Promotions */}
          <Link
            to="/promotions"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/promotions")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdLocalOffer
              className={`w-5 h-5 ${!isActive("/promotions") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && <span className="font-medium">Promotions</span>}
            {isActive("/promotions") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Prices */}
          <Link
            to="/prices"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/prices")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdAttachMoney
              className={`w-5 h-5 ${!isActive("/prices") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && <span className="font-medium">Tarifs V1</span>}
            {isActive("/prices") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Pricing V2 */}
          <Link
            to="/pricing/schemas"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              location.pathname.startsWith("/pricing")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdTune
              className={`w-5 h-5 ${!location.pathname.startsWith("/pricing") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-medium">Tarification V2</span>
                <span className="text-xs text-gray-400">Schemas & Audit</span>
              </div>
            )}
            {location.pathname.startsWith("/pricing") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/settings")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdTune
              className={`w-5 h-5 ${!isActive("/settings") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <span className="font-medium">{t("navigation.settings")}</span>
            )}
            {isActive("/settings") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>
        </nav>

        {/* Sidebar toggle */}
        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all duration-200 border border-white/10 group"
            title={
              sidebarOpen
                ? t("navigation.collapse_sidebar")
                : t("navigation.expand_sidebar")
            }>
            <MdChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`}
            />
            {sidebarOpen && (
              <span className="text-sm font-medium">
                {t("navigation.collapse_sidebar")}
              </span>
            )}
          </button>
        </div>

        {/* Decorative gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-600/10 to-transparent pointer-events-none"></div>
      </aside>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
          <div className="h-full px-8 flex justify-between items-center">
            {/* Left section */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MdMenu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {getPageTitle()}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bienvenue dans votre espace d'administration
                </p>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer group">
                <MdSearch className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-gray-700">
                  Rechercher...
                </span>
                <kbd className="hidden xl:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg">
                  ⌘K
                </kbd>
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors group">
                <MdNotifications className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-semibold text-gray-700">
                      {user?.email?.split("@")[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t("header.admin")}
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-semibold shadow-lg border border-white/20">
                            {user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-white">
                            <div className="font-semibold text-sm">
                              {user?.email}
                            </div>
                            <div className="text-xs text-white/80">
                              Administrateur
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            navigate("/settings");
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <MdSettings className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">
                              Paramètres
                            </div>
                            <div className="text-xs text-gray-500">
                              Configuration du compte
                            </div>
                          </div>
                        </button>
                        {isSuperAdmin && (
                          <>
                            <div className="my-2 border-t border-gray-100"></div>
                            <button
                              onClick={toggleDebugMode}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 rounded-xl transition-colors text-left group">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                  debugMode
                                    ? "bg-yellow-100"
                                    : "bg-gray-100 group-hover:bg-yellow-100"
                                }`}>
                                <MdBugReport
                                  className={`w-5 h-5 transition-colors ${
                                    debugMode
                                      ? "text-yellow-600"
                                      : "text-gray-600 group-hover:text-yellow-600"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div
                                  className={`text-sm font-medium transition-colors ${
                                    debugMode
                                      ? "text-yellow-600"
                                      : "text-gray-700"
                                  }`}>
                                  Mode Debug Interface
                                </div>
                                <div className="text-xs text-gray-500">
                                  {debugMode ? "Activé" : "Désactivé"}
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full transition-all ${
                                  debugMode
                                    ? "bg-yellow-500 shadow-lg shadow-yellow-500/50"
                                    : "bg-gray-300"
                                }`}></div>
                            </button>
                          </>
                        )}
                        <div className="my-2 border-t border-gray-100"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors text-left group">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <MdLogout className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                              {t("navigation.logout")}
                            </div>
                            <div className="text-xs text-gray-500">
                              Se déconnecter de l'admin
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="min-h-[calc(100vh-5rem)]">{children}</main>
      </div>
    </div>
  );
}
