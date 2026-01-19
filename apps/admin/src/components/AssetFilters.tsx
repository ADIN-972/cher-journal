import { useState, useEffect } from "react";
import {
  MdSearch,
  MdFilterList,
  MdClose,
  MdImage,
  MdColorLens,
  MdLabel,
  MdContentCopy,
} from "react-icons/md";
import { api } from "../lib/api";

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface AssetFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  kind?: "IMAGE" | "COLORING_PAGE";
  search?: string;
  tagIds?: string[];
  showDuplicates?: boolean;
}

export default function AssetFilters({
  onFilterChange,
  initialFilters,
}: AssetFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {});
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const loadTags = async () => {
    setLoadingTags(true);
    try {
      const response = await api.get("/admin/asset-tags");
      setTags(response.data);
    } catch (error: any) {
      console.error("Error loading tags:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value || undefined });
  };

  const handleKindChange = (kind?: "IMAGE" | "COLORING_PAGE") => {
    setFilters({ ...filters, kind });
  };

  const handleTagToggle = (tagId: string) => {
    const currentTags = filters.tagIds || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];

    setFilters({
      ...filters,
      tagIds: newTags.length > 0 ? newTags : undefined,
    });
  };

  const handleDuplicatesToggle = () => {
    setFilters({
      ...filters,
      showDuplicates: !filters.showDuplicates,
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters =
    filters.kind ||
    filters.search ||
    (filters.tagIds && filters.tagIds.length > 0) ||
    filters.showDuplicates;

  const activeFiltersCount =
    (filters.kind ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.tagIds?.length || 0) +
    (filters.showDuplicates ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher par nom..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Kind Filter */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              handleKindChange(filters.kind === "IMAGE" ? undefined : "IMAGE")
            }
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
              filters.kind === "IMAGE"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
            }`}>
            <MdImage className="w-5 h-5" />
            <span>Images</span>
          </button>

          <button
            onClick={() =>
              handleKindChange(
                filters.kind === "COLORING_PAGE" ? undefined : "COLORING_PAGE"
              )
            }
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
              filters.kind === "COLORING_PAGE"
                ? "bg-purple-50 border-purple-500 text-purple-700"
                : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
            }`}>
            <MdColorLens className="w-5 h-5" />
            <span>Coloriages</span>
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
            showAdvanced || hasActiveFilters
              ? "bg-blue-50 border-blue-500 text-blue-700"
              : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
          }`}>
          <MdFilterList className="w-5 h-5" />
          <span>Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
            <MdClose className="w-5 h-5" />
            <span>Effacer</span>
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-6">
          {/* Tags Filter */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MdLabel className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Filtrer par tags</h4>
            </div>

            {loadingTags ? (
              <div className="text-sm text-gray-500">Chargement des tags...</div>
            ) : tags.length === 0 ? (
              <div className="text-sm text-gray-500">
                Aucun tag disponible. Créez des tags pour organiser vos assets.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = filters.tagIds?.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-gray-900 shadow-md scale-105"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? tag.color || "#3B82F6"
                          : "#FFFFFF",
                        color: isSelected ? "#FFFFFF" : "#374151",
                      }}>
                      <span className="text-sm font-medium">{tag.name}</span>
                      {isSelected && <MdClose className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Duplicates Filter */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MdContentCopy className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Doublons</h4>
            </div>

            <label className="inline-flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showDuplicates || false}
                onChange={handleDuplicatesToggle}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Afficher uniquement les doublons (fichiers identiques)
              </span>
            </label>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <strong>{activeFiltersCount}</strong> filtre
                  {activeFiltersCount > 1 ? "s" : ""} actif
                  {activeFiltersCount > 1 ? "s" : ""}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Tout effacer
                </button>
              </div>

              {/* Details */}
              <div className="mt-3 space-y-2">
                {filters.kind && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">
                      {filters.kind === "IMAGE" ? "Images" : "Coloriages"}
                    </span>
                  </div>
                )}
                {filters.search && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Recherche:</span>
                    <span className="font-medium text-gray-900">
                      "{filters.search}"
                    </span>
                  </div>
                )}
                {filters.tagIds && filters.tagIds.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Tags:</span>
                    <span className="font-medium text-gray-900">
                      {filters.tagIds.length} sélectionné
                      {filters.tagIds.length > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {filters.showDuplicates && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Doublons:</span>
                    <span className="font-medium text-gray-900">Activé</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
