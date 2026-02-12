import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import PromotionCard from "../components/PromotionCard";
import FloatingActionButton from "../components/FloatingActionButton";
import {
  MdAdd,
  MdFilterList,
  MdCheckCircle,
  MdAccessTime,
  MdBlock,
} from "react-icons/md";

interface Promotion {
  id: string;
  name: string;
  description?: string;
  scope: string;
  type: string;
  value?: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  targetType: string;
  targetedUsersCount?: number;
  _count?: {
    applied: number;
  };
}

type FilterType = "ALL" | "ACTIVE" | "EXPIRED" | "INACTIVE";

export default function Promotions() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ACTIVE");

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await api.get("/admin/promotions");
      if (response.data.success) {
        setPromotions(response.data.data.promotions || []);
      }
    } catch (error) {
      console.error("Failed to load promotions:", error);
      toast.error("Erreur lors du chargement des promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/promotions/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette promotion ?"
      )
    ) {
      return;
    }

    try {
      const response = await api.delete(`/admin/promotions/${id}`);
      if (response.data.success) {
        toast.success("Promotion supprimée avec succès");
        loadPromotions();
      }
    } catch (error: any) {
      console.error("Failed to delete promotion:", error);
      toast.error(
        error.response?.data?.error?.message ||
          "Erreur lors de la suppression"
      );
    }
  };

  const handleCreate = () => {
    navigate("/promotions/new");
  };

  const filteredPromotions = promotions.filter((promo) => {
    const now = new Date();
    const isExpired = new Date(promo.endsAt) < now;

    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return promo.isActive && !isExpired;
    if (filter === "EXPIRED") return isExpired;
    if (filter === "INACTIVE") return !promo.isActive && !isExpired;
    return true;
  });

  const stats = {
    total: promotions.length,
    active:
      promotions.filter(
        (p) => p.isActive && new Date(p.endsAt) >= new Date()
      ).length,
    expired: promotions.filter((p) => new Date(p.endsAt) < new Date()).length,
    inactive:
      promotions.filter(
        (p) => !p.isActive && new Date(p.endsAt) >= new Date()
      ).length,
    totalImpacted: promotions.reduce(
      (sum, p) => sum + (p.targetedUsersCount || 0),
      0
    ),
    totalApplied: promotions.reduce(
      (sum, p) => sum + (p._count?.applied || 0),
      0
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-gray-500 mt-1">
            Gérez vos promotions et codes promo
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <MdAdd size={20} />
          <span>Nouvelle promotion</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Promotions</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MdFilterList className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Utilisateurs Ciblés</div>
              <div className="text-2xl font-bold">
                {stats.totalImpacted.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <MdCheckCircle className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Fois Appliquées</div>
              <div className="text-2xl font-bold">{stats.totalApplied}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MdAccessTime className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      {filteredPromotions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <MdBlock size={64} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune promotion trouvée
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === "ALL"
              ? "Commencez par créer votre première promotion"
              : `Aucune promotion ${filter === "ACTIVE" ? "active" : filter === "EXPIRED" ? "expirée" : "inactive"}`}
          </p>
          {filter === "ALL" && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <MdAdd size={20} />
              <span>Créer une promotion</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPromotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        sections={[
          {
            title: "Filtrer",
            actions: [
              {
                label: "Toutes",
                icon: <MdFilterList />,
                onClick: () => setFilter("ALL"),
                variant: filter === "ALL" ? "primary" : "secondary",
                badge: stats.total,
              },
              {
                label: "Actives",
                icon: <MdCheckCircle />,
                onClick: () => setFilter("ACTIVE"),
                variant: filter === "ACTIVE" ? "primary" : "secondary",
                badge: stats.active,
              },
              {
                label: "Expirées",
                icon: <MdAccessTime />,
                onClick: () => setFilter("EXPIRED"),
                variant: filter === "EXPIRED" ? "primary" : "secondary",
                badge: stats.expired,
              },
              {
                label: "Inactives",
                icon: <MdBlock />,
                onClick: () => setFilter("INACTIVE"),
                variant: filter === "INACTIVE" ? "primary" : "secondary",
                badge: stats.inactive,
              },
            ],
          },
          {
            title: "Actions",
            actions: [
              {
                label: "Nouvelle promotion",
                icon: <MdAdd />,
                onClick: handleCreate,
                variant: "primary",
              },
            ],
          },
        ]}
      />
    </div>
  );
}
