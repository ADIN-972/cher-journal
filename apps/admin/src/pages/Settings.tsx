import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";
import {
  MdSettings,
  MdPalette,
  MdLanguage,
  MdDarkMode,
  MdBrightness5,
  MdStorage,
  MdSecurity,
  MdDeveloperMode,
  MdPayment,
  MdVisibility,
  MdVisibilityOff,
  MdLabel,
} from "react-icons/md";
import { useI18n } from "../lib/i18n";
import GroupButton from "../components/GroupButton";
import ToggleButton from "../components/ToggleButton";
import TagManager from "../components/TagManager";
import toast from "react-hot-toast";

interface SystemConfig {
  id: string;
  key: string;
  value: string | null;
  category: string;
  type: string;
  description?: string;
  isEncrypted: boolean;
  updatedAt: string;
}

type AdminSettingKey =
  | "admin.includeArchived"
  | "admin.theme"
  | "admin.language"
  | "admin.chapters.viewMode"
  | "admin.chapters.pageSize";

type UserSettingKey =
  | "user.theme"
  | "user.language"
  | "user.density"
  | "user.dateFormat";

async function getSetting(key: string): Promise<string | null> {
  try {
    const res = await api.get(`/admin/settings/${encodeURIComponent(key)}`);
    // backend returns plain object or { value } based on service; normalize
    const val =
      res.data?.value ??
      res.data?.value ??
      (typeof res.data === "string" ? res.data : null);
    return val ?? null;
  } catch {
    return null;
  }
}

