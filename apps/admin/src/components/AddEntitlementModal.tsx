import { useState, useEffect } from "react";
import { MdClose, MdLock } from "react-icons/md";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";
import toast from "react-hot-toast";

interface AddEntitlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

interface Chapter {
  id: string;
  title: string;
  status: string;
  protagonistName: string;
}

export default function AddEntitlementModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: AddEntitlementModalProps) {
  const { t } = useI18n();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chapterIds: [] as string[],
    volumeFrom: 1,
    volumeTo: 1,
    scopes: ["BASE"] as string[],
    source: "SUBSCRIPTION" as "PURCHASE" | "PREORDER" | "PACK" | "SUBSCRIPTION",
  });

  const toggleScope = (scope: string) => {
    setFormData((prev) => {
      const has = prev.scopes.includes(scope);
      const next = has ? prev.scopes.filter((s) => s !== scope) : [...prev.scopes, scope];
      // Always keep at least one scope
      return { ...prev, scopes: next.length > 0 ? next : [scope] };
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadChapters();
    }
  }, [isOpen]);

  const loadChapters = async () => {
    try {
      const response = await api.get("/admin/chapters");
      setChapters(response.data);
    } catch (error) {
      toast.error(
        t(
          "add_entitlement_modal.toast.load_error",
          "Erreur lors du chargement des chapitres"
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/admin/users/${userId}/entitlements`, formData);
      toast.success(
        t(
          "add_entitlement_modal.toast.success",
          "Droit d'accès ajouté avec succès"
        )
      );
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        chapterIds: [],
        volumeFrom: 1,
        volumeTo: 1,
        scopes: ["BASE"],
        source: "SUBSCRIPTION",
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message ||
          t(
            "add_entitlement_modal.toast.error",
            "Erreur lors de l'ajout du droit d'accès"
          )
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MdLock
                className="text-white"
                size={20}
              />
            </div>
            <h2 className="text-xl font-bold text-white">
              {t("add_entitlement_modal.title", "Accès au chapitre")}
            </h2>
          </div>
          <button
            onClick={onClose}
            title={t("common.close", "Fermer")}
            aria-label={t(
              "add_entitlement_modal.close_aria",
              "Fermer le modal"
            )}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors">
            <MdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5">
          {/* Chapter Selection */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("add_entitlement_modal.chapter", "Chapitres")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 bg-white/50">
              {chapters.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {t("add_entitlement_modal.no_chapters", "Aucun chapitre disponible")}
                </p>
              ) : (
                chapters.map((chapter) => (
                  <label
                    key={chapter.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.chapterIds.includes(chapter.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            chapterIds: [...formData.chapterIds, chapter.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            chapterIds: formData.chapterIds.filter(
                              (id) => id !== chapter.id
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 flex-1">
                      {chapter.protagonistName} : {chapter.title}
                    </span>
                  </label>
                ))
              )}
            </div>
            {formData.chapterIds.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {formData.chapterIds.length} {t("add_entitlement_modal.selected", "chapitre(s) sélectionné(s)")}
              </p>
            )}
          </div>

          {/* Volume Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label
                htmlFor="volume-from"
                className="block text-sm font-semibold text-gray-700 mb-2">
                {t("add_entitlement_modal.from", "De")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="volume-from"
                type="number"
                min="1"
                placeholder="Vol. min"
                value={formData.volumeFrom}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    volumeFrom: parseInt(e.target.value),
                  })
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/50"
              />
            </div>

            <div className="group">
              <label
                htmlFor="volume-to"
                className="block text-sm font-semibold text-gray-700 mb-2">
                {t("add_entitlement_modal.to", "À")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="volume-to"
                type="number"
                min={formData.volumeFrom}
                placeholder="Vol. max"
                value={formData.volumeTo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    volumeTo: parseInt(e.target.value),
                  })
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/50"
              />
            </div>
          </div>

          {/* Scopes */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("add_entitlement_modal.scope", "Perspectives")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["BASE", "POV", "COLORING", "LETTER", "NEWSLETTER"] as const).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => toggleScope(scope)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left flex items-center gap-2 ${
                    formData.scopes.includes(scope)
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-white/50 border-2 border-gray-200 text-gray-700 hover:border-indigo-300"
                  }`}>
                  <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs ${
                    formData.scopes.includes(scope) ? "bg-white/30 border-white/50" : "border-gray-400"
                  }`}>
                    {formData.scopes.includes(scope) && "✓"}
                  </span>
                  {scope}
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("add_entitlement_modal.source", "Source")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, source: "PURCHASE" })}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  formData.source === "PURCHASE"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/50 border-2 border-gray-200 text-gray-700 hover:border-indigo-300"
                }`}>
                🛒 {t("add_entitlement_modal.source_purchase", "Achat")}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, source: "PREORDER" })}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  formData.source === "PREORDER"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/50 border-2 border-gray-200 text-gray-700 hover:border-indigo-300"
                }`}>
                📅 {t("add_entitlement_modal.source_preorder", "Précommande")}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, source: "PACK" })}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  formData.source === "PACK"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/50 border-2 border-gray-200 text-gray-700 hover:border-indigo-300"
                }`}>
                📦 {t("add_entitlement_modal.source_pack", "Pack")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, source: "SUBSCRIPTION" })
                }
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  formData.source === "SUBSCRIPTION"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/50 border-2 border-gray-200 text-gray-700 hover:border-indigo-300"
                }`}>
                ♾️{" "}
                {t("add_entitlement_modal.source_subscription", "Abonnement")}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold">
              {t("common.cancel", "Annuler")}
            </button>
            <button
              type="submit"
              disabled={loading || formData.chapterIds.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              {loading
                ? t("add_entitlement_modal.button_adding", "Ajout...")
                : t("add_entitlement_modal.button_add", "Ajouter l'accès")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
