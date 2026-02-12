import { useState } from "react";
import { MdFilterList, MdClear, MdBookmark, MdClose } from "react-icons/md";

export interface UserFilterCriteria {
  role?: "ALL" | "ADMIN" | "USER";
  status?: "ALL" | "ACTIVE" | "SUSPENDED";
  registeredAfter?: string;
  registeredBefore?: string;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  minOrderCount?: number;
  maxOrderCount?: number;
  searchQuery?: string;
}

interface UserFiltersProps {
  filters: UserFilterCriteria;
  onChange: (filters: UserFilterCriteria) => void;
  onClear: () => void;
}

const DEFAULT_FILTERS: UserFilterCriteria = {
  role: "ALL",
  status: "ALL",
  registeredAfter: "",
  registeredBefore: "",
  minTotalSpent: undefined,
  maxTotalSpent: undefined,
  minOrderCount: undefined,
  maxOrderCount: undefined,
  searchQuery: "",
};

export default function UserFilters({
  filters,
  onChange,
  onClear,
}: UserFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState<
    { name: string; filters: UserFilterCriteria }[]
  >(() => {
    const saved = localStorage.getItem("userFilterPresets");
    return saved ? JSON.parse(saved) : [];
  });

  const handleChange = (key: keyof UserFilterCriteria, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onChange(DEFAULT_FILTERS);
    onClear();
  };

  const saveCurrentFilters = () => {
    const name = prompt("Nom du filtre favori:");
    if (!name) return;

    const newSaved = [...savedFilters, { name, filters }];
    setSavedFilters(newSaved);
    localStorage.setItem("userFilterPresets", JSON.stringify(newSaved));
  };

  const loadSavedFilter = (saved: { name: string; filters: UserFilterCriteria }) => {
    onChange(saved.filters);
  };

  const deleteSavedFilter = (index: number) => {
    const newSaved = savedFilters.filter((_, i) => i !== index);
    setSavedFilters(newSaved);
    localStorage.setItem("userFilterPresets", JSON.stringify(newSaved));
  };

  const hasActiveFilters = () => {
    return (
      filters.role !== "ALL" ||
      filters.status !== "ALL" ||
      filters.registeredAfter ||
      filters.registeredBefore ||
      filters.minTotalSpent !== undefined ||
      filters.maxTotalSpent !== undefined ||
      filters.minOrderCount !== undefined ||
      filters.maxOrderCount !== undefined ||
      (filters.searchQuery && filters.searchQuery.length > 0)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MdFilterList className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Filtres avancés
            </h2>
            {hasActiveFilters() && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                Actifs
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                <MdClear className="w-4 h-4" />
                Effacer
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
              {isExpanded ? "Réduire" : "Développer"}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche (nom, email)
            </label>
            <input
              type="text"
              value={filters.searchQuery || ""}
              onChange={(e) => handleChange("searchQuery", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Rechercher un utilisateur..."
            />
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <select
                value={filters.role || "ALL"}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="ALL">Tous les rôles</option>
                <option value="USER">Utilisateurs</option>
                <option value="ADMIN">Administrateurs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status || "ALL"}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="SUSPENDED">Suspendus</option>
              </select>
            </div>
          </div>

          {/* Registration Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inscrit après le
              </label>
              <input
                type="date"
                value={filters.registeredAfter || ""}
                onChange={(e) => handleChange("registeredAfter", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inscrit avant le
              </label>
              <input
                type="date"
                value={filters.registeredBefore || ""}
                onChange={(e) => handleChange("registeredBefore", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Total Spent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant dépensé min (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  filters.minTotalSpent !== undefined
                    ? (filters.minTotalSpent / 100).toFixed(2)
                    : ""
                }
                onChange={(e) =>
                  handleChange(
                    "minTotalSpent",
                    e.target.value
                      ? Math.round(parseFloat(e.target.value) * 100)
                      : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant dépensé max (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  filters.maxTotalSpent !== undefined
                    ? (filters.maxTotalSpent / 100).toFixed(2)
                    : ""
                }
                onChange={(e) =>
                  handleChange(
                    "maxTotalSpent",
                    e.target.value
                      ? Math.round(parseFloat(e.target.value) * 100)
                      : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Illimité"
              />
            </div>
          </div>

          {/* Order Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de commandes min
              </label>
              <input
                type="number"
                min="0"
                value={filters.minOrderCount || ""}
                onChange={(e) =>
                  handleChange(
                    "minOrderCount",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de commandes max
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxOrderCount || ""}
                onChange={(e) =>
                  handleChange(
                    "maxOrderCount",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Illimité"
              />
            </div>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Filtres favoris
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map((saved, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                    <button
                      onClick={() => loadSavedFilter(saved)}
                      className="text-sm text-gray-700 hover:text-gray-900">
                      {saved.name}
                    </button>
                    <button
                      onClick={() => deleteSavedFilter(index)}
                      className="ml-1 text-gray-500 hover:text-red-600">
                      <MdClose className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={saveCurrentFilters}
              disabled={!hasActiveFilters()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <MdBookmark className="w-4 h-4" />
              Sauvegarder ces filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
