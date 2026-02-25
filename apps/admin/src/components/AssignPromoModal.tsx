import { useState } from "react";
import { MdClose, MdLocalOffer, MdCheckCircle } from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";

interface AssignPromoModalProps {
  userId: string;
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignPromoModal({
  userId,
  userEmail,
  onClose,
  onSuccess,
}: AssignPromoModalProps) {
  const [loading, setLoading] = useState(false);
  const userName = userEmail.split("@")[0];
  const [formData, setFormData] = useState({
    name: `Promotion attribuée à ${userName}`,
    scope: "VOLUME" as "VOLUME" | "CHAPTER" | "POV_CHAPTER" | "POV_VOLUME" | "EPILOGUE" | "COLORING" | "BUNDLE" | "SUBSCRIPTION",
    type: "PERCENT" as "PERCENT" | "FIXED" | "FREE",
    value: 0,
    startsAt: new Date().toISOString().split("T")[0],
    endsAt: new Date(Date.now() + 30 * 24 * 3600000).toISOString().split("T")[0],
    maxUses: 1,
    perUserLimit: 1,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate dates
      const start = new Date(formData.startsAt);
      const end = new Date(formData.endsAt);

      if (end <= start) {
        toast.error("La date de fin doit être après la date de début");
        setLoading(false);
        return;
      }

      if (!formData.name.trim()) {
        toast.error("Le nom de la promotion est requis");
        setLoading(false);
        return;
      }

      // Create promotion for this specific user
      const promoData = {
        name: formData.name || `Promotion ${formData.scope} - ${userEmail}`,
        scope: formData.scope,
        type: formData.type,
        value: formData.type === "FREE" ? null : formData.value,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
        maxUses: formData.maxUses,
        perUserLimit: formData.perUserLimit,
        isActive: true,
        description: formData.description || `Promotion personnalisée pour ${userEmail}`,
        targetType: "SPECIFIC_USERS",
        targetUserIds: [userId],
      };

      await api.post("/admin/promotions", promoData);

      toast.success("Promotion attribuée avec succès !");
      onSuccess();
    } catch (error: any) {
      console.error("Error assigning promo:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'attribution de la promotion");
    } finally {
      setLoading(false);
    }
  };

  const scopeOptions = [
    { value: "VOLUME", label: "Volume" },
    { value: "CHAPTER", label: "Chapitre" },
    { value: "POV_CHAPTER", label: "POV Chapitre" },
    { value: "POV_VOLUME", label: "POV Volume" },
    { value: "EPILOGUE", label: "Épilogue" },
    { value: "COLORING", label: "Coloriage" },
    { value: "BUNDLE", label: "Bundle" },
    { value: "SUBSCRIPTION", label: "Abonnement" },
  ];

  const typeOptions = [
    { value: "PERCENT", label: "Pourcentage (-X%)" },
    { value: "FIXED", label: "Montant fixe (-X€)" },
    { value: "FREE", label: "Gratuit" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <MdLocalOffer className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Attribuer une Promotion
              </h2>
              <p className="text-sm text-gray-500">Pour {userEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdClose className="text-gray-500" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la Promotion *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Réduction VIP pour client premium"
              maxLength={200}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/200 caractères
            </p>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portée de la Promotion *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {scopeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, scope: option.value as any })}
                  className={`py-2 px-3 rounded-lg border-2 font-medium transition-all ${
                    formData.scope === option.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de Réduction *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: option.value as any })}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    formData.type === option.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Value Input (if not FREE) */}
          {formData.type !== "FREE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valeur de la Réduction *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step={formData.type === "PERCENT" ? "1" : "0.01"}
                  max={formData.type === "PERCENT" ? "100" : undefined}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: parseFloat(e.target.value) })
                  }
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={formData.type === "PERCENT" ? "Ex: 20" : "Ex: 5.00"}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {formData.type === "PERCENT" ? "%" : "€"}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.type === "PERCENT"
                  ? "Réduction en pourcentage (0-100)"
                  : "Montant fixe à déduire en euros"}
              </p>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Début *
              </label>
              <input
                type="date"
                value={formData.startsAt}
                onChange={(e) =>
                  setFormData({ ...formData, startsAt: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Fin *
              </label>
              <input
                type="date"
                value={formData.endsAt}
                onChange={(e) =>
                  setFormData({ ...formData, endsAt: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre d'Utilisations Max
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: parseInt(e.target.value) })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nombre total d'achats avec cette promo
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite par Utilisateur
              </label>
              <input
                type="number"
                min="1"
                value={formData.perUserLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    perUserLimit: parseInt(e.target.value),
                  })
                }
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nombre d'utilisations pour cet utilisateur
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              placeholder="Ajouter une note interne sur cette promotion..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MdCheckCircle className="text-orange-600" size={20} />
              Résumé de la Promotion
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium">Portée:</span> {formData.scope}
              </p>
              <p>
                <span className="font-medium">Réduction:</span>{" "}
                {formData.type === "FREE"
                  ? "Gratuit (100%)"
                  : formData.type === "PERCENT"
                  ? `-${formData.value}%`
                  : `-${formData.value.toFixed(2)}€`}
              </p>
              <p>
                <span className="font-medium">Période:</span>{" "}
                {new Date(formData.startsAt).toLocaleDateString("fr")} -{" "}
                {new Date(formData.endsAt).toLocaleDateString("fr")}
              </p>
              <p>
                <span className="font-medium">Utilisations:</span>{" "}
                {formData.perUserLimit} fois pour cet utilisateur (max {formData.maxUses} global)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Attribution...
                </>
              ) : (
                <>
                  <MdLocalOffer size={20} />
                  Attribuer la Promotion
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
