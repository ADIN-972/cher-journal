import React, { useEffect, useMemo, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import ActionButton from "../components/ActionButton";
import { useApi } from "../hooks/useApi";
import SmartTableGrid from "../components/SmartTableGrid";

interface ChapterOverride {
  id: string;
  chapterId: string;
  schemaId: string;
  chapter: {
    id: string;
    title: string;
  };
  priceFreeToRead: number | null;
  pricePaywall: number | null;
  priceEpilogue: number | null;
  reason?: string;
  isActive: boolean;
}

interface ChapterOverride {
  id: string;
  chapterId: string;
  schemaId: string;
  chapter: {
    id: string;
    title: string;
  };
  priceFreeToRead: number | null;
  pricePaywall: number | null;
  priceEpilogue: number | null;
  reason?: string;
  isActive: boolean;
}

interface PriceSchema {
  id: string;
  name: string;
}

export default function ChapterPricesPage() {
  const api = useApi();
  const [overrides, setOverrides] = useState<ChapterOverride[]>([]);
  const [schemas, setSchemas] = useState<PriceSchema[]>([]);
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    chapterId: "",
    schemaId: "",
    priceFreeToRead: null as number | null,
    pricePaywall: null as number | null,
    priceEpilogue: null as number | null,
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overridesRes, schemasRes, chaptersRes] = await Promise.all([
        api.get("/admin/chapter-overrides"),
        api.get("/admin/price-schemas"),
        api.get("/admin/chapters"),
      ]);
      // Handle both formats: array directly or { data: [...] }
      const overridesData = Array.isArray(overridesRes)
        ? overridesRes
        : overridesRes.data || [];
      const schemasData = Array.isArray(schemasRes)
        ? schemasRes
        : schemasRes.data || [];
      const chaptersData = Array.isArray(chaptersRes)
        ? chaptersRes
        : chaptersRes.data?.data || chaptersRes.data || [];
      setOverrides(overridesData);
      setSchemas(schemasData);
      setChapters(chaptersData.map((c: any) => ({ id: c.id, title: c.title })));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const chapterId = editingId || formData.chapterId;
      const payload = { ...formData };
      delete payload.chapterId;
      if (editingId) {
        await api.patch(`/admin/chapters/${chapterId}/price-override`, payload);
      } else {
        await api.post(`/admin/chapters/${chapterId}/price-override`, payload);
      }

      setShowForm(false);
      setEditingId(null);
      await fetchData();
    } catch (error) {
      console.error("Failed to save override:", error);
    }
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this override?")) {
      return;
    }

    try {
      await api.delete(`/admin/chapters/${chapterId}/price-override`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete override:", error);
    }
  };

  const formatPrice = (cents: number | null) => {
    if (cents === null) return "-";
    return (cents / 100).toFixed(2) + "€";
  };

  const schemaMap = useMemo(() => {
    const map: Record<string, string> = {};
    schemas.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [schemas]);

  const columns = useMemo(
    () => [
      {
        id: "chapter",
        header: "Chapter",
        render: (item: ChapterOverride) => item.chapter.title,
      },
      {
        id: "schema",
        header: "Schema",
        render: (item: ChapterOverride) =>
          schemaMap[item.schemaId] || item.schemaId,
      },
      {
        id: "free",
        header: "Free (€)",
        render: (item: ChapterOverride) => formatPrice(item.priceFreeToRead),
        align: "right" as const,
      },
      {
        id: "paywall",
        header: "Paywall (€)",
        render: (item: ChapterOverride) => formatPrice(item.pricePaywall),
        align: "right" as const,
      },
      {
        id: "epilogue",
        header: "Epilogue (€)",
        render: (item: ChapterOverride) => formatPrice(item.priceEpilogue),
        align: "right" as const,
      },
      {
        id: "reason",
        header: "Reason",
        render: (item: ChapterOverride) => item.reason || "-",
      },
      {
        id: "status",
        header: "Active",
        render: (item: ChapterOverride) => (
          <span
            className={`px-2 py-1 rounded text-sm ${
              item.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-700"
            }`}>
            {item.isActive ? "Yes" : "No"}
          </span>
        ),
        align: "center" as const,
        defaultVisible: false,
      },
    ],
    [schemaMap]
  );

  const actions = useMemo(
    () => [
      {
        onClick: (override: ChapterOverride) => {
          setFormData({
            schemaId: override.schemaId,
            priceFreeToRead: override.priceFreeToRead,
            pricePaywall: override.pricePaywall,
            priceEpilogue: override.priceEpilogue,
            reason: override.reason || "",
          });
          setEditingId(override.chapterId);
          setShowForm(true);
        },
        render: (override: ChapterOverride) => (
          <ActionButton
            icon={<MdEdit />}
            onClick={() => {
              setFormData({
                schemaId: override.schemaId,
                priceFreeToRead: override.priceFreeToRead,
                pricePaywall: override.pricePaywall,
                priceEpilogue: override.priceEpilogue,
                reason: override.reason || "",
              });
              setEditingId(override.chapterId);
              setShowForm(true);
            }}
            ariaLabel="Editer l'override"
            variant="blue"
          />
        ),
      },
      {
        onClick: (override: ChapterOverride) =>
          handleDelete(override.chapterId),
        render: (override: ChapterOverride) => (
          <ActionButton
            icon={<MdDelete />}
            onClick={() => handleDelete(override.chapterId)}
            ariaLabel="Supprimer l'override"
            variant="red"
          />
        ),
      },
    ],
    []
  );

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Panneau d'information explicatif */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-indigo-500"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-indigo-800 mb-1">
              Prix par chapitre - Exceptions
            </h3>
            <div className="text-sm text-indigo-700 space-y-1">
              <p>
                <strong>Fonction :</strong> Définir des prix spécifiques pour
                certains chapitres (remplace le schéma par défaut).
              </p>
              <p>
                <strong>Héritage :</strong> Laisser un prix à NULL = utilise le
                prix du schéma de référence.
              </p>
              <p>
                <strong>Impact :</strong> L'override est prioritaire sur le
                schéma actif. Utile pour promotions ou tarifs spéciaux.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chapter Price Overrides</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              schemaId: "",
              priceFreeToRead: null,
              pricePaywall: null,
              priceEpilogue: null,
              reason: "",
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          title="Créer une exception de prix pour un chapitre spécifique">
          New Override
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Override" : "Create New Override"}
          </h2>

          {/* Résumé de l'impact */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-sm">
            <p className="text-yellow-800">
              <strong>🎯 Impact :</strong> Cet override sera prioritaire sur le
              schéma actif pour ce chapitre uniquement.
            </p>
          </div>

          {/* Explication de l'héritage NULL */}
          <div className="bg-blue-50 border border-blue-200 p-3 mb-4 text-sm rounded">
            <p className="text-blue-800">
              <strong>🔗 Astuce :</strong> Laissez un prix vide (NULL) pour
              hériter automatiquement du prix du schéma sélectionné.
              <br />
              <span className="text-xs">
                Ex: Override uniquement le paywall, les autres prix viendront du
                schéma.
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Chapter
                    <span className="text-xs text-gray-500 ml-2">
                      (Chapitre concerné par l'override)
                    </span>
                  </label>
                  <select
                    required
                    value={formData.chapterId}
                    onChange={(e) =>
                      setFormData({ ...formData, chapterId: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    title="Choisissez le chapitre à overrider">
                    <option value="">Select a chapter</option>
                    {chapters.map((chapter) => (
                      <option
                        key={chapter.id}
                        value={chapter.id}>
                        {chapter.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Schema
                  <span className="text-xs text-gray-500 ml-2">
                    (Schéma de référence pour les valeurs NULL)
                  </span>
                </label>
                <select
                  required
                  value={formData.schemaId}
                  onChange={(e) =>
                    setFormData({ ...formData, schemaId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  title="Choisissez le schéma dont ce chapitre héritera les prix NULL">
                  <option value="">Select a schema</option>
                  {schemas.map((schema) => (
                    <option
                      key={schema.id}
                      value={schema.id}>
                      {schema.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Reason
                  <span className="text-xs text-gray-500 ml-2">
                    (Pourquoi cet override ? Ex: promotion, prix spécial)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="e.g., Special launch, Bestseller"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Free to Read (€)
                  <span className="text-xs text-green-600 ml-2">
                    ✓ Vide = hérite du schéma
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.priceFreeToRead || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceFreeToRead: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Laisser vide pour utiliser le schéma"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Paywall (€)
                  <span className="text-xs text-green-600 ml-2">
                    ✓ Vide = hérite du schéma
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.pricePaywall || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePaywall: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Laisser vide pour utiliser le schéma"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Epilogue (€)
                  <span className="text-xs text-green-600 ml-2">
                    ✓ Vide = hérite du schéma
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.priceEpilogue || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceEpilogue: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Laisser vide pour utiliser le schéma"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <SmartTableGrid
        listName="chapter-overrides"
        data={overrides}
        columns={columns}
        actions={actions}
        getItemId={(item) => item.id}
        loading={loading}
        emptyMessage="Aucun override trouvé"
      />
    </div>
  );
}
