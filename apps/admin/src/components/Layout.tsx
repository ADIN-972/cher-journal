import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "../lib/i18n";
import { useDebugInterface } from "../hooks/useDebugInterface";
import { useTheme } from "../hooks/useTheme";
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
  MdSecurity,
  MdTune,
  MdCalendarToday,
  MdCardGiftcard,
  MdRateReview,
  MdContactSupport,
  MdAutoAwesome,
} from "react-icons/md";
import { ImAddressBook } from "react-icons/im";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const { isSuperAdmin, debugMode, toggleDebugMode } = useDebugInterface();
  const { theme, toggleTheme } = useTheme();
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
    if (location.pathname === "/reviews") return t("navigation.reviews");
    if (location.pathname === "/promotions") return t("navigation.promotions");
    if (location.pathname === "/support-claims") return "Support Claims";
    if (location.pathname === "/custom-stories") return "Histoires Personnalisées";
    if (location.pathname.startsWith("/bundles")) return t("navigation.bundles");
    if (location.pathname === "/prices") return t("navigation.pricing");
    if (location.pathname.startsWith("/pricing")) return t("navigation.pricing_v2");
    if (location.pathname === "/settings") return t("navigation.settings");
    if (location.pathname === "/system-config") return t("navigation.system_config");
    return t("header.admin");
  };

  return (
    <div className="h-full min-h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed flex flex-col top-0 left-0 h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white transition-all duration-300 shadow-2xl z-40 border-r border-gray-700/50 ${
          sidebarOpen ? "w-72" : "w-20"
        }`}>
        {/* Logo */}
        <div className="h-20 flex-shrink-0 flex items-center justify-center border-b border-gray-700/50 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/20">
              CJ
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-lg block handwriting">
                  Cher Journal
                </span>
                <span className="text-xs text-white/70">{t("header.admin_subtitle")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-6 mb-24" style={{ minHeight: 0 }}>
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
              <div className="flex flex-col">
                <span className="font-medium">{t("navigation.chapters")}</span>
                <span className="text-xs text-gray-400">
                  {t("navigation.chapters_subtitle")}
                </span>
              </div>
            )}
            {(isActive("/chapters") ||
              location.pathname.includes("/chapters/")) &&
              sidebarOpen && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
          </Link>

          {/* Publishing Calendar */}
          <Link
            to="/publishing-calendar"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/publishing-calendar")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdCalendarToday
              className={`w-5 h-5 ${!isActive("/publishing-calendar") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-medium">{t("navigation.calendar")}</span>
                <span className="text-xs text-gray-400">
                  {t("navigation.calendar_subtitle")}
                </span>
              </div>
            )}
            {isActive("/publishing-calendar") && sidebarOpen && (
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

          {/* Reviews */}
          <Link
            to="/reviews"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/reviews")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdRateReview
              className={`w-5 h-5 ${!isActive("/reviews") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && <span className="font-medium">{t("navigation.reviews")}</span>}
            {isActive("/reviews") && sidebarOpen && (
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
            {sidebarOpen && <span className="font-medium">{t("navigation.promotions")}</span>}
            {isActive("/promotions") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Support Claims */}
          <Link
            to="/support-claims"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/support-claims")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdContactSupport
              className={`w-5 h-5 ${!isActive("/support-claims") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && <span className="font-medium">Support Claims</span>}
            {isActive("/support-claims") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Custom Stories */}
          <Link
            to="/custom-stories"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/custom-stories")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdAutoAwesome
              className={`w-5 h-5 ${!isActive("/custom-stories") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-medium">Histoires Personnalisées</span>
                <span className="text-xs text-gray-400">Modération des demandes</span>
              </div>
            )}
            {isActive("/custom-stories") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Bundles */}
          <Link
            to="/bundles"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              location.pathname.startsWith("/bundles")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdCardGiftcard
              className={`w-5 h-5 ${!location.pathname.startsWith("/bundles") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && <span className="font-medium">{t("navigation.bundles")}</span>}
            {location.pathname.startsWith("/bundles") && sidebarOpen && (
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
            {sidebarOpen && <span className="font-medium">{t("navigation.pricing_v1")}</span>}
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
            <MdAttachMoney
              className={`w-5 h-5 ${!location.pathname.startsWith("/pricing") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-medium">{t("navigation.pricing_v2")}</span>
                <span className="text-xs text-gray-400">{t("navigation.pricing_v2_subtitle")}</span>
              </div>
            )}
            {location.pathname.startsWith("/pricing") && sidebarOpen && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </Link>

          {/* Audit Logs */}
          <Link
            to="/audit-logs"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/audit-logs")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdSecurity
              className={`w-5 h-5 ${!isActive("/audit-logs") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && <span className="font-medium">{t("navigation.audit_logs")}</span>}
            {isActive("/audit-logs") && sidebarOpen && (
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

          {/* System Config */}
          <Link
            to="/system-config"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              isActive("/system-config")
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}>
            <MdSettings
              className={`w-5 h-5 ${!isActive("/system-config") && "group-hover:scale-110 transition-transform"}`}
            />
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-medium">{t("navigation.system_config")}</span>
                <span className="text-xs text-gray-400">{t("navigation.system_config_subtitle")}</span>
              </div>
            )}
            {isActive("/system-config") && sidebarOpen && (
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
        className={`h-full overflow-hidden transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30">
          <div className="h-full px-8 flex justify-between items-center">
            {/* Left section */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MdMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h2 className="text-2xl text-charcoal dark:text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {getPageTitle()}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("layout.welcome_message")}
                </p>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                <MdSearch className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                  {t("common.search_placeholder")}
                </span>
                <kbd className="hidden xl:inline-block px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  ⌘K
                </kbd>
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group">
                <MdNotifications className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
                title={
                  theme === "light"
                    ? t("layout.theme_dark")
                    : t("layout.theme_light")
                }>
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                  {theme === "light" ? "dark_mode" : "light_mode"}
                </span>
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {user?.email?.split("@")[0]}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
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
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left group">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                            <MdSettings className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {t("account.settings")}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {t("account.settings_subtitle")}
                            </div>
                          </div>
                        </button>
                        {isSuperAdmin && (
                          <>
                            <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>
                            <button
                              onClick={toggleDebugMode}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-xl transition-colors text-left group">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                  debugMode
                                    ? "bg-yellow-100 dark:bg-yellow-900"
                                    : "bg-gray-100 dark:bg-gray-700 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900"
                                }`}>
                                <MdBugReport
                                  className={`w-5 h-5 transition-colors ${
                                    debugMode
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-gray-600 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div
                                  className={`text-sm font-medium transition-colors ${
                                    debugMode
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-gray-700 dark:text-gray-200"
                                  }`}>
                                  {t("debug.interface_mode")}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {debugMode ? t("common.enabled") : t("common.disabled")}
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full transition-all ${
                                  debugMode
                                    ? "bg-yellow-500 shadow-lg shadow-yellow-500/50"
                                    : "bg-gray-300 dark:bg-gray-600"
                                }`}></div>
                            </button>
                          </>
                        )}
                        <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left group">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900 transition-colors">
                            <MdLogout className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                              {t("navigation.logout")}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
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
