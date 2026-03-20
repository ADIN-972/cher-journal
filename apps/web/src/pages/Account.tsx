import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useTranslation } from "../lib/i18n";
import { api } from "../lib/api";
import Library from "./Library";
import PurchaseHistory from "../components/account/PurchaseHistory";
import SupportClaims from "../components/account/SupportClaims";
import MyReviews from "../components/account/MyReviews";
import Promotions from "../components/account/Promotions";
import Subscription from "../components/account/Subscription";
import Preferences from "../components/account/Preferences";
import Notifications from "../components/account/Notifications";
import ConnectedDevices from "../components/account/ConnectedDevices";
import AccountInfo from "../components/account/AccountInfo";
import PaymentMethods from "../components/account/PaymentMethods";
import CustomStoryRequests from "../components/account/CustomStoryRequests";

interface MuseChapter {
  id: string;
  chapter: {
    id: string;
    title: string;
    protagonistName: string;
    coverAsset: { url: string } | null;
    status: string;
    publishedAt: string | null;
  };
  customStory: {
    id: string;
    protagonistName: string;
    status: string;
    submittedAt: string;
  } | null;
  promotion: {
    id: string;
    name: string;
    type: string;
    value: number | null;
    scope: string;
    isActive: boolean;
  } | null;
  createdAt: string;
}

type AccountSection =
  | "my-books"
  | "purchases"
  | "claims"
  | "reviews"
  | "promotions"
  | "subscription"
  | "preferences"
  | "notifications"
  | "devices"
  | "account-info"
  | "payment-info"
  | "custom-stories";

