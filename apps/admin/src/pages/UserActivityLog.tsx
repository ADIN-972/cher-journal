import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { api } from "../lib/api";
import {
  MdArrowBack,
  MdCalendar,
  MdShoppingCart,
  MdUnlock,
} from "react-icons/md";

interface UserActivity {
  id: string;
  userId: string;
  type: "ORDER" | "ENTITLEMENT" | "UNLOCK" | "LOGIN" | "LOGOUT";
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityUser {
  id: string;
  email: string;
  _count: {
    orders: number;
    entitlements: number;
  };
}

export default function UserActivityLog() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ActivityUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
      if (response.data.length > 0) {
        setSelectedUserId(response.data[0].id);
      }
    } catch (error) {
      toast.error(t("messages.error.load_users"));
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async (userId: string) => {
    try {
      // Placeholder - ce endpoint devrait être créé
      // Pour l'instant, on affiche une information
      setActivities([]);
    } catch (error) {
      toast.error("Erreur lors du chargement de l'historique");
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <MdShoppingCart className="text-blue-600" />;
      case "ENTITLEMENT":
        return <MdUnlock className="text-green-600" />;
      case "UNLOCK":
        return <MdUnlock className="text-yellow-600" />;
      default:
        return <MdCalendar className="text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("messages.loading")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/users")}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition mb-4">
          <MdArrowBack className="text-xl text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold">
          Historique des activités utilisateurs
        </h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Users List Sidebar */}
        <div className="bg-white rounded-lg shadow p-4 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Utilisateurs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedUserId === user.id
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-100"
                }`}>
                <div className="font-medium text-sm">{user.email}</div>
                <div className="text-xs opacity-75">
                  {user._count.orders} commandes
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Activités récentes
          </h2>

          {activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <MdCalendar className="mx-auto text-4xl opacity-20" />
              </div>
              <p>Aucune activité enregistrée pour cet utilisateur</p>
              <p className="text-sm mt-2">
                (Nota: Ce module est en préparation)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {activity.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {activity.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
