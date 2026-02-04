import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useTranslation } from "../lib/i18n";
import Library from "./Library";
import PurchaseHistory from "../components/account/PurchaseHistory";
import SupportClaims from "../components/account/SupportClaims";
import MyReviews from "../components/account/MyReviews";
import Subscription from "../components/account/Subscription";
import Preferences from "../components/account/Preferences";
import Notifications from "../components/account/Notifications";
import ConnectedDevices from "../components/account/ConnectedDevices";
import AccountInfo from "../components/account/AccountInfo";
import PaymentMethods from "../components/account/PaymentMethods";

type AccountSection =
  | "my-books"
  | "purchases"
  | "claims"
  | "reviews"
  | "subscription"
  | "preferences"
  | "notifications"
  | "devices"
  | "account-info"
  | "payment-info";

interface MenuItem {
  id: AccountSection;
  label: string;
  icon: string;
  description: string;
}

export default function Account() {
  const [activeSection, setActiveSection] =
    useState<AccountSection>("my-books");
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      id: "my-books",
      label: t("account.menu.my_books"),
      icon: "auto_stories",
      description: t("account.menu.my_books_desc"),
    },
    {
      id: "purchases",
      label: t("account.menu.purchases"),
      icon: "receipt_long",
      description: t("account.menu.purchases_desc"),
    },
    {
      id: "claims",
      label: t("account.menu.claims"),
      icon: "support_agent",
      description: t("account.menu.claims_desc"),
    },
    {
      id: "reviews",
      label: t("account.menu.reviews"),
      icon: "rate_review",
      description: t("account.menu.reviews_desc"),
    },
    {
      id: "subscription",
      label: t("account.menu.subscription"),
      icon: "card_membership",
      description: t("account.menu.subscription_desc"),
    },
    {
      id: "preferences",
      label: t("account.menu.preferences"),
      icon: "tune",
      description: t("account.menu.preferences_desc"),
    },
    {
      id: "notifications",
      label: t("account.menu.notifications"),
      icon: "notifications",
      description: t("account.menu.notifications_desc"),
    },
    {
      id: "devices",
      label: t("account.menu.devices"),
      icon: "devices",
      description: t("account.menu.devices_desc"),
    },
    {
      id: "account-info",
      label: t("account.menu.account_info"),
      icon: "account_circle",
      description: t("account.menu.account_info_desc"),
    },
    {
      id: "payment-info",
      label: t("account.menu.payment_info"),
      icon: "credit_card",
      description: t("account.menu.payment_info_desc"),
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "my-books":
        return <Library />;
      case "purchases":
        return <PurchaseHistory />;
      case "claims":
        return <SupportClaims />;
      case "reviews":
        return <MyReviews />;
      case "subscription":
        return <Subscription />;
      case "preferences":
        return <Preferences />;
      case "notifications":
        return <Notifications />;
      case "devices":
        return <ConnectedDevices />;
      case "account-info":
        return <AccountInfo />;
      case "payment-info":
        return <PaymentMethods />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen  py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#c5a059] text-4xl">
              account_circle
            </span>
            <h1 className="text-4xl font-script text-[#c5a059] newsreader">
              {t("account.page_title")}
            </h1>
          </div>
          <p className="text-charcoal dark:text-white/70 italic text-sm">
            {t("account.welcome_message", { firstName: user?.firstName || "User" })}
          </p>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 md:gap-8">
          {/* Sidebar Navigation */}
          <aside className="flex-shrink-0">
            <div className="bg-gradient-to-br from-[#2d1620]/80 to-[#2d1620]/60 rounded-2xl border border-[#c5a059]/30 p-2 md:p-6 sticky top-24">
              <nav className="grid grid-cols-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    title={item.label}
                    className={`text-left px-2 md:px-4 py-3 rounded-xl transition-all group ${
                      activeSection === item.id
                        ? "bg-[#c5a059]/20 border border-[#c5a059]/50"
                        : "hover:bg-[#c5a059]/10 border border-transparent"
                    }`}>
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`material-symbols-outlined text-lg ${
                          activeSection === item.id
                            ? "text-[#c5a059]"
                            : "text-white/50"
                        }`}>
                        {item.icon}
                      </span>
                      <div className="hidden md:block">
                        <span
                          className={`text-sm font-display italic ${
                            activeSection === item.id
                              ? "text-[#c5a059] font-bold"
                              : "text-white/70 group-hover:text-white"
                          }`}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-xs ml-8 hidden md:block ${
                        activeSection === item.id
                          ? "text-charcoal dark:text-white/60"
                          : "text-charcoal dark:text-white/70"
                      }`}>
                      {item.description}
                    </p>
                  </button>
                ))}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title={t("account.logout_title")}
                  className="w-full text-left px-2 md:px-4 py-3 rounded-xl transition-all group hover:bg-red-900/20 border border-transparent hover:border-red-500/50 mt-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg text-red-400">
                      logout
                    </span>
                    <span className="text-sm font-display italic text-red-400 group-hover:text-red-300 hidden md:inline">
                      {t("account.logout")}
                    </span>
                  </div>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="rounded-2xl border border-[#c5a059]/20 p-8 min-h-[600px]">
              {renderSectionContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