interface MenuItem {
  id: AccountSection;
  label: string;
  icon: string;
  description: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const VALID_SECTIONS: AccountSection[] = [
  "my-books", "purchases", "claims", "reviews", "promotions",
  "subscription", "preferences", "notifications", "devices",
  "account-info", "payment-info", "custom-stories",
];

export default function Account() {
  const { section } = useParams<{ section?: string }>();
  const [openSection, setOpenSection] = useState<AccountSection | null>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [museChapters, setMuseChapters] = useState<MuseChapter[]>([]);

  // Fetch muse chapters on mount
  useEffect(() => {
    api.getMyMuseChapters()
      .then((data) => setMuseChapters(data))
      .catch(() => {});
  }, []);

  // Sync URL to open drawer + lock body scroll
  useEffect(() => {
    if (section && VALID_SECTIONS.includes(section as AccountSection)) {
      setOpenSection(section as AccountSection);
      document.body.style.overflow = "hidden";
    } else {
      setOpenSection(null);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [section]);

  const menuSections: MenuSection[] = [
    {
      title: "Ma Bibliotheque",
      items: [
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
          id: "promotions",
          label: t("account.menu.promotions"),
          icon: "card_giftcard",
          description: t("account.menu.promotions_desc"),
        },
      ],
    },
    {
      title: "Interactions",
      items: [
        {
          id: "reviews",
          label: t("account.menu.reviews"),
          icon: "rate_review",
          description: t("account.menu.reviews_desc"),
        },
        {
          id: "custom-stories",
          label: "Mes Demandes",
          icon: "auto_awesome",
          description: "Vos demandes de creation d'histoires personnalisees",
        },
        {
          id: "claims",
          label: t("account.menu.claims"),
          icon: "support_agent",
          description: t("account.menu.claims_desc"),
        },
      ],
    },
    {
      title: "Abonnement",
      items: [
        {
          id: "subscription",
          label: t("account.menu.subscription"),
          icon: "card_membership",
          description: t("account.menu.subscription_desc"),
        },
        {
          id: "payment-info",
          label: t("account.menu.payment_info"),
          icon: "credit_card",
          description: t("account.menu.payment_info_desc"),
        },
      ],
    },
    {
      title: "Parametres",
      items: [
        {
          id: "account-info",
          label: t("account.menu.account_info"),
          icon: "account_circle",
          description: t("account.menu.account_info_desc"),
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
      ],
    },
  ];

  const handleItemPress = (item: MenuItem) => {
    navigate(`/account/${item.id}`);
  };

  const handleCloseDrawer = () => {
    navigate("/account", { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDrawerLabel = (): string => {
    if (!openSection) return "";
    for (const sec of menuSections) {
      const found = sec.items.find((i) => i.id === openSection);
      if (found) return found.label;
    }
    return "";
  };

  const renderSectionContent = () => {
    switch (openSection) {
      case "my-books":
        return <Library />;
      case "purchases":
        return <PurchaseHistory />;
      case "claims":
        return <SupportClaims />;
      case "custom-stories":
        return <CustomStoryRequests />;
      case "reviews":
        return <MyReviews />;
      case "promotions":
        return <Promotions />;
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
    <div className="min-h-screen py-8 px-4 md:py-12 md:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header - avatar + name like mobile */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-[72px] h-[72px] rounded-full bg-[rgba(212,175,55,0.15)] border-2 border-[#c5a059] flex items-center justify-center mb-4">
            <span className="font-display text-3xl text-[#c5a059] font-bold">
              {(user?.firstName?.[0] || "C").toUpperCase()}
            </span>
          </div>
          <h1 className="font-cursive text-4xl text-[#c5a059]">
            {user?.firstName || "Cher"} {user?.lastName || "Lecteur"}
          </h1>
          <p className="text-charcoal/60 dark:text-white/50 text-sm mt-1">
            {user?.email}
          </p>
          <div className="w-12 h-px bg-[#c5a059] mt-5" />
        </div>

        {/* Menu sections - grouped like mobile */}
        {menuSections.map((sec) => (
          <div key={sec.title} className="mb-8">
            <h2 className="font-display italic text-lg text-charcoal dark:text-white/80 mb-3 pl-1">
              {sec.title}
            </h2>
            <div className="flex flex-col gap-2">
              {sec.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemPress(item)}
                  className="w-full flex items-center gap-4 bg-white dark:bg-[#2d1620]/60 rounded-xl border border-boudoir-200 dark:border-[#c5a059]/20 px-4 py-4 text-left transition-all hover:border-[#c5a059]/50 hover:shadow-sm cursor-pointer"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-[rgba(212,175,55,0.08)] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-xl text-[#c5a059]">
                      {item.icon}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-charcoal dark:text-white">
                      {item.label}
                    </span>
                    <p className="text-xs mt-0.5 text-charcoal/50 dark:text-white/40">
                      {item.description}
                    </p>
                  </div>

                  {/* Chevron */}
                  <span className="material-symbols-outlined text-xl text-gray-300 dark:text-gray-600">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Mes Inspirations - Muse chapters */}
        {museChapters.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 pl-1">
              <span className="material-symbols-outlined text-lg text-purple-500 dark:text-purple-400">
                auto_awesome
              </span>
              <h2 className="font-display italic text-lg text-charcoal dark:text-white/80">
                Mes Inspirations
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {museChapters.map((entry) => {
                const coverUrl = entry.chapter.coverAsset?.url
                  ? `${import.meta.env.VITE_API_URL ?? ""}${entry.chapter.coverAsset.url}`
                  : null;

                return (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-[#2d1620]/60 rounded-xl border border-purple-200/60 dark:border-purple-500/20 px-5 py-5 transition-all hover:border-purple-400/50 hover:shadow-sm"
                  >
                    <div className="flex gap-4">
                      {/* Cover thumbnail */}
                      {coverUrl && (
                        <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          <img
                            src={coverUrl}
                            alt={entry.chapter.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Muse badge */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="material-symbols-outlined text-sm text-purple-500 dark:text-purple-400">
                            auto_awesome
                          </span>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            Vous etes la Muse de ce chapitre
                          </span>
                        </div>

                        {/* Chapter title */}
                        <h3 className="font-display italic text-base font-bold text-charcoal dark:text-white truncate">
                          {entry.chapter.title}
                        </h3>

                        {/* Protagonist name */}
                        <p className="text-xs text-charcoal/60 dark:text-white/50 mt-0.5">
                          Protagoniste : {entry.chapter.protagonistName}
                        </p>

                        {/* Custom story link */}
                        {entry.customStory && (
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              history_edu
                            </span>
                            Inspire de votre histoire — {entry.customStory.protagonistName}
                          </p>
                        )}

                        {/* Promotion badge */}
                        {entry.promotion && entry.promotion.isActive && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/40">
                              <span className="material-symbols-outlined text-xs">
                                card_giftcard
                              </span>
                              {entry.promotion.name}
                              {entry.promotion.type === "PERCENT" && entry.promotion.value
                                ? ` — ${entry.promotion.value}%`
                                : entry.promotion.type === "FREE"
                                ? " — Gratuit"
                                : ""}
                            </span>
                          </div>
                        )}

                        {/* Read link */}
                        <Link
                          to={`/chapters/${entry.chapter.id}`}
                          className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                          Lire le chapitre
                          <span className="material-symbols-outlined text-sm">
                            arrow_forward
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all mt-4 mb-8"
        >
          <span className="material-symbols-outlined text-xl text-red-500">
            logout
          </span>
          <span className="text-sm font-semibold text-red-500">
            Se deconnecter
          </span>
        </button>
      </div>

      {/* Drawer overlay + panel */}
      {openSection && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={handleCloseDrawer}
          />

          {/* Drawer */}
          <div
            ref={drawerRef}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-[#1a0a10] shadow-2xl flex flex-col animate-slideInRight"
          >
            {/* Drawer header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-boudoir-200 dark:border-[#c5a059]/20 flex-shrink-0">
              <button
                onClick={handleCloseDrawer}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-boudoir-100 dark:hover:bg-boudoir-900/40 transition-colors"
              >
                <span className="material-symbols-outlined text-xl text-charcoal dark:text-white/70">
                  arrow_back
                </span>
              </button>
              <h2 className="font-display italic text-lg text-[#c5a059]">
                {getDrawerLabel()}
              </h2>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-5">
              {renderSectionContent()}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