async function setSetting(key: string, value: string): Promise<void> {
  await api.patch(`/admin/settings/${encodeURIComponent(key)}`, { value });
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  // Admin settings
  const [includeArchived, setIncludeArchived] = useState<boolean>(false);
  const [adminTheme, setAdminTheme] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [adminLanguage, setAdminLanguage] = useState<"fr" | "en">("fr");
  const [chaptersView, setChaptersView] = useState<
    "card" | "grid" | "calendar"
  >("grid");
  const [chaptersPageSize, setChaptersPageSize] = useState<number>(20);

  // User settings (persisted per user)
  const userKeyPrefix = useMemo(
    () => (user?.id ? `user:${user.id}:` : "user:"),
    [user?.id]
  );
  const [userTheme, setUserTheme] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [userLanguage, setUserLanguage] = useState<"fr" | "en">("fr");
  const [userDensity, setUserDensity] = useState<"comfortable" | "compact">(
    "comfortable"
  );
  const [userDateFormat, setUserDateFormat] = useState<"24h" | "12h">("24h");

  // Superadmin settings
  const [encryptionEnabled, setEncryptionEnabled] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [debugLogging, setDebugLogging] = useState<boolean>(false);

  // Payment configuration
  const [paymentConfigs, setPaymentConfigs] = useState<SystemConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [isInitializing, setIsInitializing] = useState(false);

  const isSuperAdmin = user?.role === "SUPERADMIN";

  useEffect(() => {
    (async () => {
      // Load admin settings
      const inc = await getSetting("admin.includeArchived");
      setIncludeArchived(inc === "true");

      const th = await getSetting("admin.theme");
      if (th === "light" || th === "dark" || th === "system") setAdminTheme(th);

      const lang = await getSetting("admin.language");
      if (lang === "fr" || lang === "en") setAdminLanguage(lang);

      const view = await getSetting("admin.chapters.viewMode");
      if (view === "card" || view === "grid" || view === "calendar")
        setChaptersView(view);

      const pageSize = await getSetting("admin.chapters.pageSize");
      if (pageSize && !isNaN(Number(pageSize)))
        setChaptersPageSize(Number(pageSize));

      // Load user settings
      const uTheme = await getSetting(`${userKeyPrefix}theme`);
      if (uTheme === "light" || uTheme === "dark" || uTheme === "system")
        setUserTheme(uTheme);
      const uLang = await getSetting(`${userKeyPrefix}language`);
      if (uLang === "fr" || uLang === "en") setUserLanguage(uLang);
      const uDen = await getSetting(`${userKeyPrefix}density`);
      if (uDen === "comfortable" || uDen === "compact") setUserDensity(uDen);
      const uDate = await getSetting(`${userKeyPrefix}dateFormat`);
      if (uDate === "24h" || uDate === "12h") setUserDateFormat(uDate);

      // Load superadmin settings (only if superadmin)
      if (user?.role === "SUPERADMIN") {
        const encryption = await getSetting("superadmin.encryptionEnabled");
        setEncryptionEnabled(encryption !== "false");

        const maintenance = await getSetting("superadmin.maintenanceMode");
        setMaintenanceMode(maintenance === "true");

        const debug = await getSetting("superadmin.debugLogging");
        setDebugLogging(debug === "true");
      }

      setLoading(false);
    })();
  }, [userKeyPrefix, user?.role]);

  // Load payment configurations
  useEffect(() => {
    loadPaymentConfigs();
  }, []);

  const loadPaymentConfigs = async () => {
    try {
      const response = await api.get("/admin/config?category=PAYMENT");
      const configs = response.data as SystemConfig[];
      setPaymentConfigs(configs);

      // Initialize configValues state
      const values: Record<string, string> = {};
      configs.forEach((c) => {
        values[c.key] = c.value || "";
      });
      setConfigValues(values);
    } catch (error) {
      console.error("Failed to load payment configs:", error);
    }
  };

  const handleInitializeConfigs = async () => {
    try {
      setIsInitializing(true);
      await api.post("/admin/config/initialize");
      await loadPaymentConfigs();
      toast.success("Configurations initialisées avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'initialisation");
      console.error(error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSaveConfig = async (key: string) => {
    try {
      const value = configValues[key];
      await api.put("/admin/config", { key, value });
      toast.success("Configuration mise à jour");
      setEditingConfig(null);
      await loadPaymentConfigs();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveAdminSetting = async (key: AdminSettingKey, val: string) => {
    await setSetting(key, val);
  };
  const saveUserSetting = async (key: UserSettingKey, val: string) => {
    await setSetting(`${userKeyPrefix}${key.split(".")[1] ?? key}`, val);
  };

  const saveSuperadminSetting = async (key: string, val: string) => {
    await setSetting(`superadmin.${key}`, val);
  };

  // Apply theme immediately for better UX
  useEffect(() => {
    const root = document.documentElement;
    const mode =
      userTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : userTheme;
    root.classList.toggle("dark", mode === "dark");
  }, [userTheme]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">{t("settings.loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Admin settings */}
      <section className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
            <MdSettings className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">{t("settings.admin.title")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("settings.admin.include_archived.label")}
            </label>
            <div className="mt-2">
              <ToggleButton
                checked={includeArchived}
                onChange={async (v) => {
                  setIncludeArchived(v);
                  await saveAdminSetting("admin.includeArchived", String(v));
                }}
                ariaLabel={t("settings.admin.include_archived.label")}
                description={t("settings.admin.include_archived.help")}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("settings.admin.theme")}
            </label>
            <div className="mt-2">
              <GroupButton
                ariaLabel={t("settings.admin.theme")}
                value={adminTheme}
                onChange={async (val) => {
                  const m = val as "light" | "dark" | "system";
                  setAdminTheme(m);
                  await saveAdminSetting("admin.theme", m);
                }}
                options={[
                  {
                    value: "light",
                    label: t("settings.options.light"),
                    icon: <MdBrightness5 className="text-base" />,
                  },
                  {
                    value: "dark",
                    label: t("settings.options.dark"),
                    icon: <MdDarkMode className="text-base" />,
                  },
                  {
                    value: "system",
                    label: t("settings.options.system"),
                    icon: <MdPalette className="text-base" />,
                  },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("settings.admin.language")}
            </label>
            <div className="mt-2">
              <GroupButton
                ariaLabel={t("settings.admin.language")}
                value={adminLanguage}
                onChange={async (val) => {
                  const v = val as "fr" | "en";
                  setAdminLanguage(v);
                  await saveAdminSetting("admin.language", v);
                }}
                options={[
                  { value: "fr", label: t("settings.options.french") },
                  { value: "en", label: t("settings.options.english") },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("settings.admin.chapter_view")}
            </label>
            <div className="mt-2">
              <GroupButton
                ariaLabel={t("settings.admin.chapter_view")}
                value={chaptersView}
                onChange={async (val) => {
                  const v = val as "card" | "grid" | "calendar";
                  setChaptersView(v);
                  await saveAdminSetting("admin.chapters.viewMode", v);
                }}
                options={[
                  { value: "card", label: t("settings.views.card") },
                  { value: "grid", label: t("settings.views.list") },
                  { value: "calendar", label: t("settings.views.calendar") },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("settings.admin.page_size")}
            </label>
            <input
              type="number"
              className="mt-2 px-3 py-2 border rounded-lg"
              min={5}
              max={100}
              value={chaptersPageSize}
              onChange={async (e) => {
                const v = Math.max(5, Math.min(100, Number(e.target.value)));
                setChaptersPageSize(v);
                await saveAdminSetting("admin.chapters.pageSize", String(v));
              }}
            />
          </div>
        </div>
      </section>

      {/* Payment Configuration */}
      <section className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white">
              <MdPayment className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Configuration des paiements</h2>
              <p className="text-sm text-gray-600">
                Clés API et paramètres Stripe
              </p>
            </div>
          </div>
          {paymentConfigs.length === 0 && (
            <button
              onClick={handleInitializeConfigs}
              disabled={isInitializing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {isInitializing ? "Initialisation..." : "Initialiser"}
            </button>
          )}
        </div>

        {paymentConfigs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune configuration trouvée.</p>
            <p className="text-sm mt-2">
              Cliquez sur "Initialiser" pour créer les configurations par
              défaut.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentConfigs.map((config) => (
              <div
                key={config.key}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {config.key}
                      </span>
                      {config.type === "SECRET" && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                          SECRET
                        </span>
                      )}
                    </div>
                    {config.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {config.description}
                      </p>
                    )}
                  </div>

                  {editingConfig === config.key ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveConfig(config.key)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => {
                          setEditingConfig(null);
                          setConfigValues((prev) => ({
                            ...prev,
                            [config.key]: config.value || "",
                          }));
                        }}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingConfig(config.key)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                      Modifier
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  {editingConfig === config.key ? (
                    <div className="flex gap-2">
                      <input
                        type={
                          config.type === "SECRET" && !showSecrets[config.key]
                            ? "password"
                            : "text"
                        }
                        value={configValues[config.key] || ""}
                        onChange={(e) =>
                          setConfigValues((prev) => ({
                            ...prev,
                            [config.key]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                        placeholder={
                          config.type === "SECRET"
                            ? "sk_test_..."
                            : "Entrez la valeur"
                        }
                      />
                      {config.type === "SECRET" && (
                        <button
                          onClick={() => toggleSecretVisibility(config.key)}
                          className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                          {showSecrets[config.key] ? (
                            <MdVisibilityOff className="w-5 h-5" />
                          ) : (
                            <MdVisibility className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-white rounded border border-gray-200 font-mono text-sm">
                      {config.value && config.value !== "••••••••" ? (
                        config.value
                      ) : (
                        <span className="text-gray-400 italic">
                          Non configuré
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <MdSecurity className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <p className="font-semibold mb-1">Sécurité</p>
              <p>
                Les clés secrètes (SECRET) sont chiffrées en base de données.
                Ne partagez jamais vos clés Stripe avec qui que ce soit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Asset Tags Management */}
      <section className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white">
            <MdLabel className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Tags d'Assets</h2>
            <p className="text-sm text-gray-600">
              Organisez vos images et coloriages avec des tags colorés
            </p>
          </div>
        </div>
        <TagManager />
      </section>

      {/* User settings */}
      <section className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
            <MdStorage className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">{t("settings.user.title")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("settings.user.theme")}
            </label>
            <div className="mt-2">
              <GroupButton
                ariaLabel={t("settings.user.theme")}
                value={userTheme}
                onChange={async (val) => {
                  const m = val as "light" | "dark" | "system";
                  setUserTheme(m);
                  await saveUserSetting("user.theme", m);
                }}
                options={[
                  {
                    value: "light",
                    label: t("settings.options.light"),
                    icon: <MdBrightness5 className="text-base" />,
                  },
                  {
                    value: "dark",
                    label: t("settings.options.dark"),
                    icon: <MdDarkMode className="text-base" />,
                  },
                  {
                    value: "system",
                    label: t("settings.options.system"),
                    icon: <MdPalette className="text-base" />,
                  },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("settings.user.language")}
            </label>
            <div className="mt-2">
              <GroupButton
                ariaLabel={t("settings.user.language")}
                value={userLanguage}
                onChange={async (val) => {
                  const v = val as "fr" | "en";
                  setUserLanguage(v);
                  await saveUserSetting("user.language", v);
                }}
                options={[
                  { value: "fr", label: t("settings.options.french") },
                  { value: "en", label: t("settings.options.english") },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("settings.user.density")}
            </label>
            <div className="mt-2">
              <GroupButton
                ariaLabel={t("settings.user.density")}
                value={userDensity}
                onChange={async (val) => {
                  const v = val as "comfortable" | "compact";
                  setUserDensity(v);
                  await saveUserSetting("user.density", v);
                }}
                options={[
                  {
                    value: "comfortable",
                    label: t("settings.options.comfortable"),
                  },
                  { value: "compact", label: t("settings.options.compact") },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("settings.user.date_format")}
            </label>
            <div className="mt-2">
              <GroupButton
                ariaLabel={t("settings.user.date_format")}
                value={userDateFormat}
                onChange={async (val) => {
                  const v = val as "24h" | "12h";
                  setUserDateFormat(v);
                  await saveUserSetting("user.dateFormat", v);
                }}
                options={[
                  { value: "24h", label: t("settings.options.twenty_four") },
                  { value: "12h", label: t("settings.options.twelve") },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Superadmin settings - Only visible for SUPERADMIN role */}
      {isSuperAdmin && (
        <section className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center text-white">
              <MdSecurity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900">
                {t("settings.superadmin.title")}
              </h2>
              <p className="text-xs text-red-600 font-semibold">
                {t("settings.superadmin.critical")}
              </p>
            </div>
          </div>
          <div className="mt-4 bg-white/70 backdrop-blur rounded-xl p-4 border border-red-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MdDeveloperMode className="text-red-600" />
                  {t("settings.superadmin.encryption.label")}
                </label>
                <div className="mt-2">
                  <ToggleButton
                    checked={encryptionEnabled}
                    onChange={async (v) => {
                      setEncryptionEnabled(v);
                      await saveSuperadminSetting(
                        "encryptionEnabled",
                        String(v)
                      );
                    }}
                    ariaLabel={t("settings.superadmin.encryption.label")}
                    variant="red"
                    uncheckedColor="red"
                    label={
                      encryptionEnabled
                        ? t("settings.superadmin.encryption.enabled")
                        : t("settings.superadmin.encryption.disabled")
                    }
                    description={t("settings.superadmin.encryption.help")}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MdSettings className="text-orange-600" />
                  {t("settings.superadmin.maintenance.label")}
                </label>
                <div className="mt-2">
                  <ToggleButton
                    checked={maintenanceMode}
                    onChange={async (v) => {
                      setMaintenanceMode(v);
                      await saveSuperadminSetting("maintenanceMode", String(v));
                    }}
                    ariaLabel={t("settings.superadmin.maintenance.label")}
                    variant="orange"
                    label={
                      maintenanceMode
                        ? t("settings.superadmin.maintenance.enabled")
                        : t("settings.superadmin.maintenance.disabled")
                    }
                    description={t("settings.superadmin.maintenance.help")}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MdDeveloperMode className="text-purple-600" />
                  {t("settings.superadmin.logs.label")}
                </label>
                <div className="mt-2">
                  <ToggleButton
                    checked={debugLogging}
                    onChange={async (v) => {
                      setDebugLogging(v);
                      await saveSuperadminSetting("debugLogging", String(v));
                    }}
                    ariaLabel={t("settings.superadmin.logs.label")}
                    variant="purple"
                    label={
                      debugLogging
                        ? t("settings.superadmin.logs.enabled")
                        : t("settings.superadmin.logs.disabled")
                    }
                    description={t("settings.superadmin.logs.help")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  {t("settings.superadmin.system_info")}
                </label>
                <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg font-mono">
                  <div>Node: {process.env.NODE_ENV || "production"}</div>
                  <div>Build: {import.meta.env.MODE}</div>
                  <div>User ID: {user?.id?.substring(0, 8)}...</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <MdSecurity className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-800">
                  <p className="font-semibold mb-1">
                    {t("settings.superadmin.warning.title")}
                  </p>
                  <p>{t("settings.superadmin.warning.body")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
