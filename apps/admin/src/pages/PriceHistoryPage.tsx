import { useEffect, useMemo, useState } from "react";
import { MdVisibility } from "react-icons/md";
import ActionButton from "../components/ActionButton";
import HistoryTimeline, {
  HistoryTimelineNode,
} from "../components/HistoryTimeline";
import { useApi } from "../hooks/useApi";
import SmartTableGrid from "../components/SmartTableGrid";

interface PriceHistory {
  id: string;
  entityType: "SCHEMA" | "OVERRIDE";
  entityId: string;
  previousValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  changeReason?: string;
  changedBy: string;
  changedAt: string;
}

export default function PriceHistoryPage() {
  const api = useApi();
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"SCHEMA" | "OVERRIDE" | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [align, setAlign] = useState<"left" | "right" | "alternate">("left");

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/price-history");
      // Handle both formats: array directly or { data: [...] }
      const data = Array.isArray(response) ? response : response.data || [];
      const filtered =
        filter === "ALL"
          ? data
          : data.filter((h: PriceHistory) => h.entityType === filter);
      setHistory(filtered);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const columns = useMemo(
    () => [
      {
        id: "type",
        header: "Type",
        render: (item: PriceHistory) => (
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              item.entityType === "SCHEMA"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}>
            {item.entityType}
          </span>
        ),
        align: "center" as const,
      },
      {
        id: "reason",
        header: "Reason",
        render: (item: PriceHistory) =>
          item.changeReason || "No reason provided",
      },
      {
        id: "who",
        header: "Changed By",
        render: (item: PriceHistory) => item.changedBy,
      },
      {
        id: "when",
        header: "Date",
        render: (item: PriceHistory) => formatDate(item.changedAt),
      },
      {
        id: "entity",
        header: "Entity Id",
        render: (item: PriceHistory) => item.entityId,
        defaultVisible: false,
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        onClick: (item: PriceHistory) =>
          setExpandedId((prev) => (prev === item.id ? null : item.id)),
        render: (item: PriceHistory) => (
          <ActionButton
            icon={<MdVisibility />}
            onClick={() =>
              setExpandedId((prev) => (prev === item.id ? null : item.id))
            }
            ariaLabel="Voir les détails"
            variant="indigo"
          />
        ),
      },
    ],
    []
  );

  // Utility function for future use displaying formatted values
  // const formatValue = (value: any) => {
  //   if (value === null) return "null";
  //   if (typeof value === "object") return JSON.stringify(value, null, 2);
  //   if (typeof value === "number" && value < 1000) {
  //     // Likely a price in cents
  //     return `$${(value / 100).toFixed(2)}`;
  //   }
  //   return String(value);
  // };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  // Regrouper par entityId + entityType et ne garder que la dernière modif pour l'affichage principal
  const latestByEntity = Object.values(
    history.reduce(
      (acc, h) => {
        const key = h.entityId + "-" + h.entityType;
        if (!acc[key] || new Date(h.changedAt) > new Date(acc[key].changedAt)) {
          acc[key] = h;
        }
        return acc;
      },
      {} as Record<string, PriceHistory>
    )
  );

  // Pour le détail, regrouper toutes les modifs du même entityId+entityType, triées par date ASC
  const getTimelineNodes = (
    entityId: string,
    entityType: string
  ): HistoryTimelineNode[] => {
    return history
      .filter((h) => h.entityId === entityId && h.entityType === entityType)
      .sort(
        (a, b) =>
          new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
      )
      .map((h) => ({
        label:
          h.entityType === "SCHEMA"
            ? "Modification du schéma"
            : "Override de chapitre",
        date: formatDate(h.changedAt),
        before: h.previousValues ?? undefined,
        after: h.newValues ?? undefined,
      }));
  };

  return (
    <div className="p-6">
      {/* Panneau d'information explicatif */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-purple-500"
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
            <h3 className="text-sm font-medium text-purple-800 mb-1">
              Historique des prix - Audit complet
            </h3>
            <div className="text-sm text-purple-700 space-y-1">
              <p>
                <strong>Fonction :</strong> Traçabilité totale de tous les
                changements de prix (schémas et overrides).
              </p>
              <p>
                <strong>Usage :</strong> Vérifier qui a modifié quoi et quand,
                utile pour audit et réconciliation.
              </p>
              <p>
                <strong>Impact :</strong> Lecture seule - aucune modification
                possible. Les entrées sont immuables.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Price Change History</h1>

        {/* Explication des filtres */}
        <div className="text-sm text-gray-600 mb-3">
          <strong>Filtrer par :</strong> Afficher uniquement les changements de
          schémas, d'overrides, ou tout voir.
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            title="Afficher tous les changements (schémas + overrides)">
            All ({history.length})
          </button>
          <button
            onClick={() => setFilter("SCHEMA")}
            className={`px-4 py-2 rounded ${
              filter === "SCHEMA"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            title="Afficher uniquement les changements de schémas de prix">
            Schema Changes
          </button>
          <button
            onClick={() => setFilter("OVERRIDE")}
            className={`px-4 py-2 rounded ${
              filter === "OVERRIDE"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            title="Afficher uniquement les changements d'overrides de chapitres">
            Override Changes
          </button>
        </div>
      </div>

      {/* Légende explicative */}
      <div className="bg-gray-50 border border-gray-200 p-3 mb-4 rounded text-sm">
        <p className="text-gray-700">
          <strong>📋 Lecture :</strong> Cliquez sur une entrée pour voir le
          détail des changements (avant/après). Les valeurs sont en centimes
          pour les prix.
        </p>
      </div>

      <SmartTableGrid
        listName="price-history"
        data={latestByEntity}
        columns={columns}
        actions={actions}
        getItemId={(item) => item.id}
        loading={loading}
        emptyMessage="No price history found"
      />

      {expandedId && (
        <div className="mt-4 border border-gray-300 rounded-lg bg-white">
          {(() => {
            const entry = history.find((h) => h.id === expandedId);
            if (!entry) return null;
            const nodes = getTimelineNodes(entry.entityId, entry.entityType);
            return (
              <div className="p-4">
                <div className="mb-3 text-sm text-gray-700">
                  <strong>Détails :</strong>{" "}
                  {entry.changeReason || "No reason provided"}
                </div>
                <HistoryTimeline nodes={nodes} />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
