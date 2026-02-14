import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdVisibilityOff,
  MdSearch,
  MdLocalOffer,
  MdShoppingCart,
} from "react-icons/md";
import { api } from "../lib/api";
import { useI18n, useTranslation } from '../lib/i18n';

interface BundleItem {
  id: string;
  type: "CHAPTER" | "VOLUME";
  chapterId?: string;
  volumeFrom?: number;
  volumeTo?: number;
  displayOrder: number;
  chapter?: {
    id: string;
    title: string;
    protagonistName: string;
  };
}

interface Bundle {
  id: string;
  name: string;
  description?: string;
  slug: string;
  amountCents: number;
  originalAmountCents: number;
  currency: string;
  isActive: boolean;
  displayOrder?: number;
  imageUrl?: string;
  validFrom?: string;
  validUntil?: string;
  maxPurchases?: number;
  purchaseCount: number;
  items: BundleItem[];
  createdAt: string;
  updatedAt: string;
}

export default function Bundles() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    bundleId: string | null;
    bundleName: string;
  }>({ open: false, bundleId: null, bundleName: "" });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadBundles();
  }, [page, searchQuery, filterActive]);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (filterActive !== "all") {
        params.append("isActive", (filterActive === "active").toString());
      }

      const response = await api.get(`/admin/bundles?${params.toString()}`);

      console.log("Bundles API Response:", response);

      if (response.success && response.data) {
        console.log("Setting bundles:", response.data.bundles);
        setBundles(response.data.bundles);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (error: any) {
      console.error("Error loading bundles:", error);
      alert("Erreur lors du chargement des bundles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.bundleId) return;

    try {
      const response = await api.delete(`/admin/bundles/${deleteModal.bundleId}`);

      if (response.data.success) {
        alert("Bundle supprimé avec succès");
        setDeleteModal({ open: false, bundleId: null, bundleName: "" });
        loadBundles();
      }
    } catch (error: any) {
      console.error("Error deleting bundle:", error);
      alert("Erreur lors de la suppression du bundle");
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(cents / 100);
  };

  const calculateDiscount = (bundle: Bundle) => {
    if (bundle.originalAmountCents === 0) return 0;
    return Math.round(
      ((bundle.originalAmountCents - bundle.amountCents) / bundle.originalAmountCents) * 100
    );
  };

  const getStatusBadge = (bundle: Bundle) => {
    if (!bundle.isActive) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          <MdVisibilityOff className="w-3 h-3" />
          <span>Inactif</span>
        </span>
      );
    }

    // Check validity dates
    const now = new Date();
    const validFrom = bundle.validFrom ? new Date(bundle.validFrom) : null;
    const validUntil = bundle.validUntil ? new Date(bundle.validUntil) : null;

    if (validFrom && validFrom > now) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          <MdVisibility className="w-3 h-3" />
          <span>À venir</span>
        </span>
      );
    }

    if (validUntil && validUntil < now) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <MdVisibilityOff className="w-3 h-3" />
          <span>Expiré</span>
        </span>
      );
    }

    // Check max purchases
    if (bundle.maxPurchases && bundle.purchaseCount >= bundle.maxPurchases) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
          <MdVisibilityOff className="w-3 h-3" />
          <span>Épuisé</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
        <MdVisibility className="w-3 h-3" />
        <span>Actif</span>
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bundles</h1>
          <p className="text-gray-600 mt-1">
            Gérez les packs de chapitres et volumes
          </p>
        </div>
        <button
          onClick={() => navigate("/bundles/new")}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MdAdd className="w-5 h-5" />
          <span>Créer un bundle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher par nom, description ou slug..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value as any);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs uniquement</option>
            <option value="inactive">Inactifs uniquement</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="text-sm text-gray-600">
          <strong>{total}</strong> bundle{total > 1 ? "s" : ""} au total
        </div>
      </div>

      {/* Bundles List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-500">Chargement...</div>
        </div>
      ) : (console.log("Rendering bundles, count:", bundles.length), bundles.length === 0) ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MdLocalOffer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun bundle trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre premier bundle pour vendre des packs de chapitres et volumes.
          </p>
          <button
            onClick={() => navigate("/bundles/new")}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <MdAdd className="w-5 h-5" />
            <span>Créer un bundle</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bundles.map((bundle) => {
            const discount = calculateDiscount(bundle);

            return (
              <div
                key={bundle.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  {/* Left side: Bundle info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-4">
                      {/* Image */}
                      {bundle.imageUrl ? (
                        <img
                          src={bundle.imageUrl}
                          alt={bundle.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <MdLocalOffer className="w-12 h-12 text-white" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {bundle.name}
                          </h3>
                          {getStatusBadge(bundle)}
                          {discount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {bundle.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {bundle.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="font-mono">{bundle.slug}</span>
                          <span>•</span>
                          <span>{bundle.items.length} élément{bundle.items.length > 1 ? "s" : ""}</span>
                          <span>•</span>
                          <span className="inline-flex items-center space-x-1">
                            <MdShoppingCart className="w-4 h-4" />
                            <span>{bundle.purchaseCount} vente{bundle.purchaseCount > 1 ? "s" : ""}</span>
                          </span>
                        </div>

                        {/* Items preview */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {bundle.items.slice(0, 3).map((item) => (
                            <span
                              key={item.id}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {item.type === "CHAPTER" && `📖 ${item.chapter?.title || "Chapitre"}`}
                              {item.type === "VOLUME" && `📚 ${item.chapter?.title || "Chapitre"} - Vol. ${item.volumeFrom}${item.volumeTo && item.volumeTo !== item.volumeFrom ? `-${item.volumeTo}` : ""}`}
                            </span>
                          ))}
                          {bundle.items.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{bundle.items.length - 3} autre{bundle.items.length - 3 > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Price and actions */}
                  <div className="flex flex-col items-end space-y-3 ml-6">
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(bundle.amountCents, bundle.currency)}
                      </div>
                      {bundle.originalAmountCents !== bundle.amountCents && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(bundle.originalAmountCents, bundle.currency)}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/bundles/${bundle.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier">
                        <MdEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            bundleId: bundle.id,
                            bundleName: bundle.name,
                          })
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer">
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
            Précédent
          </button>
          <span className="text-gray-600">
            Page {page} sur {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
            Suivant
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le bundle "{deleteModal.bundleName}" ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setDeleteModal({ open: false, bundleId: null, bundleName: "" })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
