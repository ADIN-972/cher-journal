import React, { useEffect, useMemo, useState } from "react";
import { MdEdit } from "react-icons/md";
import ActionButton from "../components/ActionButton";
import { useApi } from "../hooks/useApi";
import { PriceSchema } from "@cher-journal/types";
import SmartTableGrid from "../components/SmartTableGrid";

export default function PriceSchemasPage() {
  const api = useApi();
  const [schemas, setSchemas] = useState<PriceSchema[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceFreeToRead: 199,
    pricePaywall: 299,
    priceEpilogue: 399,
    priceProtagonistUnlock: 99,
    appliedFrom: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    appliedTo: "", // Nouvelle date de fin (optionnelle)
  });

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/price-schemas");
      // Handle both formats: array directly or { data: [...] }
      const data = Array.isArray(response) ? response : response.data || [];
      setSchemas(data);
    } catch (error) {
      console.error("Failed to fetch schemas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        appliedFrom: formData.appliedFrom
          ? new Date(formData.appliedFrom)
          : undefined,
        appliedTo: formData.appliedTo ? new Date(formData.appliedTo) : null,
      };
      if (editingId) {
        await api.patch(`/admin/price-schemas/${editingId}`, payload);
      } else {
        await api.post("/admin/price-schemas", payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        priceFreeToRead: 199,
        pricePaywall: 299,
        priceEpilogue: 399,
        priceProtagonistUnlock: 99,
        appliedFrom: new Date().toISOString().slice(0, 10),
        appliedTo: "",
      });
      await fetchSchemas();
    } catch (error) {
      console.error("Failed to save schema:", error);
    }
  };

  const handleEdit = (schema: PriceSchema) => {
    setFormData({
      name: schema.name,
      description: schema.description || "",
      priceFreeToRead: schema.priceFreeToRead,
      pricePaywall: schema.pricePaywall,
      priceEpilogue: schema.priceEpilogue,
      priceProtagonistUnlock: (schema as any).priceProtagonistUnlock || 99,
      appliedFrom: schema.appliedFrom
        ? new Date(schema.appliedFrom).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      appliedTo: schema.appliedTo
        ? new Date(schema.appliedTo).toISOString().slice(0, 10)
        : "",
    });
    setEditingId(schema.id);
    setShowForm(true);
  };

  const handleToggleActive = async (schema: PriceSchema) => {
    try {
      if (schema.isActive) {
        await api.post(`/admin/price-schemas/${schema.id}/deactivate`);
      } else {
        await api.post(`/admin/price-schemas/${schema.id}/activate`);
      }
      await fetchSchemas();
    } catch (error) {
      console.error("Failed to toggle schema:", error);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const filteredSchemas = useMemo(() => {
    if (statusFilter === "ACTIVE") return schemas.filter((s) => s.isActive);
    if (statusFilter === "INACTIVE") return schemas.filter((s) => !s.isActive);
    return schemas;
  }, [schemas, statusFilter]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessor: "name" as const,
      },
      {
        id: "free",
        header: "Free (€)",
        render: (item: PriceSchema) => `${formatPrice(item.priceFreeToRead)}€`,
        align: "right" as const,
      },
      {
        id: "paywall",
        header: "Paywall (€)",
        render: (item: PriceSchema) => `${formatPrice(item.pricePaywall)}€`,
        align: "right" as const,
      },
      {
        id: "epilogue",
        header: "Epilogue (€)",
        render: (item: PriceSchema) => `${formatPrice(item.priceEpilogue)}€`,
        align: "right" as const,
      },
      {
        id: "protagonist",
        header: "Protagonist (€)",
        render: (item: PriceSchema) => `${formatPrice((item as any).priceProtagonistUnlock || 99)}€`,
        align: "right" as const,
      },
      {
        id: "status",
        header: "Status",
        render: (item: PriceSchema) => (
          <span
            className={`px-2 py-1 rounded text-sm ${
              item.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-300 text-gray-800"
            }`}>
            {item.isActive ? "Active" : "Inactive"}
          </span>
        ),
        align: "center" as const,
      },
      {
        id: "appliedFrom",
        header: "Applied From",
        render: (item: PriceSchema) =>
          item.appliedFrom
            ? new Date(item.appliedFrom).toLocaleDateString()
            : "-",
      },
      {
        id: "appliedTo",
        header: "Applied To",
        render: (item: PriceSchema) =>
          item.appliedTo ? new Date(item.appliedTo).toLocaleDateString() : "-",
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        onClick: (schema: PriceSchema) => handleEdit(schema),
        render: (schema: PriceSchema) => (
          <ActionButton
            icon={<MdEdit />}
            onClick={() => handleEdit(schema)}
            ariaLabel="Editer le schéma"
            variant="blue"
          />
        ),
      },
      {
        onClick: (schema: PriceSchema) => handleToggleActive(schema),
        render: (schema: PriceSchema) => (
          <button
            onClick={() => handleToggleActive(schema)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{
              backgroundColor: schema.isActive ? "#10b981" : "#d1d5db",
            }}
            title={schema.isActive ? "Désactiver" : "Activer"}>
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              style={{
                transform: schema.isActive
                  ? "translateX(24px)"
                  : "translateX(4px)",
              }}
            />
          </button>
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
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-500"
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
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Schémas de prix - Modèles par défaut
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>Fonction :</strong> Définir les prix par défaut
                appliqués à tous les chapitres.
              </p>
              <p>
                <strong>Impact :</strong> Un seul schéma peut être actif à la
                fois. Tous les chapitres sans override utiliseront ces prix.
              </p>
              <p>
                <strong>Action :</strong> Créez un nouveau schéma pour changer
                les prix globalement, puis activez-le.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Price Schemas</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              priceFreeToRead: 199,
              pricePaywall: 299,
              priceEpilogue: 399,
              priceProtagonistUnlock: 99,
              appliedFrom: new Date().toISOString().slice(0, 10),
              appliedTo: "",
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          title="Créer un nouveau modèle de tarification par défaut">
          New Schema
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Schema" : "Create New Schema"}
          </h2>

          {/* Résumé de l'impact */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-sm">
            <p className="text-yellow-800">
              {editingId ? (
                <>
                  <strong>⚠️ Attention :</strong> La modification de ce schéma
                  affectera tous les chapitres qui l'utilisent (sans override
                  spécifique).
                </>
              ) : (
                <>
                  <strong>ℹ️ Info :</strong> Ce nouveau schéma sera créé
                  inactif. Activez-le ensuite pour l'appliquer aux chapitres.
                </>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name
                  <span className="text-xs text-gray-500 ml-2">
                    (Identifiant du schéma)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ex: Tarifs Q1 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                  <span className="text-xs text-gray-500 ml-2">
                    (Optionnel - contexte du schéma)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ex: Nouvelle grille tarifaire pour 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Free to Read (¢ cents)
                  <span className="text-xs text-gray-500 ml-2">
                    (Prix lecture gratuite en centimes)
                  </span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.priceFreeToRead}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceFreeToRead: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="199"
                />
                <p className="text-xs text-gray-500 mt-1">
                  = {formatPrice(formData.priceFreeToRead || 0)} €
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Paywall (¢ cents)
                  <span className="text-xs text-gray-500 ml-2">
                    (Accès aux volumes payants)
                  </span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.pricePaywall}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePaywall: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="299"
                />
                <p className="text-xs text-gray-500 mt-1">
                  = {formatPrice(formData.pricePaywall || 0)} €
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Epilogue (¢ cents)
                  <span className="text-xs text-gray-500 ml-2">
                    (Accès au dernier volume / épilogue)
                  </span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.priceEpilogue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceEpilogue: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="399"
                />
                <p className="text-xs text-gray-500 mt-1">
                  = {formatPrice(formData.priceEpilogue || 0)} €
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Protagonist Perspective (¢ cents)
                  <span className="text-xs text-gray-500 ml-2">
                    (Déverrouillage perspective protagoniste)
                  </span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.priceProtagonistUnlock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceProtagonistUnlock: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="99"
                />
                <p className="text-xs text-gray-500 mt-1">
                  = {formatPrice(formData.priceProtagonistUnlock || 99)} €
                </p>
              </div>

              {/* Ligne combinée pour appliedFrom et appliedTo */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date d'application
                  </label>
                  <input
                    type="date"
                    value={formData.appliedFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, appliedFrom: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    La date à partir de laquelle ce schéma de prix devient
                    effectif. Les prix seront appliqués à partir de ce jour à
                    tous les chapitres sans override.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date de fin d'application
                  </label>
                  <input
                    type="date"
                    value={formData.appliedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, appliedTo: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    (Optionnel) Après cette date, ce schéma ne sera plus utilisé
                    pour les chapitres. Laissez vide pour une durée illimitée.
                  </p>
                </div>
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
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <SmartTableGrid
        listName="price-schemas"
        data={filteredSchemas}
        columns={columns}
        actions={actions}
        getItemId={(item) => item.id}
        loading={loading}
        emptyMessage="Aucun schéma de prix trouvé. Créez-en un pour commencer."
        isActiveField="isActive"
        toggleConfig={{
          ariaLabel: "Filtrer par statut",
          value: statusFilter,
          onChange: (v) => setStatusFilter(v as "ALL" | "ACTIVE" | "INACTIVE"),
          options: [
            { value: "ALL", label: "Tous" },
            { value: "ACTIVE", label: "Actifs" },
            { value: "INACTIVE", label: "Inactifs" },
          ],
        }}
      />
    </div>
  );
}
